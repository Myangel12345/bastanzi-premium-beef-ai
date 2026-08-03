import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminToken } from '../lib/auth.js';
import { getProducts, saveProduct, deleteProduct, ProductItem } from '../lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
    const products = await getProducts();
    return res.status(200).json({ success: true, products });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const newProduct: ProductItem = {
        id: 'prod-' + Math.random().toString(36).substring(2, 8),
        name: body.name || 'New Beef Share',
        shareSize: body.shareSize || 'Quarter',
        finish: body.finish || 'Pasture-Raised Grain-Finished',
        price: Number(body.price) || 1150,
        hangingWeight: body.hangingWeight || '175-200 lbs',
        takeHomeWeight: body.takeHomeWeight || '100-115 lbs',
        description: body.description || '',
        imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
        inventory: Number(body.inventory) || 10,
        isOutOfStock: Boolean(body.isOutOfStock),
        isFeatured: Boolean(body.isFeatured),
        cutsIncluded: Array.isArray(body.cutsIncluded) ? body.cutsIncluded : [],
      };

      await saveProduct(newProduct);
      return res.status(201).json({ success: true, product: newProduct });
    } catch (err: any) {
      return res.status(400).json({ error: 'Invalid product payload' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      if (!body.id) {
        return res.status(400).json({ error: 'Product ID required' });
      }

      const products = await getProducts();
      const existing = products.find((p) => p.id === body.id) || {
        id: body.id,
        name: '',
        shareSize: 'Quarter',
        finish: 'Pasture-Raised Grain-Finished',
        price: 0,
        hangingWeight: '',
        takeHomeWeight: '',
        description: '',
        imageUrl: '',
        inventory: 0,
        isOutOfStock: false,
        isFeatured: false,
        cutsIncluded: [],
      };

      const updatedProduct: ProductItem = {
        ...existing,
        ...body,
        price: Number(body.price ?? existing.price),
        inventory: Number(body.inventory ?? existing.inventory),
        isOutOfStock: body.isOutOfStock !== undefined ? Boolean(body.isOutOfStock) : existing.isOutOfStock,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : existing.isFeatured,
      };

      await saveProduct(updatedProduct);
      return res.status(200).json({ success: true, product: updatedProduct });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update product' });
    }
  }

  if (req.method === 'DELETE') {
    const id = (req.query.id as string) || (req.body && req.body.id);
    if (!id) {
      return res.status(400).json({ error: 'Product ID required' });
    }
    await deleteProduct(id);
    return res.status(200).json({ success: true, deletedId: id });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
