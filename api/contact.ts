import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getInternalNotificationEmail,
  getResendClient,
  sendEmailWithDiagnostics,
} from './email-service';

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
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields: name, email, or message.' });
    }

    const contactRecord = {
      id: 'MSG-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message,
      createdAt: new Date().toISOString(),
    };

    const internalRecipient = getInternalNotificationEmail();

    const internalHtml = `
      <div style="font-family: Arial, sans-serif; padding: 25px; background-color: #f8fafc; color: #1e293b; border-left: 4px solid #d4af37;">
        <h2 style="color: #0f172a; margin-top: 0;">📬 New Website Inquiry Received</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${message}</p>
        <p style="font-size: 11px; color: #64748b; margin-top: 24px;">Submitted via Bastanzi Premium Beef Co. Contact Form</p>
      </div>
    `;

    const customerAckHtml = `
      <div style="font-family: 'Georgia', serif; background-color: #0c0c0e; color: #f4f4f6; padding: 35px; border-radius: 8px; border: 1px solid #d4af37;">
        <h2 style="color: #d4af37; margin-top: 0;">BASTANZI PREMIUM BEEF CO.</h2>
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to Bastanzi Premium Beef Co. We have received your inquiry regarding <strong>"${subject || 'General Inquiry'}"</strong>.</p>
        <p>Our ranch concierge team will review your message and reply promptly.</p>
        <div style="background-color: #18181b; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #d4af37;">
          <p style="font-style: italic; margin: 0; color: #d1d5db;">"${message}"</p>
        </div>
        <p style="font-size: 12px; color: #a1a1aa; margin-top: 25px;">Bastanzi Premium Beef Co. • Pasture Raised • 21-Day Dry Aged</p>
      </div>
    `;

    // 1. Send Internal Notification to RESEND_NOTIFICATION_EMAIL
    const intResult = await sendEmailWithDiagnostics({
      type: 'contact_inquiry',
      category: 'internal',
      to: internalRecipient,
      subject: `Inquiry from ${name}: ${subject || 'General Inquiry'}`,
      html: internalHtml,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nSubject: ${subject || 'General Inquiry'}\nMessage: ${message}`,
    });

    // 2. Send Customer Receipt Acknowledgment to Customer's Email
    await sendEmailWithDiagnostics({
      type: 'contact_customer_acknowledgment',
      category: 'customer',
      to: email,
      subject: `We received your message - Bastanzi Premium Beef Co.`,
      html: customerAckHtml,
    });

    let emailStatus = 'Simulated Success';
    const { hasKey } = getResendClient();
    if (hasKey) {
      emailStatus = intResult.success ? 'Sent successfully' : 'Queued';
    }

    return res.status(200).json({
      success: true,
      message: 'Message received by Bastanzi Beef team.',
      emailStatus,
      record: contactRecord,
    });
  } catch (err: any) {
    console.error('Contact API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
