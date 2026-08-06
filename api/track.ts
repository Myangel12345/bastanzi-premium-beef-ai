import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Shared server-side fallback memory cache across requests
export const serverOrdersCache: any[] = [];

function isValidHttpUrl(stringStr: string) {
  try {
    const u = new URL(stringStr);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getSupabaseServerClient() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  
  if (isValidHttpUrl(url) && key) {
    try {
      return createClient(url, key);
    } catch (err) {
      console.warn('Failed to initialize Supabase server client:', err);
      return null;
    }
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let orderNumber = '';
  let email = '';

  if (req.method === 'GET') {
    orderNumber = (req.query.orderNumber || req.query.num || req.query.order || '') as string;
    email = (req.query.email || '') as string;
  } else {
    let body: any = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    orderNumber = body.orderNumber || body.num || body.order_number || '';
    email = body.email || body.customerEmail || '';
  }

  const cleanOrderNum = orderNumber.trim().toUpperCase();
  const cleanEmail = email.trim().toLowerCase();

  console.log(`[SERVER /api/track] Form Input Received -> Order Number: "${cleanOrderNum}", Email: "${cleanEmail}"`);

  if (!cleanOrderNum || !cleanEmail) {
    return res.status(400).json({
      success: false,
      message: 'Please enter both your Order Number (e.g. BST-2026-000001) and Email Address.',
    });
  }

  const supabase = getSupabaseServerClient();

  // 1. Try querying Supabase database from server
  if (supabase) {
    try {
      console.log(`[SERVER /api/track] Executing Supabase query for order_number = "${cleanOrderNum}"`);
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*)
        `)
        .eq('order_number', cleanOrderNum)
        .maybeSingle();

      if (orderError) {
        console.warn('[SERVER /api/track] Supabase query error:', orderError.message);
      }

      if (orderData && orderData.customer) {
        const storedEmail = (orderData.customer.email || '').trim().toLowerCase();
        
        if (storedEmail === cleanEmail) {
          console.log(`[SERVER /api/track] Order ${cleanOrderNum} successfully matched customer email ${storedEmail}!`);
          
          // Fetch order history
          const { data: historyData } = await supabase
            .from('order_history')
            .select('*')
            .eq('order_id', orderData.id)
            .order('created_at', { ascending: true });

          const fullOrder = {
            ...orderData,
            history: historyData || [],
          };

          return res.status(200).json({
            success: true,
            order: fullOrder,
          });
        } else {
          console.warn(`[SERVER /api/track] Email mismatch! Stored: "${storedEmail}", Input: "${cleanEmail}"`);
          return res.status(400).json({
            success: false,
            message: `Order #${cleanOrderNum} was found, but the email provided (${cleanEmail}) does not match the reservation record.`,
          });
        }
      } else {
        console.warn(`[SERVER /api/track] Zero rows returned from Supabase for order_number "${cleanOrderNum}".`);
      }
    } catch (err: any) {
      console.error('[SERVER /api/track] Supabase exception:', err);
    }
  }

  // 2. Check Server Memory Cache
  const cachedOrder = serverOrdersCache.find(
    (o) =>
      (o.order_number || o.id || '').trim().toUpperCase() === cleanOrderNum &&
      (o.customer?.email || o.email || '').trim().toLowerCase() === cleanEmail
  );

  if (cachedOrder) {
    console.log(`[SERVER /api/track] Order ${cleanOrderNum} found in server memory cache!`);
    return res.status(200).json({
      success: true,
      order: cachedOrder,
    });
  }

  return res.status(404).json({
    success: false,
    message: `No active reservation found matching Order Number "${cleanOrderNum}" and Email Address "${cleanEmail}". Please check your details and try again.`,
  });
}
