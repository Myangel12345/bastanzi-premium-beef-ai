import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTestimonials, saveTestimonial, TestimonialItem } from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const list = await getTestimonials(true); // approved only
    return res.status(200).json({ success: true, testimonials: list });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { name, location, rating, comment, sharePurchased } = body;

      if (!name || !comment) {
        return res.status(400).json({ error: 'Name and comment are required' });
      }

      const newTestimonial: TestimonialItem = {
        id: 'test-' + Math.random().toString(36).substring(2, 8),
        name: name.trim(),
        location: (location || 'Valued Customer').trim(),
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        comment: comment.trim(),
        sharePurchased: sharePurchased || 'Beef Share',
        status: 'pending', // Pending admin approval
        createdAt: new Date().toISOString(),
      };

      await saveTestimonial(newTestimonial);

      return res.status(201).json({
        success: true,
        message: 'Thank you! Your review has been submitted and is pending admin verification.',
        testimonial: newTestimonial,
      });
    } catch (e: any) {
      return res.status(500).json({ error: 'Failed to submit review' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
