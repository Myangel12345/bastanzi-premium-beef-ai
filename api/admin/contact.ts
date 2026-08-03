import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminToken } from '../lib/auth.js';
import { getContactMessages, saveContactMessage } from '../lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
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
    const messages = await getContactMessages();
    return res.status(200).json({ success: true, messages });
  }

  if (req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { id, status } = body;

      if (!id || !status) {
        return res.status(400).json({ error: 'ID and status required' });
      }

      const all = await getContactMessages();
      const existing = all.find((m) => m.id === id);

      if (!existing) {
        return res.status(404).json({ error: 'Message not found' });
      }

      const updated = { ...existing, status };
      await saveContactMessage(updated);

      return res.status(200).json({ success: true, messageRecord: updated });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to update message status' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
