import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import {
  getOrCreateConversation,
  saveConversation,
  ChatMessage,
} from './chat-store.ts';

const SYSTEM_INSTRUCTION = `
You are the AI Beef Concierge and Customer Service Specialist for Bastanzi Premium Beef Co., an artisan ranch offering pasture-raised, 21-day dry-aged luxury beef shares delivered pasture to table.
Your tone is sophisticated, warm, helpful, authoritative, trustworthy, and welcoming—like an expert ranch owner or master butcher.

KNOWLEDGE BASE:
1. Bastanzi Premium Beef Co. Overview:
   - High-quality beef shares delivered pasture to table.
   - 21-day dry aging in custom cedar chambers for superior tenderness and intense steakhouse flavor.
   - USDA-inspected hand butchery meeting strict quality standards.

2. Beef Share Tiers & Specs:
   - Full Beef Share (Whole Animal): $3,300 – $4,200 ($500 deposit). 400–440 lbs packaged beef (~850 meals). Requires 16–20 cu. ft. chest freezer. Best for large families, neighborhood splitters, avid entertainers.
   - Half Beef Share: $1,650 – $2,085 ($300 deposit). 200–220 lbs packaged beef (~420 meals). Requires 8–10 cu. ft. medium chest freezer. Most popular for families of 3-5.
   - Quarter Beef Share: $850 – $1,050 ($200 deposit). 100–110 lbs packaged beef (~210 meals). Requires 4–5 cu. ft. freezer. Perfect for couples and small families (4-6 months supply).
   - Eighth Beef Share (Sampler): $450 – $550 ($100 deposit). 50–55 lbs packaged beef (~100 meals). Requires 2–2.5 cu. ft. (fits easily in standard kitchen refrigerator freezer!). Ideal for first-time buyers testing luxury pasture-raised beef.
   - Custom & Smaller Shares (< 1/8th Share): Advise customers to select "Contact for Pricing" on the Beef Shares page or contact concierge directly via info@bastanzibeef.com or the Contact page.

3. Available Beef Cuts Included in Shares:
   - Prime Steaks: French-cut Bone-in & Boneless Ribeyes, Filet Mignon (Tenderloin), New York Strip, T-Bone/Porterhouse, Top Sirloin, Flank & Skirt Steaks.
   - Roasts & Slow Cooking: Chuck & Arm Roasts, Prime Rib Roasts, Whole Packer Brisket, Rump Roast, English Cut Short Rib Racks, Oxtail, Stew Meat, Soup Marrow Bones.
   - Ground Beef: Gourmet single-source ground beef (80/20 & 90/10 lean ratios) in 1lb flash-frozen vacuum packs.

4. Hanging Weight vs Packaged Take-Home Weight:
   - Hanging weight is carcass weight before dry aging and trimming.
   - Bastanzi transparently sells packaged take-home weight (~60-65% yield of hanging weight after 21 days of dry aging loss and precision trimming). Customers pay only for exact packaged cut weight.

5. Finishing Options:
   - 100% Grass-Fed: Pasture raised for life. Leaner, mineral-rich, herbal flavor profile high in Omega-3s and CLA.
   - Grain-Finished: Grazes pasture for 85% of life, finished on non-GMO local barley & alfalfa for heavy, buttery steakhouse marbling.
   - Mixed Split: Available on Full and Half shares (50% Grass-Fed, 50% Grain-Finished).

6. Shipping & Delivery:
   - Local Doorstep Delivery in Phoenix Metro Area (Phoenix, Scottsdale, Paradise Valley, Gilbert, Chandler, Mesa, Cave Creek, Carefree).
   - Insulated Nationwide Express Shipping: Packed with dry ice in eco-friendly cooler boxes. Guaranteed 100% rock-solid frozen arrival.

7. Ordering & Reservation Process:
   - Select share tier & finishing option on website.
   - Fill out delivery address details.
   - Place a small refundable deposit ($100–$500) to lock animal allocation for the Fall 2026 dry-aging batch.
   - Master butcher conducts consultation for custom cut preferences on Full & Half shares.

CUSTOMER SERVICE & ESCALATION POLICY:
- Do NOT automatically tell customers to contact the company or a human agent right away.
- Attempt to fully solve the customer's question first using product details, explanations, recommendations, or ordering guidance.
- Ask relevant follow-up questions if needed (e.g. household size, freezer space, cut preferences).
- ONLY offer a human agent or escalate when:
  a) The customer specifically asks to speak with a person, human, agent, or representative.
  b) The issue requires human authorization, payment assistance, private order modification, or account-specific support.
  c) You cannot confidently resolve the issue after reasonable attempts.
- When escalating or connecting to a human agent, you MUST include this exact sentence in your response:
  "I can connect you with a Bastanzi Premium Beef Co. support representative. Please wait while we connect you."
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Customer polling for real-time conversation updates
  if (req.method === 'GET') {
    const conversationId = (req.query?.conversationId as string) || (req.query?.id as string);
    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId query param is required.' });
    }
    const conv = getOrCreateConversation(conversationId);
    // Clear unread for customer when they fetch
    if (conv.unreadCustomer) {
      conv.unreadCustomer = false;
      saveConversation(conv);
    }
    return res.status(200).json({ conversation: conv });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { message, conversationId: reqConvId, customerName, customerEmail } = body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const conversationId = reqConvId || 'conv_' + Date.now();
    const conv = getOrCreateConversation(conversationId, customerName, customerEmail);

    const nowIso = new Date().toISOString();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: message.trim(),
      timestamp: nowTime,
      createdAt: nowIso,
    };
    conv.messages.push(userMsg);
    conv.lastMessage = userMsg.text;

    // Check if human agent is currently handling this conversation
    if (conv.status === 'human_handled') {
      conv.unreadAdmin = true;
      saveConversation(conv);
      return res.status(200).json({
        conversation: conv,
        replyHandledByHuman: true,
      });
    }

    // Check for explicit escalation triggers in user text
    const lower = message.toLowerCase();
    const escalationKeywords = [
      'speak to a human',
      'talk to a human',
      'human agent',
      'speak to an agent',
      'talk to an agent',
      'speak to a person',
      'talk to a person',
      'real person',
      'representative',
      'human support',
      'customer service representative',
      'call me',
    ];
    const isExplicitEscalation = escalationKeywords.some((kw) => lower.includes(kw));

    if (isExplicitEscalation) {
      conv.status = 'escalated';
      conv.unreadAdmin = true;
      const escalationReply = "I can connect you with a Bastanzi Premium Beef Co. support representative. Please wait while we connect you.";
      
      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: escalationReply,
        timestamp: nowTime,
        createdAt: nowIso,
      };
      conv.messages.push(aiMsg);
      conv.lastMessage = escalationReply;
      saveConversation(conv);

      return res.status(200).json({
        reply: escalationReply,
        conversation: conv,
      });
    }

    // Call Gemini API for smart concierge response with conversation memory
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback response generator if key is missing
      let reply = "Welcome to Bastanzi Premium Beef Co.! ";
      if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
        reply += "Our Beef Shares range from $450–$550 for an Eighth Share (50-55 lbs), $850–$1,050 for a Quarter Share (100-110 lbs), $1,650–$2,085 for a Half Share (200-220 lbs), and $3,300–$4,200 for a Full Share (400-440 lbs). For custom boxes or smaller sampler orders, please select 'Contact for Pricing' on our Beef Shares page!";
      } else if (lower.includes('freezer') || lower.includes('space')) {
        reply += "Rule of thumb: 1 cubic foot holds ~35–40 lbs of packaged beef. An Eighth Share fits right inside a standard kitchen refrigerator freezer (~2–2.5 cu. ft.), a Quarter Share needs 4–5 cu. ft., a Half Share needs 8–10 cu. ft., and a Full Share requires an 18 cu. ft. chest freezer.";
      } else if (lower.includes('cut') || lower.includes('ribeye') || lower.includes('brisket') || lower.includes('filet')) {
        reply += "All of our shares include a balanced mix of 21-day dry-aged Prime Steaks (Ribeyes, NY Strips, Filet Mignon, Sirloin), Roasts & Slow Cuts (Chuck Roast, Brisket, Short Ribs, Rump Roast), and Gourmet Ground Beef (1lb vacuum packs).";
      } else {
        reply += "We offer 21-day dry-aged pasture-raised beef shares with grass-fed and grain-finished butchering options, delivered direct to your door. How can I help you choose the right share today?";
      }

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: reply,
        timestamp: nowTime,
        createdAt: nowIso,
      };
      conv.messages.push(aiMsg);
      conv.lastMessage = reply;
      saveConversation(conv);

      return res.status(200).json({ reply, conversation: conv });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Format previous messages (up to 12 recent messages) for memory context
    const contents: any[] = [];
    const historyMsgs = conv.messages.slice(-12);

    for (const m of historyMsgs) {
      if (m.sender === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: m.text }],
        });
      } else if (m.sender === 'ai') {
        contents.push({
          role: 'model',
          parts: [{ text: m.text }],
        });
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    let replyText = response.text || "Thank you for asking about Bastanzi Premium Beef Co. How else can I assist you with your beef share selection?";

    // Check if Gemini triggered escalation wording
    if (replyText.includes("I can connect you with a Bastanzi Premium Beef Co. support representative")) {
      conv.status = 'escalated';
      conv.unreadAdmin = true;
    } else if (conv.status === 'resolved') {
      conv.status = 'ai_handled';
    }

    const aiMsg: ChatMessage = {
      id: 'ai_' + Date.now(),
      sender: 'ai',
      text: replyText,
      timestamp: nowTime,
      createdAt: nowIso,
    };
    conv.messages.push(aiMsg);
    conv.lastMessage = replyText;
    saveConversation(conv);

    return res.status(200).json({ reply: replyText, conversation: conv });
  } catch (err: any) {
    console.error('Gemini chat API error:', err);
    return res.status(500).json({
      error: 'Concierge desk is temporarily busy.',
      details: err?.message || 'Error processing request',
    });
  }
}
