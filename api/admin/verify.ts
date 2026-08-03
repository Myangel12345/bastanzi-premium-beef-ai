import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminToken } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
}
