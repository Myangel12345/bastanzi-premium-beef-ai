import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const baseUrl = process.env.APP_URL || 'https://bastanzibeef.com';
  res.setHeader('Content-Type', 'text/plain');
  return res.status(200).send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);
}
