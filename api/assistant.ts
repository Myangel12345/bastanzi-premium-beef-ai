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
      return res.status(200).json({
        reply: getDynamicFallbackAnswer(prompt, history),
        simulated: true,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are the Master Cattle & Beef Concierge for Bastanzi Premium Beef Co., located in Sheridan, Montana. Your role is to provide expert, warm, natural, and helpful advice to customers regarding our pasture-raised, grass & grain finished beef shares.

Knowledge Base:
1. Beef Shares & Pricing:
   - Quarter Share: ~100-115 lbs packaged beef ($1,150). Ideal for small families (1-3 people). Requires ~4.0 cu ft freezer.
   - Half Share: ~200-230 lbs packaged beef ($2,200). Most popular. Custom butcher cut sheet options. Requires ~8.0 cu ft freezer.
   - Whole Share: ~400-460 lbs packaged beef ($4,200). Best value for large families or co-ops. Full custom cut sheet. Requires ~16.0 cu ft freezer.
   - Eighth Sampler: ~50-58 lbs packaged beef ($620). Fits in standard refrigerator freezer (~2.0 cu ft).
2. Hanging Weight vs Packaged Weight:
   - Hanging weight is the weight of the carcass after harvest & skinning before dry-aging and trimming.
   - Packaged (take-home) weight is ~60% to 65% of the hanging weight after dry aging (14-21 days) and bone/fat trimming. We quote and sell based on actual take-home cut packages or transparent hanging estimates!
3. Available Cuts:
   - Steaks: Ribeye, New York Strip, Tenderloin/Filet Mignon, T-Bone, Porterhouse, Sirloin, Flank, Skirt.
   - Roasts: Chuck Roast, Prime Rib, Arm Roast, Rump Roast, Brisket, Short Ribs, Stew Meat.
   - Burger: 85/15 lean-to-fat ratio artisan ground beef vacuum sealed in 1 lb packages.
4. USDA Processing & Quality:
   - Processed in a federally inspected USDA facility.
   - Aged for 14-21 days for maximum tenderness and deep flavor development.
   - Heavy-duty vacuum-sealed in 4mil protective film (prevents freezer burn up to 2 years).
   - Flash-frozen at -20°F.
5. Shipping, Delivery & Pickup:
   - Shipped via OGFCARGO Cold Chain Logistics in heavy insulated eco-coolers with dry ice. Guaranteed frozen arrival!
   - Pickup options available directly at Sheridan Ranch Station, MT or partner USDA processor facilities.
6. Ordering & Payment:
   - Reserve online with 50% deposit or full payment.
   - Major credit cards, Apple Pay, electronic check accepted.
7. Farm Practices:
   - Pasture-raised in Montana valleys with clean mountain water. No added growth hormones, no subtherapeutic antibiotics.
   - Choose between 100% Grass-Fed & Finished (leaner, earthy flavor) or Pasture-Raised Grain-Finished (rich marbling and buttery flavor).

Behavior Guidelines:
- Answer naturally and directly. Do NOT repeat fixed scripts.
- Speak conversationally like a knowledgeable Montana rancher and master butcher.
- Ask relevant follow-up questions when helpful (e.g., asking about household size, freezer space, or cooking preferences).
- Only advise contacting customer service if a specific custom request cannot be answered by standard knowledge.`;

    // Construct content array if history exists
    let contents: any = prompt;
    if (Array.isArray(history) && history.length > 0) {
      const formattedHistory = history.map((item: any) => ({
        role: item.role === 'user' ? 'user' : 'model',
        parts: [{ text: item.text || item.content }],
      }));
      formattedHistory.push({ role: 'user', parts: [{ text: prompt }] });
      contents = formattedHistory;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Thank you for reaching out to Bastanzi Beef. How else can I assist you with your beef share selection today?';

    return res.status(200).json({ reply, success: true });
  } catch (err: any) {
    console.error('Gemini Assistant error:', err);
    return res.status(200).json({
      reply: getDynamicFallbackAnswer(req.body?.prompt || '', req.body?.history),
      error: err.message,
    });
  }
}

function getDynamicFallbackAnswer(prompt: string, history?: any[]): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('hanging') || lower.includes('yield') || lower.includes('packaged weight') || lower.includes('cut weight')) {
    return 'Hanging weight refers to the carcass weight right after harvest before dry aging and trimming. When dry-aged (14-21 days) and butchered, your actual packaged take-home beef yield is typically about 60% to 65% of hanging weight. For example, a 200 lb hanging quarter share yields ~110-120 lbs of cut, vacuum-sealed meat in your freezer! Do you have a specific share size in mind?';
  }

  if (lower.includes('freezer') || lower.includes('storage') || lower.includes('cu ft') || lower.includes('cubic')) {
    return 'A general rule of thumb is 1 cubic foot of freezer space per 35-40 lbs of packaged beef. A Quarter share (~100 lbs) needs about 3.5 to 4 cubic feet (a small chest freezer), a Half share (~200 lbs) needs 8 cubic feet, and a Whole share needs ~16 cubic feet. Would you like help calculating freezer space for your household?';
  }

  if (lower.includes('usda') || lower.includes('process') || lower.includes('butcher') || lower.includes('dry age') || lower.includes('age')) {
    return 'All Bastanzi cattle are processed in a USDA-inspected facility. Our beef undergoes a dry-aging process for 14 to 21 days to enhance tenderness and flavor, then each cut is individually vacuum-sealed in 4mil heavy packaging and flash-frozen at -20°F. Would you like to know more about custom cut sheet choices?';
  }

  if (lower.includes('cut') || lower.includes('ribeye') || lower.includes('steak') || lower.includes('ground') || lower.includes('roast')) {
    return 'Our beef shares include a balanced selection of luxury cuts: Ribeyes, New York Strips, Filet Mignon/Tenderloin, T-Bones (on half & whole shares), Chuck and Rump Roasts, Brisket, Short Ribs, and 85/15 artisan ground beef in 1 lb vacuum packs. Are you looking for specific cuts for grilling or slow-cooking?';
  }

  if (lower.includes('ship') || lower.includes('delivery') || lower.includes('pickup') || lower.includes('track') || lower.includes('carrier')) {
    return 'We ship directly to your door using OGFCARGO Cold Chain Logistics inside heavy dry-ice insulated eco-coolers. You will receive a tracking waybill (OGF-XXXXXXX) to monitor real-time shipping. Pickup is also available at our Sheridan, MT ranch station or local processing center! Where are you located?';
  }

  if (lower.includes('price') || lower.includes('cost') || lower.includes('deposit') || lower.includes('pay')) {
    return 'Our pricing is all-inclusive with no hidden butcher fees: Quarter Share is $1,150 (~$10-11/lb take-home), Half Share is $2,200, Whole Share is $4,200, and our Eighth Sampler is $620. We accept online reservations with a 50% deposit or full payment. Would you like to place a reservation?';
  }

  if (lower.includes('grass') || lower.includes('grain') || lower.includes('finish') || lower.includes('practice') || lower.includes('farm') || lower.includes('ranch')) {
    return 'We raise all cattle on lush Montana pastures without added growth hormones or antibiotics. We offer two finishing styles: 100% Grass-Fed & Finished (leaner, rich natural flavor) and Pasture-Raised Grain-Finished (exceptional marbling and buttery tenderness). Which flavor profile does your family prefer?';
  }

  return 'Welcome to Bastanzi Premium Beef Co.! I can answer questions regarding our Quarter, Half, and Whole beef shares, available cuts, USDA dry-aging process, freezer storage requirements, or OGFCARGO cold chain shipping. What topic would you like to explore today?';
}
