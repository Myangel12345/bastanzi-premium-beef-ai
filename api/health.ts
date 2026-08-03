import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'ok',
    service: 'Bastanzi Premium Beef Co. API (Vercel Serverless)',
    time: new Date().toISOString(),
    supabaseConfigured: Boolean(process.env.SUPABASE_URL),
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
  });
}
