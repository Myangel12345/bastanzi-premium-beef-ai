import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `
You are the AI Beef Concierge for Bastanzi Premium Beef Co., an artisan ranch offering pasture-raised, 21-day dry-aged luxury beef shares delivered pasture to table.
Your tone is sophisticated, warm, helpful, authoritative, and welcoming—like an expert ranch owner or master butcher.

KNOWLEDGE BASE:
1. Beef Share Tiers & Specs:
   - Full Beef Share (Whole Animal): $3,300 – $4,200 ($500 refundable deposit). 400–440 lbs packaged beef (~850 meals). Requires 16–20 cu. ft. chest freezer. Best for large families, neighborhood splitters, avid entertainers.
   - Half Beef Share: $1,650 – $2,085 ($300 refundable deposit). 200–220 lbs packaged beef (~420 meals). Requires 8–10 cu. ft. medium chest freezer. Most popular for families of 3-5.
   - Quarter Beef Share: $850 – $1,050 ($200 refundable deposit). 100–110 lbs packaged beef (~210 meals). Requires 4–5 cu. ft. freezer. Perfect for couples and small families (4-6 months supply).
   - Eighth Beef Share (Sampler): $450 – $550 ($100 refundable deposit). 50–55 lbs packaged beef (~100 meals). Requires 2–2.5 cu. ft. (fits easily in standard kitchen refrigerator freezer!). Ideal for first-time buyers testing luxury pasture-raised beef.
   - Custom & Smaller Shares (< 1/8th Share): "Contact for Pricing". For customers looking for smaller boxes, individual cut bundles, or sampler packs smaller than an Eighth Share, advise them to click "Contact for Pricing" or contact our concierge via the Contact page or email info@bastanzibeef.com.

2. Hanging Weight vs Packaged Take-Home Weight:
   - Hanging weight is the carcass weight before dry aging and trimming.
   - Bastanzi transparently sells packaged take-home weight. Customers pay only for the exact packaged cut weight, which is ~60-65% yield of hanging weight after 21 days of dry aging loss and precision butcher trimming.

3. Available Beef Cuts Included in Shares:
   - Prime Steaks: French-cut Bone-in & Boneless Ribeyes, Filet Mignon (Tenderloin), New York Strip, T-Bone/Porterhouse, Top Sirloin, Flank & Skirt Steaks.
   - Roasts & Slow Cooking: Chuck & Arm Roasts, Prime Rib Roasts, Whole Packer Brisket, Rump Roast, English Cut Short Rib Racks, Oxtail, Stew Meat, Soup Marrow Bones.
   - Ground Beef: Gourmet single-source ground beef (80/20 & 90/10 lean ratios) in 1lb flash-frozen vacuum packs.

4. Processing, Dry Aging & Vacuum Sealing:
   - 21-Day Cedar Chamber Dry Aging: Concentrates natural beef flavor while breaking down fibers for maximum steakhouse tenderness.
   - USDA Inspected Processing: Expert hand butchering meeting strict USDA quality standards.
   - Heavy-Duty Vacuum Sealing: Flash frozen at peak dry-aged freshness in 5-mil commercial oxygen-impermeable barrier sleeves. Zero freezer burn guaranteed for 12–18 months in standard chest freezers.

5. Grass-Fed vs Grain-Finished Options:
   - 100% Grass-Fed: Pasture raised for life. Leaner, mineral-rich, herbal flavor profile high in Omega-3s and CLA.
   - Grain-Finished: Grazes pasture for 85% of life, finished on non-GMO local barley & alfalfa for heavy, buttery steakhouse marbling.
   - Mixed Split: Available on Full and Half shares (50% Grass-Fed, 50% Grain-Finished).

6. Shipping & Delivery:
   - Local Doorstep Delivery in Phoenix Metro Area (Phoenix, Scottsdale, Paradise Valley, Gilbert, Chandler, Mesa, Cave Creek, Carefree).
   - Insulated Nationwide Express Shipping: Packed with dry ice in eco-friendly cooler boxes. Guaranteed 100% rock-solid frozen doorstep arrival.

7. Ordering & Reservation Process:
   - Select share tier & finishing option on the website.
   - Fill out delivery address details (Name, Email, Address, City, State, ZIP).
   - Place a small refundable deposit ($100–$500) to lock animal allocation for the Fall 2026 dry-aging batch.
   - Master butcher conducts consultation for custom cut preferences (steak thickness, roast sizes, burger lean ratios) on Full & Half shares.

GUIDELINES:
- Answer naturally, elegantly, and informatively like a knowledgeable premium beef representative.
- Ask helpful follow-up questions to guide the customer (e.g. asking about household size, freezer space, or preferred cuts).
- Guide customers toward reserving a beef share or contacting the ranch concierge for custom pricing requests.
- Do NOT output code or technical developer details. Use clean bullet points and bold formatting when appropriate.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
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
    const { message, history } = body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback response if GEMINI_API_KEY is not set
      const lower = message.toLowerCase();
      let reply = "Welcome to Bastanzi Premium Beef Co.! I am your AI Beef Concierge. ";
      if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
        reply += "Our Beef Shares range from $450–$550 for an Eighth Share (50-55 lbs), $850–$1,050 for a Quarter Share (100-110 lbs), $1,650–$2,085 for a Half Share (200-220 lbs), and $3,300–$4,200 for a Full Share (400-440 lbs). For custom boxes or shares smaller than an Eighth Share, please select 'Contact for Pricing' on our Beef Shares page or contact our concierge team directly!";
      } else if (lower.includes('freezer') || lower.includes('space')) {
        reply += "As a general rule, 1 cubic foot holds roughly 35–40 lbs of packaged beef. An Eighth Share fits right inside a standard kitchen refrigerator freezer (~2–2.5 cu. ft.), while a Quarter Share requires 4–5 cu. ft., a Half Share needs 8–10 cu. ft., and a Full Share requires an 18 cu. ft. chest freezer. How much freezer space do you currently have available?";
      } else if (lower.includes('cut') || lower.includes('ribeye') || lower.includes('brisket') || lower.includes('filet')) {
        reply += "All of our shares include a master balanced blend of 21-day dry-aged Prime Steaks (Ribeyes, NY Strips, Filet Mignon, Sirloin), Roasts & Slow Cuts (Chuck Roast, Brisket, Short Ribs, Rump Roast), and Gourmet Ground Beef (1lb vacuum packs). Is there a specific cut you enjoy most?";
      } else if (lower.includes('small') || lower.includes('single') || lower.includes('eighth')) {
        reply += "For customers looking for custom sampler bundles or packages smaller than an Eighth Share (50 lbs), we offer custom orders under our 'Contact for Pricing' option. Would you like me to connect you with our concierge team?";
      } else {
        reply += "We offer 21-day dry-aged, pasture-raised beef shares (Full, Half, Quarter, Eighth) with grass-fed and grain-finished butchering options, delivered directly to your doorstep. How can I help you select the perfect share today?";
      }

      return res.status(200).json({ reply });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Format chat history for Gemini contents
    const contents: any[] = [];

    if (Array.isArray(history)) {
      for (const item of history) {
        if (item.role && item.content) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.content }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || "Thank you for asking about Bastanzi Premium Beef Co. How else can I assist you with your beef share selection?";

    return res.status(200).json({ reply });
  } catch (err: any) {
    console.error('Gemini chat API error:', err);
    return res.status(500).json({
      error: 'Concierge is currently busy.',
      details: err?.message || 'Error processing request',
    });
  }
}
