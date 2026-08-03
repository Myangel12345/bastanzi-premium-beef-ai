import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminToken } from '../lib/auth.js';
import { getTestimonials, saveTestimonial, deleteTestimonial, TestimonialItem } from '../lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
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
    const testimonials = await getTestimonials(false); // return all (pending, approved, rejected)
    return res.status(200).json({ success: true, testimonials });
  }

  if (req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { id, status } = body;

      if (!id || !status) {
        return res.status(400).json({ error: 'ID and status required' });
      }

      const all = await getTestimonials(false);
      const existing = all.find((t) => t.id === id);

      if (!existing) {
        return res.status(404).json({ error: 'Testimonial not found' });
      }

      const updated: TestimonialItem = {
        ...existing,
        status,
      };

      await saveTestimonial(updated);
      return res.status(200).json({ success: true, testimonial: updated });
    } catch (e: any) {
      return res.status(500).json({ error: 'Failed to update testimonial status' });
    }
  }

  if (req.method === 'DELETE') {
    const id = (req.query.id as string) || (req.body && req.body.id);
    if (!id) {
      return res.status(400).json({ error: 'ID required' });
    }
    await deleteTestimonial(id);
    return res.status(200).json({ success: true, deletedId: id });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
