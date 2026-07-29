import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store for fallback reservations
const memoryReservations: any[] = [];
const memoryMessages: any[] = [];

// Initialize Resend if key exists
const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const notificationEmail = process.env.NOTIFICATION_EMAIL || 'orders@bastanzibeef.com';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Bastanzi Premium Beef Co. API',
    time: new Date().toISOString(),
    supabaseConfigured: Boolean(process.env.SUPABASE_URL),
    resendConfigured: Boolean(resendApiKey),
  });
});

// Reservation submission API
app.post('/api/reserve', async (req, res) => {
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
    } = req.body;

    if (!name || !email || !phone || !shareSize) {
      return res.status(400).json({ error: 'Missing required reservation fields (Name, Email, Phone, Share Size).' });
    }

    const reservationId = 'RES-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const createdAt = new Date().toISOString();

    const reservationRecord = {
      id: reservationId,
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
      createdAt,
      status: 'Pending',
    };

    memoryReservations.unshift(reservationRecord);

    // Attempt Resend email sending if key exists
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
              <p><strong>Address:</strong> ${address}, ${city}, ${state} ${zip}</p>
              <p><strong>Selected Share Size:</strong> <span style="color: #d4af37; font-weight: bold;">${shareSize} Beef Share</span></p>
              <p><strong>Finishing Preference:</strong> ${finish}</p>
              <p><strong>Preferred Delivery Date:</strong> ${preferredDeliveryDate}</p>
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

    res.status(200).json({
      success: true,
      reservationId,
      message: 'Beef Share Reservation successfully logged and confirmed.',
      emailStatus,
      record: reservationRecord,
    });
  } catch (error: any) {
    console.error('Reservation API error:', error);
    res.status(500).json({ error: 'Server error processing reservation' });
  }
});

// Contact message endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const contactRecord = {
      id: 'MSG-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      name,
      email,
      phone,
      subject,
      message,
      createdAt: new Date().toISOString(),
    };

    memoryMessages.unshift(contactRecord);

    if (resend) {
      try {
        await resend.emails.send({
          from: 'Bastanzi Inquiries <info@bastanzibeef.com>',
          to: [notificationEmail],
          subject: `Inquiry from ${name}: ${subject || 'General Inquiry'}`,
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
        });
      } catch (e) {
        console.warn('Resend contact message error:', e);
      }
    }

    res.status(200).json({ success: true, message: 'Message received by Bastanzi Beef team.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dynamic SEO sitemap.xml
app.get('/sitemap.xml', (req, res) => {
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
    <loc>${baseUrl}/#gallery</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/#faq</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/#reservation</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>${baseUrl}/#contact</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.APP_URL || 'https://bastanzibeef.com';
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Bastanzi Beef Co.] Production server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
