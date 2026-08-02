import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
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
    } = body;

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
      address: address || '',
      city: city || '',
      state: state || '',
      zip: zip || '',
      shareSize,
      finish: finish || 'Pasture-Raised Grain-Finished',
      preferredDeliveryDate: preferredDeliveryDate || '',
      notes: notes || '',
      createdAt,
      status: 'Pending',
    };

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
}
