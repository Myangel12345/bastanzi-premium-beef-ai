import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminToken } from '../lib/auth.js';
import { getSubscribers } from '../lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;
  const session = verifyAdminToken(authHeader as string);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Admin token required' });
  }

  if (req.method === 'GET') {
    const subscribers = await getSubscribers();
    return res.status(200).json({ success: true, subscribers });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
