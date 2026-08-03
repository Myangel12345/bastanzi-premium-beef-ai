import type { VercelRequest, VercelResponse } from '@vercel/node';
import { saveContactMessage, ContactMessage } from './lib/db';
import { sendEmail, getBrandedEmailWrapper } from './lib/email';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const { name, email, phone, subject, message } = body;

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

    // Save to DB / Supabase
    await saveContactMessage(contactRecord);

    const notificationEmail = process.env.NOTIFICATION_EMAIL || 'orders@bastanzibeef.com';

    // 1. Send notification email to the business
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

    // 2. Send automatic confirmation email to the customer
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
}
