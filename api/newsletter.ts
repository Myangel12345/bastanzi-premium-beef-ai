import type { VercelRequest, VercelResponse } from '@vercel/node';
import { addSubscriber } from './lib/db';
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
    const { email } = body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    const sub = await addSubscriber(email.trim());

    // Send confirmation email
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
}
