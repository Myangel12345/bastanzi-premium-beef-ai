import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateCredentials, generateAdminToken } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { email, password } = body;

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
}
