import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

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
    const { email } = body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    const resendApiKey = process.env.RESEND_API_KEY || '';
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: 'Bastanzi Newsletter <vip@bastanzibeef.com>',
          to: [email],
          subject: 'Welcome to Bastanzi Beef Co. Private Reserve List',
          html: `<div style="font-family: Georgia, serif; padding: 20px; background: #000; color: #fff;">
            <h1 style="color: #fbbf24;">Bastanzi Premium Beef Co.</h1>
            <p>Thank you for subscribing to our ranch updates, seasonal harvest notifications, and reserve share releases.</p>
          </div>`,
        });
      } catch (e) {
        console.warn('Resend newsletter email exception:', e);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Subscribed to Bastanzi Ranch private reserve updates.',
      email,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error processing newsletter request' });
  }
}
