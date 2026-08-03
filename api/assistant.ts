import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { prompt, history } = body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt string is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Intelligent fallback answer if Gemini key is not configured in environment
      return res.status(200).json({
        reply: getFallbackAnswer(prompt),
        simulated: true,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are the AI Ranch Concierge and Logistics Assistant for Bastanzi Premium Beef Co. & OGFCARGO Logistics Ventures.
Your goal is to answer customer and admin questions politely, authoritatively, and concisely.
Key knowledge:
- Bastanzi Beef offers Eighth (50 lbs), Quarter (100 lbs), Half (200 lbs), and Full (400 lbs) beef shares.
- Finishing choices: 100% Grass-Fed & Finished or Pasture-Raised Grain-Finished.
- All cuts are vacuum sealed in 4mil heavy-duty packages and shipped via OGFCARGO Cold Chain Logistics in dry-ice insulated eco-coolers.
- Waybills and tracking numbers start with OGF- or RES-.
- Delivery takes 2-5 business days depending on region.
- Keep answers helpful, warm, and professional under 150 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Thank you for reaching out to Bastanzi Beef & OGFCARGO. How else may I assist you today?';

    return res.status(200).json({ reply, success: true });
  } catch (err: any) {
    console.error('Gemini Assistant error:', err);
    return res.status(200).json({
      reply: getFallbackAnswer(req.body?.prompt || ''),
      error: err.message,
    });
  }
}

function getFallbackAnswer(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('freezer') || lower.includes('space') || lower.includes('cubic')) {
    return 'Our Quarter share requires ~4.0 cubic feet of freezer space, a Half share requires ~8.0 cubic feet, and a Full share requires ~16.0 cubic feet. Standard chest or upright freezers work perfectly!';
  }
  if (lower.includes('shipping') || lower.includes('track') || lower.includes('delivery')) {
    return 'All shipments are dispatched via OGFCARGO Cold Chain Logistics inside heavy-duty insulated coolers with dry ice. You can track your shipment anytime on our website using your reservation ID (RES-XXXXXXX) or tracking number (OGF-XXXXXXX).';
  }
  if (lower.includes('grain') || lower.includes('grass') || lower.includes('finish')) {
    return 'We offer both 100% Grass-Fed & Finished (leaner, rich natural flavor) and Pasture-Raised Grain-Finished (luxurious marbling and buttery tenderness). Both options are 100% raised without hormones or antibiotics.';
  }
  return 'Welcome to Bastanzi Premium Beef Co.! We provide pasture-raised, artisan-butchered beef shares directly to your doorstep with guaranteed OGFCARGO cold-chain delivery. Let us know if you need assistance calculating freezer space or reserving your share.';
}
