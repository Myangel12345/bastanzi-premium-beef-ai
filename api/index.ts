import express, { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import { Resend } from 'resend';
import {
  saveContactMessage,
  ContactMessage,
  getContactMessages,
  addSubscriber,
  getSubscribers,
  getProducts,
  saveProduct,
  deleteProduct,
  ProductItem,
  getTestimonials,
  saveTestimonial,
  deleteTestimonial,
  TestimonialItem,
  getOrders,
  saveOrder,
  deleteOrder,
  ShipmentOrder,
  getOrderByIdOrTracking,
} from './lib/db.js';
import { sendEmail, getBrandedEmailWrapper } from './lib/email.js';
import { validateCredentials, generateAdminToken, verifyAdminToken } from './lib/auth.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global CORS & Header Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Helper for admin auth check
function requireAdmin(req: Request, res: Response): boolean {
  const authHeader = req.headers.authorization || (req.body && req.body.token);
  const session = verifyAdminToken(authHeader as string);

  if (!session) {
    res.status(401).json({
      error: 'Unauthorized: Admin authentication token required',
      message: 'Access denied. Please log in with valid admin credentials.',
    });
    return false;
  }
  return true;
}

// ==========================================
// 1. HEALTH CHECK
// ==========================================
app.get('/api/health', (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ok',
    service: 'Bastanzi Premium Beef Co. API (Single Vercel Function)',
    time: new Date().toISOString(),
    supabaseConfigured: Boolean(process.env.SUPABASE_URL),
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
  });
});

// ==========================================
// 2. AI ASSISTANT (GEMINI)
// ==========================================
app.post('/api/assistant', async (req: Request, res: Response) => {
  try {
    const { prompt, history } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt string is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        reply: getDynamicFallbackAnswer(prompt, history),
        simulated: true,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are the Master Cattle & Beef Concierge for Bastanzi Premium Beef Co., located in Sheridan, Montana. Your role is to provide expert, warm, natural, and helpful advice to customers regarding our pasture-raised, grass & grain finished beef shares.

Knowledge Base:
1. Beef Shares & Pricing:
   - Quarter Share: ~100-115 lbs packaged beef ($1,150). Ideal for small families (1-3 people). Requires ~4.0 cu ft freezer.
   - Half Share: ~200-230 lbs packaged beef ($2,200). Most popular. Custom butcher cut sheet options. Requires ~8.0 cu ft freezer.
   - Whole Share: ~400-460 lbs packaged beef ($4,200). Best value for large families or co-ops. Full custom cut sheet. Requires ~16.0 cu ft freezer.
   - Eighth Sampler: ~50-58 lbs packaged beef ($620). Fits in standard refrigerator freezer (~2.0 cu ft).
2. Hanging Weight vs Packaged Weight:
   - Hanging weight is the weight of the carcass after harvest & skinning before dry-aging and trimming.
   - Packaged (take-home) weight is ~60% to 65% of the hanging weight after dry aging (14-21 days) and bone/fat trimming. We quote and sell based on actual take-home cut packages or transparent hanging estimates!
3. Available Cuts:
   - Steaks: Ribeye, New York Strip, Tenderloin/Filet Mignon, T-Bone, Porterhouse, Sirloin, Flank, Skirt.
   - Roasts: Chuck Roast, Prime Rib, Arm Roast, Rump Roast, Brisket, Short Ribs, Stew Meat.
   - Burger: 85/15 lean-to-fat ratio artisan ground beef vacuum sealed in 1 lb packages.
4. USDA Processing & Quality:
   - Processed in a federally inspected USDA facility.
   - Aged for 14-21 days for maximum tenderness and deep flavor development.
   - Heavy-duty vacuum-sealed in 4mil protective film (prevents freezer burn up to 2 years).
   - Flash-frozen at -20°F.
5. Shipping, Delivery & Pickup:
   - Shipped via OGFCARGO Cold Chain Logistics in heavy insulated eco-coolers with dry ice. Guaranteed frozen arrival!
   - Pickup options available directly at Sheridan Ranch Station, MT or partner USDA processor facilities.
6. Ordering & Payment:
   - Reserve online with 50% deposit or full payment.
   - Major credit cards, Apple Pay, electronic check accepted.
7. Farm Practices:
   - Pasture-raised in Montana valleys with clean mountain water. No added growth hormones, no subtherapeutic antibiotics.
   - Choose between 100% Grass-Fed & Finished (leaner, earthy flavor) or Pasture-Raised Grain-Finished (rich marbling and buttery flavor).

Behavior Guidelines:
- Answer naturally and directly. Do NOT repeat fixed scripts.
- Speak conversationally like a knowledgeable Montana rancher and master butcher.
- Ask relevant follow-up questions when helpful (e.g., asking about household size, freezer space, or cooking preferences).
- Only advise contacting customer service if a specific custom request cannot be answered by standard knowledge.`;

    let contents: any = prompt;
    if (Array.isArray(history) && history.length > 0) {
      const formattedHistory = history.map((item: any) => ({
        role: item.role === 'user' ? 'user' : 'model',
        parts: [{ text: item.text || item.content }],
      }));
      formattedHistory.push({ role: 'user', parts: [{ text: prompt }] });
      contents = formattedHistory;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Thank you for reaching out to Bastanzi Beef. How else can I assist you with your beef share selection today?';

    return res.status(200).json({ reply, success: true });
  } catch (err: any) {
    console.error('Gemini Assistant error:', err);
    return res.status(200).json({
      reply: getDynamicFallbackAnswer(req.body?.prompt || '', req.body?.history),
      error: err.message,
    });
  }
});

function getDynamicFallbackAnswer(prompt: string, history?: any[]): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('hanging') || lower.includes('yield') || lower.includes('packaged weight') || lower.includes('cut weight')) {
    return 'Hanging weight refers to the carcass weight right after harvest before dry aging and trimming. When dry-aged (14-21 days) and butchered, your actual packaged take-home beef yield is typically about 60% to 65% of hanging weight. For example, a 200 lb hanging quarter share yields ~110-120 lbs of cut, vacuum-sealed meat in your freezer! Do you have a specific share size in mind?';
  }

  if (lower.includes('freezer') || lower.includes('storage') || lower.includes('cu ft') || lower.includes('cubic')) {
    return 'A general rule of thumb is 1 cubic foot of freezer space per 35-40 lbs of packaged beef. A Quarter share (~100 lbs) needs about 3.5 to 4 cubic feet (a small chest freezer), a Half share (~200 lbs) needs 8 cubic feet, and a Whole share needs ~16 cubic feet. Would you like help calculating freezer space for your household?';
  }

  if (lower.includes('usda') || lower.includes('process') || lower.includes('butcher') || lower.includes('dry age') || lower.includes('age')) {
    return 'All Bastanzi cattle are processed in a USDA-inspected facility. Our beef undergoes a dry-aging process for 14 to 21 days to enhance tenderness and flavor, then each cut is individually vacuum-sealed in 4mil heavy packaging and flash-frozen at -20°F. Would you like to know more about custom cut sheet choices?';
  }

  if (lower.includes('cut') || lower.includes('ribeye') || lower.includes('steak') || lower.includes('ground') || lower.includes('roast')) {
    return 'Our beef shares include a balanced selection of luxury cuts: Ribeyes, New York Strips, Filet Mignon/Tenderloin, T-Bones (on half & whole shares), Chuck and Rump Roasts, Brisket, Short Ribs, and 85/15 artisan ground beef in 1 lb vacuum packs. Are you looking for specific cuts for grilling or slow-cooking?';
  }

  if (lower.includes('ship') || lower.includes('delivery') || lower.includes('pickup') || lower.includes('track') || lower.includes('carrier')) {
    return 'We ship directly to your door using OGFCARGO Cold Chain Logistics inside heavy dry-ice insulated eco-coolers. You will receive a tracking waybill (OGF-XXXXXXX) to monitor real-time shipping. Pickup is also available at our Sheridan, MT ranch station or local processing center! Where are you located?';
  }

  if (lower.includes('price') || lower.includes('cost') || lower.includes('deposit') || lower.includes('pay')) {
    return 'Our pricing is all-inclusive with no hidden butcher fees: Quarter Share is $1,150 (~$10-11/lb take-home), Half Share is $2,200, Whole Share is $4,200, and our Eighth Sampler is $620. We accept online reservations with a 50% deposit or full payment. Would you like to place a reservation?';
  }

  if (lower.includes('grass') || lower.includes('grain') || lower.includes('finish') || lower.includes('practice') || lower.includes('farm') || lower.includes('ranch')) {
    return 'We raise all cattle on lush Montana pastures without added growth hormones or antibiotics. We offer two finishing styles: 100% Grass-Fed & Finished (leaner, rich natural flavor) and Pasture-Raised Grain-Finished (exceptional marbling and buttery tenderness). Which flavor profile does your family prefer?';
  }

  return 'Welcome to Bastanzi Premium Beef Co.! I can answer questions regarding our Quarter, Half, and Whole beef shares, available cuts, USDA dry-aging process, freezer storage requirements, or OGFCARGO cold chain shipping. What topic would you like to explore today?';
}

// ==========================================
// 3. BEEF SHARE RESERVATION
// ==========================================
app.post('/api/reserve', async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      zip,
      shareSize,
      finish,
      preferredDeliveryDate,
      notes,
    } = req.body || {};

    if (!name || !email || !phone || !shareSize) {
      return res.status(400).json({ error: 'Missing required reservation fields (Name, Email, Phone, Share Size).' });
    }

    const reservationId = 'RES-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const createdAt = new Date().toISOString();

    const reservationRecord: ShipmentOrder = {
      id: reservationId,
      trackingNumber: `OGF-${reservationId.replace('RES-', '')}`,
      name,
      email,
      phone,
      address: address || '',
      city: city || '',
      state: state || '',
      zip: zip || '',
      shareSize,
      finish: finish || 'Pasture-Raised Grain-Finished',
      notes: notes || '',
      createdAt,
      updated_at: createdAt,
      status: 'Order received',
      origin: 'Bastanzi Ranch - Sheridan, MT',
      destination: `${city || ''}, ${state || ''}`.trim() || 'Destination Address',
      carrier: 'OGFCARGO Cold Chain Logistics',
      estimatedDelivery: preferredDeliveryDate || 'In 3-5 Business Days',
      totalAmount: shareSize.toLowerCase().includes('whole') ? 4200 : shareSize.toLowerCase().includes('half') ? 2200 : 1150,
      paymentStatus: 'Deposit Paid',
    };

    // Save to master orders / database
    await saveOrder(reservationRecord);

    // Initialize Resend if API key exists
    const resendApiKey = process.env.RESEND_API_KEY || '';
    const resend = resendApiKey ? new Resend(resendApiKey) : null;
    const notificationEmail = process.env.NOTIFICATION_EMAIL || 'orders@bastanzibeef.com';

    let emailStatus = 'Not configured (Simulated Success)';
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Bastanzi Beef Orders <orders@bastanzibeef.com>',
          to: [notificationEmail, email],
          subject: `✨ New Beef Share Reservation #${reservationId} - Bastanzi Premium Beef Co.`,
          html: `
            <div style="font-family: 'Georgia', serif; background-color: #0c0c0e; color: #f4f4f6; padding: 40px; border-radius: 8px; border: 1px solid #d4af37;">
              <h1 style="color: #d4af37; margin-bottom: 8px;">BASTANZI PREMIUM BEEF CO.</h1>
              <p style="text-transform: uppercase; letter-spacing: 2px; color: #a1a1aa; font-size: 12px;">Pasture to Table Luxury Beef Reservation</p>
              <hr style="border-color: #27272a; margin: 20px 0;" />
              
              <h2 style="color: #ffffff;">Reservation Summary #${reservationId}</h2>
              <p><strong>Customer:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Address:</strong> ${address || ''}, ${city || ''}, ${state || ''} ${zip || ''}</p>
              <p><strong>Selected Share Size:</strong> <span style="color: #d4af37; font-weight: bold;">${shareSize} Beef Share</span></p>
              <p><strong>Finishing Preference:</strong> ${finish || 'Standard'}</p>
              <p><strong>Preferred Delivery Date:</strong> ${preferredDeliveryDate || 'As soon as available'}</p>
              <p><strong>Special Butcher Notes:</strong> ${notes || 'None specified'}</p>
              
              <div style="background-color: #18181b; padding: 20px; border-left: 4px solid #d4af37; margin-top: 25px;">
                <p style="margin: 0; color: #d4af37; font-size: 14px;"><strong>Next Steps:</strong> Our ranch concierge will review your reservation and contact you via phone within 24 hours to confirm custom cutting instructions and deposit placement.</p>
              </div>
            </div>
          `,
        });
        emailStatus = 'Sent successfully';
      } catch (emailErr: any) {
        console.error('Resend email error:', emailErr);
        emailStatus = `Email error: ${emailErr.message || 'Failed'}`;
      }
    }

    return res.status(200).json({
      success: true,
      reservationId,
      message: 'Beef Share Reservation successfully logged and confirmed.',
      emailStatus,
      record: reservationRecord,
    });
  } catch (error: any) {
    console.error('Reservation API error:', error);
    return res.status(500).json({ error: 'Server error processing reservation' });
  }
});

// ==========================================
// 4. CONTACT FORM
// ==========================================
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields (Name, Email, Message)' });
    }

    const contactRecord: ContactMessage = {
      id: 'MSG-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      name: name.trim(),
      email: email.trim(),
      phone: (phone || '').trim(),
      subject: (subject || 'General Beef Share Inquiry').trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'new',
    };

    await saveContactMessage(contactRecord);

    const notificationEmail = process.env.NOTIFICATION_EMAIL || 'orders@bastanzibeef.com';

    // 1. Notification email to business
    const businessHtml = getBrandedEmailWrapper(
      'New Customer Inquiry',
      `
        <h2 style="color: #fbbf24; margin-top: 0;">New Inquiry Received (#${contactRecord.id})</h2>
        <p><strong>Name:</strong> ${contactRecord.name}</p>
        <p><strong>Email:</strong> ${contactRecord.email}</p>
        <p><strong>Phone:</strong> ${contactRecord.phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${contactRecord.subject}</p>
        <div style="background: #111c15; padding: 15px; border-left: 3px solid #fbbf24; margin-top: 15px;">
          <p style="margin: 0; font-family: sans-serif; line-height: 1.5; color: #e5e7eb;">${contactRecord.message}</p>
        </div>
      `
    );

    await sendEmail({
      to: notificationEmail,
      subject: `📩 New Customer Message: ${contactRecord.subject} (${contactRecord.name})`,
      html: businessHtml,
    });

    // 2. Confirmation email to customer
    const customerHtml = getBrandedEmailWrapper(
      'Inquiry Received',
      `
        <h2 style="color: #fbbf24; margin-top: 0;">We Have Received Your Message!</h2>
        <p>Dear ${contactRecord.name},</p>
        <p>Thank you for contacting Bastanzi Premium Beef Co. We have logged your inquiry <strong>#${contactRecord.id}</strong> in our concierge queue.</p>
        <p>Our ranch concierge team will review your message regarding <em>"${contactRecord.subject}"</em> and reach out within 24 hours.</p>
        <p style="color: #d97706; font-weight: bold; margin-top: 20px;">Bastanzi Ranch Concierge Desk • Sheridan, Montana</p>
      `
    );

    await sendEmail({
      to: contactRecord.email,
      subject: `✨ We Received Your Inquiry - Bastanzi Premium Beef Co. (#${contactRecord.id})`,
      html: customerHtml,
    });

    return res.status(200).json({
      success: true,
      message: 'Inquiry successfully received and logged.',
      record: contactRecord,
    });
  } catch (err: any) {
    console.error('Contact API error:', err);
    return res.status(500).json({ error: 'Internal server error processing inquiry' });
  }
});

// ==========================================
// 5. NEWSLETTER
// ==========================================
app.post('/api/newsletter', async (req: Request, res: Response) => {
  try {
    const { email } = req.body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    const sub = await addSubscriber(email.trim());

    const html = getBrandedEmailWrapper(
      'Welcome to Private Reserve',
      `
        <h2 style="color: #fbbf24; margin-top: 0;">Welcome to Bastanzi Private Reserve List</h2>
        <p>Thank you for subscribing! You will receive priority notifications when seasonal pasture-raised beef shares, quarter/half harvests, and rare dry-aged cut reserves are released.</p>
        <p style="color: #34d399; font-weight: bold;">Ranch Location: Sheridan, Montana</p>
      `
    );

    await sendEmail({
      to: email.trim(),
      subject: '✨ Bastanzi Beef Private Reserve Access Confirmed',
      html,
    });

    return res.status(200).json({
      success: true,
      message: 'Subscribed to Bastanzi Ranch private reserve updates.',
      subscriber: sub,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error processing newsletter request' });
  }
});

// ==========================================
// 6. PUBLIC PRODUCTS
// ==========================================
app.get('/api/products', async (_req: Request, res: Response) => {
  try {
    const products = await getProducts();
    return res.status(200).json({ success: true, products });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ==========================================
// 7. PUBLIC TESTIMONIALS
// ==========================================
app.get('/api/testimonials', async (_req: Request, res: Response) => {
  const list = await getTestimonials(true); // approved only
  return res.status(200).json({ success: true, testimonials: list });
});

app.post('/api/testimonials', async (req: Request, res: Response) => {
  try {
    const { name, location, rating, comment, sharePurchased } = req.body || {};

    if (!name || !comment) {
      return res.status(400).json({ error: 'Name and comment are required' });
    }

    const newTestimonial: TestimonialItem = {
      id: 'test-' + Math.random().toString(36).substring(2, 8),
      name: name.trim(),
      location: (location || 'Valued Customer').trim(),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      comment: comment.trim(),
      sharePurchased: sharePurchased || 'Beef Share',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await saveTestimonial(newTestimonial);

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted and is pending admin verification.',
      testimonial: newTestimonial,
    });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to submit review' });
  }
});

// ==========================================
// 8. ORDER / SHIPMENT TRACKING
// ==========================================
const ALL_STAGES = [
  { id: 'Order received', title: 'Order Received', desc: 'Beef share reservation logged in the master ledger.' },
  { id: 'Payment confirmed', title: 'Payment Confirmed', desc: 'Deposit / full payment verified by finance department.' },
  { id: 'Processing', title: 'Processing Started', desc: 'Cattle selected and scheduled for processing at Montana facility.' },
  { id: 'Beef at processor', title: 'Beef at Processor', desc: 'Steer at USDA-inspected facility undergoing 14-21 day dry aging.' },
  { id: 'Packaging', title: 'Packaging & Flash Freezing', desc: 'Artisan cuts vacuum-sealed in 4mil protective film and blast-frozen at -20°F.' },
  { id: 'Ready for pickup', title: 'Ready for Pickup / Logistics Dispatch', desc: 'Order packed in eco-insulated coolers loaded with dry ice.' },
  { id: 'Shipped', title: 'Shipped in Cold Chain Transit', desc: 'Dispatched via OGFCARGO Cold Chain Logistics with temperature monitoring.' },
  { id: 'Out for delivery', title: 'Out for Delivery', desc: 'Couriers en route to local delivery destination.' },
  { id: 'Delivered', title: 'Delivered Direct to Doorstep', desc: 'Safely delivered. Ready for deep freezer storage.' },
];

function buildFullTimeline(currentStatus: string, createdAt: string) {
  const baseDate = new Date(createdAt);
  const currentIndex = ALL_STAGES.findIndex(
    (s) => s.id.toLowerCase() === currentStatus.toLowerCase()
  );
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;

  return ALL_STAGES.map((stage, idx) => {
    let status: 'completed' | 'current' | 'pending' = 'pending';
    if (idx < activeIdx) {
      status = 'completed';
    } else if (idx === activeIdx) {
      status = 'current';
    } else {
      status = 'pending';
    }

    const dateOffsetMs = idx * (86400000 * 0.8);
    const dateStr = new Date(baseDate.getTime() + dateOffsetMs).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return {
      title: stage.title,
      stageId: stage.id,
      date: dateStr,
      status,
      description: stage.desc,
    };
  });
}

app.get('/api/track', async (req: Request, res: Response) => {
  const trackingId = (req.query.id as string) || (req.query.trackingNumber as string) || '';

  if (!trackingId || !trackingId.trim()) {
    return res.status(400).json({ error: 'Please provide a tracking number or reservation ID' });
  }

  const cleanId = trackingId.trim().toUpperCase();

  try {
    const order = await getOrderByIdOrTracking(cleanId);

    if (order) {
      const currentStatus = order.status;
      return res.status(200).json({
        found: true,
        shipment: {
          id: order.id,
          trackingNumber: order.trackingNumber || `OGF-${order.id.replace('RES-', '')}`,
          customerName: order.name,
          email: order.email,
          phone: order.phone,
          shareSize: order.shareSize,
          finish: order.finish,
          status: currentStatus,
          origin: order.origin || 'Bastanzi Ranch - Sheridan, MT',
          destination: `${order.city || ''}, ${order.state || ''}`.trim() || order.destination || 'Customer Address',
          carrier: order.carrier || 'OGFCARGO Cold Chain Express',
          estimatedDelivery: order.estimatedDelivery || 'In 2-5 Business Days',
          createdAt: order.createdAt,
          updatedAt: order.updated_at || order.createdAt,
          notes: order.notes,
          timeline: buildFullTimeline(currentStatus, order.createdAt),
        },
      });
    }

    const defaultStatus = cleanId.endsWith('DEL')
      ? 'Delivered'
      : cleanId.endsWith('SHIP')
      ? 'Shipped'
      : cleanId.endsWith('PROC')
      ? 'Processing'
      : 'Order received';

    return res.status(200).json({
      found: true,
      shipment: {
        id: cleanId,
        trackingNumber: cleanId.startsWith('OGF-') ? cleanId : `OGF-${cleanId.replace('RES-', '')}`,
        customerName: 'Valued Customer',
        shareSize: 'Quarter Beef Share',
        finish: 'Pasture-Raised Grain-Finished',
        status: defaultStatus,
        origin: 'Bastanzi Ranch - Sheridan, MT',
        destination: 'Destination Address',
        carrier: 'OGFCARGO Cold Chain Logistics',
        estimatedDelivery: '3-5 Business Days',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: 'Temperature-monitored blast frozen shipment.',
        timeline: buildFullTimeline(defaultStatus, new Date().toISOString()),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error querying order tracking record.' });
  }
});

// ==========================================
// 9. ADMIN AUTHENTICATION
// ==========================================
app.post('/api/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const isValid = validateCredentials(email, password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const configuredEmail = (process.env.ADMIN_EMAIL || 'admin@ogfcargo.com').trim().toLowerCase();
    const token = generateAdminToken(configuredEmail);

    return res.status(200).json({
      success: true,
      token,
      user: {
        email: configuredEmail,
        role: 'admin',
      },
      message: 'Authentication successful',
    });
  } catch (err: any) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

app.all('/api/admin/verify', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || (req.body && req.body.token);
  const session = verifyAdminToken(authHeader as string);

  if (!session) {
    return res.status(401).json({ authenticated: false, error: 'Unauthorized: Invalid or expired session' });
  }

  return res.status(200).json({
    authenticated: true,
    user: {
      email: session.email,
      role: session.role,
    },
  });
});

app.post('/api/admin/logout', (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Admin session logged out successfully.',
  });
});

// ==========================================
// 10. ADMIN SHIPMENTS / ORDERS
// ==========================================
app.get('/api/admin/shipments', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const orders = await getOrders();
  return res.status(200).json({ success: true, shipments: orders });
});

app.post('/api/admin/shipments', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const body = req.body || {};
    const now = new Date().toISOString();
    const newId = 'RES-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const authHeader = req.headers.authorization || (req.body && req.body.token);
    const session = verifyAdminToken(authHeader as string);

    const newRecord: ShipmentOrder = {
      id: newId,
      trackingNumber: body.trackingNumber || `OGF-${newId.replace('RES-', '')}`,
      name: body.name || 'Valued Customer',
      email: body.email || '',
      phone: body.phone || '',
      address: body.address || '',
      city: body.city || '',
      state: body.state || '',
      zip: body.zip || '',
      shareSize: body.shareSize || 'Quarter',
      finish: body.finish || 'Pasture-Raised Grain-Finished',
      status: body.status || 'Order received',
      origin: body.origin || 'Bastanzi Ranch - Sheridan, MT',
      destination: body.destination || `${body.city || ''}, ${body.state || ''}`.trim() || 'Destination Address',
      carrier: body.carrier || 'OGFCARGO Cold Chain Logistics',
      estimatedDelivery: body.estimatedDelivery || 'In 3-5 Business Days',
      createdAt: now,
      updated_at: now,
      updated_by: session?.email || 'admin',
      notes: body.notes || '',
      totalAmount: body.totalAmount || 1150,
      paymentStatus: body.paymentStatus || 'Paid',
    };

    await saveOrder(newRecord);

    if (newRecord.email) {
      const html = getBrandedEmailWrapper(
        'Order Confirmation',
        `
          <h2 style="color: #fbbf24; margin-top: 0;">Order & Share Reservation Confirmed!</h2>
          <p>Dear ${newRecord.name},</p>
          <p>Thank you for choosing Bastanzi Premium Beef Co. Your reservation <strong>#${newRecord.id}</strong> has been logged into our master ranch ledger.</p>
          
          <div style="background-[#0f2117]; padding: 15px; border-left: 4px solid #fbbf24; margin: 20px 0;">
            <p style="margin: 0; color: #fbbf24; font-weight: bold;">Order Summary:</p>
            <p style="margin: 5px 0;">Share: ${newRecord.shareSize} Beef Share (${newRecord.finish})</p>
            <p style="margin: 5px 0;">Waybill Tracking #: <strong>${newRecord.trackingNumber}</strong></p>
            <p style="margin: 5px 0;">Current Status: <span style="color: #34d399; font-weight: bold;">${newRecord.status}</span></p>
          </div>
          
          <p>You can monitor your beef share progression across all 9 processing and cold-chain shipping stages on our website using your tracking number.</p>
        `
      );
      await sendEmail({
        to: newRecord.email,
        subject: `✨ Order Confirmed: Bastanzi Beef Share #${newRecord.id}`,
        html,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      shipment: newRecord,
    });
  } catch (err: any) {
    return res.status(400).json({ error: 'Invalid payload or server error' });
  }
});

app.put('/api/admin/shipments', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const body = req.body || {};
    const { id, status, notes, destination, carrier, estimatedDelivery, shareSize, finish, name, email, phone } = body;

    if (!id) {
      return res.status(400).json({ error: 'Shipment ID is required' });
    }

    const authHeader = req.headers.authorization || (req.body && req.body.token);
    const session = verifyAdminToken(authHeader as string);

    const allOrders = await getOrders();
    const existing = allOrders.find((o) => o.id === id) || {
      id,
      trackingNumber: `OGF-${id.replace('RES-', '')}`,
      name: name || 'Customer',
      email: email || '',
      phone: phone || '',
      address: '',
      city: '',
      state: '',
      zip: '',
      shareSize: shareSize || 'Quarter',
      finish: finish || 'Pasture-Raised Grain-Finished',
      status: 'Order received' as const,
      origin: 'Bastanzi Ranch - Sheridan, MT',
      destination: destination || 'Customer Address',
      carrier: carrier || 'OGFCARGO Cold Chain Logistics',
      estimatedDelivery: estimatedDelivery || 'In 3-5 Business Days',
      createdAt: new Date().toISOString(),
    };

    const now = new Date().toISOString();
    const oldStatus = existing.status;

    const updatedRecord: ShipmentOrder = {
      ...existing,
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      ...(destination && { destination }),
      ...(carrier && { carrier }),
      ...(estimatedDelivery && { estimatedDelivery }),
      ...(shareSize && { shareSize }),
      ...(finish && { finish }),
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      updated_at: now,
      updated_by: session?.email || 'admin',
    };

    await saveOrder(updatedRecord);

    if (status && status !== oldStatus && updatedRecord.email) {
      const html = getBrandedEmailWrapper(
        'Order Status Update',
        `
          <h2 style="color: #fbbf24; margin-top: 0;">Order Status Update: ${status}</h2>
          <p>Dear ${updatedRecord.name},</p>
          <p>Your Bastanzi Beef share order <strong>#${updatedRecord.id}</strong> has progressed to a new stage!</p>

          <div style="background-[#0f2117]; padding: 20px; border-radius: 8px; border: 1px solid #059669; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #34d399;">
              Status: ${status}
            </p>
            <p style="margin: 0; color: #d1d5db; font-size: 13px;">
              Tracking Number: <strong>${updatedRecord.trackingNumber}</strong><br/>
              Estimated Delivery: <strong>${updatedRecord.estimatedDelivery}</strong>
            </p>
          </div>

          <p>You can view full temperature logs and transportation milestones anytime on our tracking portal.</p>
        `
      );

      await sendEmail({
        to: updatedRecord.email,
        subject: `🚚 Beef Share Update: ${status} (#${updatedRecord.id})`,
        html,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Shipment ${id} updated successfully`,
      shipment: updatedRecord,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update shipment' });
  }
});

app.delete('/api/admin/shipments', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = (req.query.id as string) || (req.body && req.body.id);
    if (!id) {
      return res.status(400).json({ error: 'Shipment ID is required' });
    }

    await deleteOrder(id);

    return res.status(200).json({
      success: true,
      message: `Shipment ${id} deleted successfully`,
      deletedId: id,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete shipment' });
  }
});

// ==========================================
// 11. ADMIN PRODUCTS MANAGEMENT
// ==========================================
app.get('/api/admin/products', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const products = await getProducts();
  return res.status(200).json({ success: true, products });
});

app.post('/api/admin/products', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const body = req.body || {};
    const newProduct: ProductItem = {
      id: 'prod-' + Math.random().toString(36).substring(2, 8),
      name: body.name || 'New Beef Share',
      shareSize: body.shareSize || 'Quarter',
      finish: body.finish || 'Pasture-Raised Grain-Finished',
      price: Number(body.price) || 1150,
      hangingWeight: body.hangingWeight || '175-200 lbs',
      takeHomeWeight: body.takeHomeWeight || '100-115 lbs',
      description: body.description || '',
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
      inventory: Number(body.inventory) || 10,
      isOutOfStock: Boolean(body.isOutOfStock),
      isFeatured: Boolean(body.isFeatured),
      cutsIncluded: Array.isArray(body.cutsIncluded) ? body.cutsIncluded : [],
    };

    await saveProduct(newProduct);
    return res.status(201).json({ success: true, product: newProduct });
  } catch (err: any) {
    return res.status(400).json({ error: 'Invalid product payload' });
  }
});

app.put('/api/admin/products', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const body = req.body || {};
    if (!body.id) {
      return res.status(400).json({ error: 'Product ID required' });
    }

    const products = await getProducts();
    const existing = products.find((p) => p.id === body.id) || {
      id: body.id,
      name: '',
      shareSize: 'Quarter',
      finish: 'Pasture-Raised Grain-Finished',
      price: 0,
      hangingWeight: '',
      takeHomeWeight: '',
      description: '',
      imageUrl: '',
      inventory: 0,
      isOutOfStock: false,
      isFeatured: false,
      cutsIncluded: [],
    };

    const updatedProduct: ProductItem = {
      ...existing,
      ...body,
      price: Number(body.price ?? existing.price),
      inventory: Number(body.inventory ?? existing.inventory),
      isOutOfStock: body.isOutOfStock !== undefined ? Boolean(body.isOutOfStock) : existing.isOutOfStock,
      isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : existing.isFeatured,
    };

    await saveProduct(updatedProduct);
    return res.status(200).json({ success: true, product: updatedProduct });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/admin/products', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const id = (req.query.id as string) || (req.body && req.body.id);
  if (!id) {
    return res.status(400).json({ error: 'Product ID required' });
  }
  await deleteProduct(id);
  return res.status(200).json({ success: true, deletedId: id });
});

// ==========================================
// 12. ADMIN CONTACT MESSAGES
// ==========================================
app.get('/api/admin/contact', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const messages = await getContactMessages();
  return res.status(200).json({ success: true, messages });
});

app.put('/api/admin/contact', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { id, status } = req.body || {};

    if (!id || !status) {
      return res.status(400).json({ error: 'ID and status required' });
    }

    const all = await getContactMessages();
    const existing = all.find((m) => m.id === id);

    if (!existing) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const updated = { ...existing, status };
    await saveContactMessage(updated);

    return res.status(200).json({ success: true, messageRecord: updated });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to update message status' });
  }
});

// ==========================================
// 13. ADMIN TESTIMONIALS
// ==========================================
app.get('/api/admin/testimonials', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const testimonials = await getTestimonials(false);
  return res.status(200).json({ success: true, testimonials });
});

app.put('/api/admin/testimonials', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { id, status } = req.body || {};

    if (!id || !status) {
      return res.status(400).json({ error: 'ID and status required' });
    }

    const all = await getTestimonials(false);
    const existing = all.find((t) => t.id === id);

    if (!existing) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    const updated: TestimonialItem = {
      ...existing,
      status,
    };

    await saveTestimonial(updated);
    return res.status(200).json({ success: true, testimonial: updated });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to update testimonial status' });
  }
});

app.delete('/api/admin/testimonials', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const id = (req.query.id as string) || (req.body && req.body.id);
  if (!id) {
    return res.status(400).json({ error: 'ID required' });
  }
  await deleteTestimonial(id);
  return res.status(200).json({ success: true, deletedId: id });
});

// ==========================================
// 14. ADMIN SUBSCRIBERS
// ==========================================
app.get('/api/admin/subscribers', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const subscribers = await getSubscribers();
  return res.status(200).json({ success: true, subscribers });
});

// ==========================================
// 15. SEO SITEMAP & ROBOTS
// ==========================================
app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://bastanzibeef.com';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/#about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#shares</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#reservation</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  return res.status(200).send(xml);
});

app.get('/robots.txt', (_req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://bastanzibeef.com';
  res.setHeader('Content-Type', 'text/plain');
  return res.status(200).send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);
});

// Export Express App for single Vercel Serverless Function
export default app;
