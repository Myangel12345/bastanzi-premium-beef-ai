import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import {
  getOrCreateConversation,
  saveConversation,
  ChatMessage,
} from './chat-store.ts';
import { loadContentStore } from './content-store.ts';

function buildDynamicSystemInstruction(): string {
  const store = loadContentStore();
  const tiers = store.shareTiers;
  const fees = store.fees;

  let tiersFormatted = tiers
    .map(
      (t) =>
        `- ${t.title} (${t.id}): ${t.priceRange} (Deposit: $${t.depositAmount}). Weight: ${t.weightLbs} (~${t.approxMeals} meals). Freezer space: ${t.freezerSpaceRequired}. Status: ${t.availabilityStatus || 'In Stock'} (${t.availabilityNote || 'Available'}). Best for: ${t.bestFor}.`
    )
    .join('\n');

  let feesFormatted = `
- Processing Fee: $${fees.processingFee} (${fees.processingFeeNote})
- Local Delivery Fee: $${fees.localDeliveryFee} (${fees.localDeliveryFeeNote})
- Nationwide Shipping Fee: $${fees.nationwideShippingFee} (${fees.nationwideShippingFeeNote})
- Active Promotion: ${fees.promotionalActive ? `Code ${fees.promotionalCode || 'ACTIVE'}: ${fees.promotionalBannerText || ''} ($${fees.promotionalDiscountAmount || 0} off)` : 'None'}
`;

  return `
You are the AI Beef Concierge and Customer Service Specialist for Bastanzi Premium Beef Co., an artisan ranch offering pasture-raised, 21-day dry-aged luxury beef shares delivered pasture to table.
Your tone is sophisticated, warm, helpful, authoritative, trustworthy, and welcoming—like an expert ranch owner or master butcher.

LIVE ADMIN-MANAGED KNOWLEDGE BASE (AUTOMATICALLY SYNCHRONIZED):
1. Bastanzi Premium Beef Co. Overview:
   - High-quality beef shares delivered pasture to table.
   - 21-day dry aging in custom cedar chambers for superior tenderness and intense steakhouse flavor.
   - USDA-inspected hand butchery meeting strict quality standards.

2. Live Beef Share Tiers & Current Pricing:
${tiersFormatted}
   - Custom & Smaller Shares (< 1/8th Share): Advise customers to select "Contact for Pricing" on the Beef Shares page or contact concierge directly via info@bastanzibeef.com or the Contact page.

3. Current Fees & Promotional Rates:
${feesFormatted}

4. Available Beef Cuts Included in Shares:
   - Prime Steaks: French-cut Bone-in & Boneless Ribeyes, Filet Mignon (Tenderloin), New York Strip, T-Bone/Porterhouse, Top Sirloin, Flank & Skirt Steaks.
   - Roasts & Slow Cooking: Chuck & Arm Roasts, Prime Rib Roasts, Whole Packer Brisket, Rump Roast, English Cut Short Rib Racks, Oxtail, Stew Meat, Soup Marrow Bones.
   - Ground Beef: Gourmet single-source ground beef (80/20 & 90/10 lean ratios) in 1lb flash-frozen vacuum packs.

5. Hanging Weight vs Packaged Take-Home Weight:
   - Hanging weight is carcass weight before dry aging and trimming.
   - Bastanzi transparently sells packaged take-home weight (~60-65% yield of hanging weight after 21 days of dry aging loss and precision trimming). Customers pay only for exact packaged cut weight.

6. Finishing Options:
   - 100% Grass-Fed: Pasture raised for life. Leaner, mineral-rich, herbal flavor profile high in Omega-3s and CLA.
   - Grain-Finished: Grazes pasture for 85% of life, finished on non-GMO local barley & alfalfa for heavy, buttery steakhouse marbling.
   - Mixed Split: Available on Full and Half shares (50% Grass-Fed, 50% Grain-Finished).

7. Shipping & Delivery:
   - Local Doorstep Delivery in Phoenix Metro Area (Phoenix, Scottsdale, Paradise Valley, Gilbert, Chandler, Mesa, Cave Creek, Carefree).
   - Insulated Nationwide Express Shipping: Packed with dry ice in eco-friendly cooler boxes. Guaranteed 100% rock-solid frozen arrival.

8. Ordering & Reservation Process:
   - Select share tier & finishing option on website.
   - Fill out delivery address details.
   - Place a small deposit to lock animal allocation for the current harvest batch.
   - Master butcher conducts consultation for custom cut preferences on Full & Half shares.

CUSTOMER SERVICE & ESCALATION POLICY:
- Do NOT automatically tell customers to contact the company or a human agent right away.
- Attempt to fully solve the customer's question first using product details, explanations, recommendations, or ordering guidance.
- Always quote the EXACT current prices and promotions from the live knowledge base above.
- Ask relevant follow-up questions if needed (e.g. household size, freezer space, cut preferences).
- ONLY offer a human agent or escalate when:
  a) The customer specifically asks to speak with a person, human, agent, or representative.
  b) The issue requires human authorization, payment assistance, private order modification, or account-specific support.
  c) You cannot confidently resolve the issue after reasonable attempts.
- When escalating or connecting to a human agent, you MUST include this exact sentence in your response:
  "I can connect you with a Bastanzi Premium Beef Co. support representative. Please wait while we connect you."
`;
}

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
        message: escalationReply,
        reply: escalationReply,
        conversation: conv,
      });
    }

    // Call Gemini API for smart concierge response with conversation memory
    const apiKey = process.env.GEMINI_API_KEY;

    let replyText = '';

    if (!apiKey) {
      console.warn('[Chat API] GEMINI_API_KEY is missing in process.env. Generating fallback response from live knowledge base.');
      const liveStore = loadContentStore();
      const liveTiers = liveStore.shareTiers;
      const pricesSummary = liveTiers.map((t) => `${t.title}: ${t.priceRange} ($${t.depositAmount} deposit, ${t.weightLbs})`).join(', ');

      replyText = "Welcome to Bastanzi Premium Beef Co.! ";
      if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
        replyText += `Our live Beef Share rates are: ${pricesSummary}. Local delivery is $${liveStore.fees.localDeliveryFee} and nationwide express shipping is $${liveStore.fees.nationwideShippingFee}.`;
      } else if (lower.includes('freezer') || lower.includes('space')) {
        replyText += "Rule of thumb: 1 cubic foot holds ~35–40 lbs of packaged beef. An Eighth Share fits right inside a standard kitchen refrigerator freezer (~2–2.5 cu. ft.), a Quarter Share needs 4–5 cu. ft., a Half Share needs 8–10 cu. ft., and a Full Share requires an 18 cu. ft. chest freezer.";
      } else if (lower.includes('cut') || lower.includes('ribeye') || lower.includes('brisket') || lower.includes('filet')) {
        replyText += "All of our shares include a balanced mix of 21-day dry-aged Prime Steaks (Ribeyes, NY Strips, Filet Mignon, Sirloin), Roasts & Slow Cuts (Chuck Roast, Brisket, Short Ribs, Rump Roast), and Gourmet Ground Beef (1lb vacuum packs).";
      } else {
        replyText += "We offer 21-day dry-aged pasture-raised beef shares with grass-fed and grain-finished butchering options, delivered direct to your door. How can I help you choose the right share today?";
      }
    } else {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        // Format previous messages (up to 12 recent messages) for memory context, ensuring strictly alternating roles
        const contents: any[] = [];
        const historyMsgs = conv.messages.slice(-12);

        for (const m of historyMsgs) {
          const role = m.sender === 'user' ? 'user' : m.sender === 'ai' ? 'model' : null;
          if (!role) continue;

          const text = (m.text || '').trim();
          if (!text) continue;

          if (contents.length > 0 && contents[contents.length - 1].role === role) {
            contents[contents.length - 1].parts[0].text += '\n\n' + text;
          } else {
            contents.push({
              role,
              parts: [{ text }],
            });
          }
        }

        // CRITICAL FIX: Gemini API requires contents[0].role to be 'user'
        while (contents.length > 0 && contents[0].role === 'model') {
          contents.shift();
        }

        // Ensure contents is non-empty and has at least the current user message
        if (contents.length === 0) {
          contents.push({
            role: 'user',
            parts: [{ text: message.trim() }],
          });
        }

        console.log(`[Chat API] Invoking Gemini API (gemini-3.6-flash) with ${contents.length} message history blocks...`);
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents,
          config: {
            systemInstruction: buildDynamicSystemInstruction(),
            temperature: 0.7,
          },
        });

        let rawText = '';
        if (typeof response?.text === 'string' && response.text.trim()) {
          rawText = response.text.trim();
        } else if (response?.candidates?.[0]?.content?.parts) {
          rawText = response.candidates[0].content.parts
            .map((p: any) => p?.text || '')
            .join('')
            .trim();
        }

        console.log('[Chat API] Gemini API response received. Character length:', rawText.length);

        if (rawText) {
          replyText = rawText;
        } else {
          console.warn('[Chat API] Gemini returned an empty or whitespace text response.');
          replyText = "Sorry, I’m temporarily unable to answer right now. Please try again.";
        }
      } catch (geminiErr: any) {
        console.error('[Chat API] Gemini API execution failed:', geminiErr?.stack || geminiErr?.message || geminiErr);
        replyText = "Sorry, I’m temporarily unable to answer right now. Please try again.";
      }
    }

    // Ensure replyText is never blank
    if (!replyText || !replyText.trim()) {
      replyText = "Sorry, I’m temporarily unable to answer right now. Please try again.";
    }

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

    return res.status(200).json({
      message: replyText,
      reply: replyText,
      conversation: conv,
    });
  } catch (err: any) {
    console.error('[Chat API] Handler error caught:', err?.stack || err?.message || err);
    
    // Always return a valid message field to prevent blank customer messages
    const fallbackMessage = "Sorry, I’m temporarily unable to answer right now. Please try again.";
    return res.status(200).json({
      message: fallbackMessage,
      reply: fallbackMessage,
      error: err?.message || 'Server processing error',
    });
  }
}
