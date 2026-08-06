import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServerClient, serverOrdersCache } from './track.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('[SERVER /api/orders] Fetching all admin orders...');

  const supabase = getSupabaseServerClient();
  let dbOrders: any[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbOrders = await Promise.all(
          data.map(async (ord) => {
            const { data: hist } = await supabase
              .from('order_history')
              .select('*')
              .eq('order_id', ord.id)
              .order('created_at', { ascending: true });

            return {
              ...ord,
              history: hist || [],
            };
          })
        );
      }
    } catch (err: any) {
      console.warn('[SERVER /api/orders] Supabase fetch exception:', err);
    }
  }

  // Combine DB orders and server memory cache, avoiding duplicates by order_number
  const combinedMap = new Map<string, any>();

  // Add cached orders first
  for (const ord of serverOrdersCache) {
    const key = (ord.order_number || ord.id || '').toUpperCase();
    if (key) combinedMap.set(key, ord);
  }

  // DB orders take precedence if they exist
  for (const ord of dbOrders) {
    const key = (ord.order_number || ord.id || '').toUpperCase();
    if (key) combinedMap.set(key, ord);
  }

  const allOrders = Array.from(combinedMap.values());

  return res.status(200).json({
    success: true,
    orders: allOrders,
  });
}
