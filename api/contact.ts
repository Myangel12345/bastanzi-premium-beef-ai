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
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
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

    const resendApiKey = process.env.RESEND_API_KEY || '';
    const resend = resendApiKey ? new Resend(resendApiKey) : null;
    const notificationEmail = process.env.NOTIFICATION_EMAIL || 'orders@bastanzibeef.com';

    if (resend) {
      try {
        await resend.emails.send({
          from: 'Bastanzi Inquiries <info@bastanzibeef.com>',
          to: [notificationEmail],
          subject: `Inquiry from ${name}: ${subject || 'General Inquiry'}`,
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nSubject: ${subject || 'General Inquiry'}\nMessage: ${message}`,
        });
      } catch (e) {
        console.warn('Resend contact message error:', e);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Message received by Bastanzi Beef team.',
      record: contactRecord,
    });
  } catch (err) {
    console.error('Contact API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
