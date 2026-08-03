import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getProducts } from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const products = await getProducts();
    return res.status(200).json({ success: true, products });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
}
