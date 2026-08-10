import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import {
  getOrCreateConversation,
  saveConversation,
  ChatMessage,
  deduplicateMessages,
} from './chat-store';
import { loadContentStore } from './content-store';

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

CONVERSATION & MEMORY GUIDELINES:
- Pay close attention to the conversation history. Keep responses natural, direct, concise, and focused on the user's exact current question.
- For simple greetings (e.g., "Hello", "Hi"), give a brief warm welcome and ask how you can help. Do not repeat full company overviews or price lists unless asked.
- When asked what beef shares or options we offer, explicitly detail all four share tiers: Full Beef Share (400–440 lbs), Half Beef Share (200–220 lbs), Quarter Beef Share (100–110 lbs), and Eighth Beef Share (50–55 lbs).
- When asked follow-up questions (e.g., "How much is the half share?" or "How much freezer space would I need?"), reference previous turns and answer directly for that specific share size (e.g., Half Share is $1,650–$2,085 and needs 8–10 cu. ft. of freezer space).

LIVE ADMIN-MANAGED KNOWLEDGE BASE (AUTOMATICALLY SYNCHRONIZED):
1. Bastanzi Premium Beef Co. Overview:
   - High-quality beef shares delivered pasture to table.
   - 21-day dry aging in custom cedar chambers for superior tenderness and intense steakhouse flavor.
   - USDA-inspected hand butchery meeting strict quality standards.

2. Live Beef Share Tiers & Current Pricing:
${tiersFormatted}
   - When asked what beef shares, options, or tiers we offer, explicitly list each of the 4 tiers (Full, Half, Quarter, Eighth) with their packaged weights and pricing.
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

function getKnowledgeBaseReply(message: string, historyMsgs: ChatMessage[] = []): string {
  const liveStore = loadContentStore();
  const liveTiers = liveStore.shareTiers;
  const pricesSummary = liveTiers
    .map((t) => `${t.title}: ${t.priceRange} ($${t.depositAmount} deposit, ${t.weightLbs})`)
    .join(', ');

  const lower = message.toLowerCase();

  // Extract contextual clues from last 4 turns if user uses pronouns ("it", "that", "mine", "the half", "the price")
  let contextualTopic = '';
  if (historyMsgs && historyMsgs.length > 0) {
    const recentText = historyMsgs
      .slice(-4)
      .map((m) => (m.text || '').toLowerCase())
      .join(' ');
    if (recentText.includes('half')) contextualTopic = 'half';
    else if (recentText.includes('full')) contextualTopic = 'full';
    else if (recentText.includes('quarter')) contextualTopic = 'quarter';
    else if (recentText.includes('eighth')) contextualTopic = 'eighth';
  }

  const hasPronounRef =
    lower.includes('it') ||
    lower.includes('that') ||
    lower.includes('this') ||
    lower.includes('mine') ||
    lower.includes('the price') ||
    lower.includes('the half') ||
    lower.includes('the cost') ||
    lower.includes('does it') ||
    lower.includes('does that');

  const isGeneralQuestion =
    lower.includes('which') ||
    lower.includes('all') ||
    lower.includes('each') ||
    lower.includes('compare') ||
    lower.includes('sizes') ||
    lower.includes('options') ||
    lower.includes('every');

  const activeTopic = hasPronounRef && !isGeneralQuestion ? contextualTopic : '';

  if (lower.includes('freezer') || lower.includes('space') || lower.includes('cubic') || lower.includes('cu. ft') || lower.includes('cu ft')) {
    if (lower.includes('half') || activeTopic === 'half') {
      return "For a Half Beef Share (~200–220 lbs), you will need 8–9 cu. ft. of freezer space (a medium chest freezer).";
    } else if (lower.includes('full') || activeTopic === 'full') {
      return "For a Full Beef Share (~400–440 lbs), you will need 16–18 cu. ft. of freezer space (a large chest freezer).";
    } else if (lower.includes('quarter') || activeTopic === 'quarter') {
      return "For a Quarter Beef Share (~100–110 lbs), you will need 4.5–5 cu. ft. of freezer space.";
    } else if (lower.includes('eighth') || activeTopic === 'eighth') {
      return "An Eighth Beef Share (~50–55 lbs) needs 1.5–2 cu. ft. of freezer space and fits right in a standard kitchen refrigerator freezer.";
    }
    return "Freezer space rules of thumb: Eighth Share needs 1.5–2 cu ft, Quarter Share needs 4.5–5 cu ft, Half Share needs 8–9 cu ft, Full Share needs 16–18 cu ft.";
  }

  if (
    lower.includes('price') ||
    lower.includes('cost') ||
    lower.includes('how much') ||
    lower.includes('rate') ||
    lower.includes('deposit')
  ) {
    if (lower.includes('half') || activeTopic === 'half') {
      return "Our Half Beef Share is priced between $1,650 and $2,085 ($300 deposit) for ~200–220 lbs of 21-day dry-aged packaged beef. It includes a custom master butcher consultation for your favorite cuts.";
    } else if (lower.includes('full') || activeTopic === 'full') {
      return "Our Full Beef Share is priced between $3,300 and $4,200 ($500 deposit) for ~400–440 lbs of packaged beef with custom butcher options.";
    } else if (lower.includes('quarter') || activeTopic === 'quarter') {
      return "Our Quarter Beef Share is priced between $850 and $1,050 ($200 deposit) for ~100–110 lbs of packaged beef.";
    } else if (lower.includes('eighth') || activeTopic === 'eighth') {
      return "Our Eighth Beef Share is priced between $450 and $550 ($100 deposit) for ~50–55 lbs of packaged beef.";
    }
    return `Our live Beef Share rates are: ${pricesSummary}. Local delivery is $${liveStore.fees.localDeliveryFee} and nationwide express shipping is $${liveStore.fees.nationwideShippingFee}.`;
  }

  if (
    lower.includes('hanging') ||
    lower.includes('take-home') ||
    lower.includes('take home') ||
    lower.includes('packaged weight') ||
    lower.includes('cut weight') ||
    lower.includes('yield') ||
    lower.includes('carcass')
  ) {
    return "Hanging weight is carcass weight before 21 days of dry-aging and trimming. Bastanzi transparently sells exact packaged take-home weight (~60–65% yield of hanging weight). You pay only for exact packaged cut weight!";
  }

  if (lower.includes('grass') || lower.includes('grain') || lower.includes('finishing') || lower.includes('marbling')) {
    return "We offer both 100% Grass-Fed (leaner, mineral-rich, herbal flavor high in Omega-3s) and Grain-Finished (pasture-raised for 85% of life, finished on local barley & alfalfa for rich, buttery marbling). Full and Half shares also offer a 50/50 Mixed Split!";
  }

  if (lower.includes('cut') || lower.includes('ribeye') || lower.includes('brisket') || lower.includes('filet') || lower.includes('steak') || lower.includes('roast') || lower.includes('ground')) {
    return "All of our shares include a balanced selection of 21-day dry-aged Prime Steaks (Ribeyes, NY Strips, Filet Mignon, Sirloins), Roasts & Slow Cuts (Chuck Roast, Brisket, Short Ribs, Rump Roast), and Gourmet Ground Beef in 1lb vacuum packs.";
  }

  if (lower.includes('shipping') || lower.includes('delivery') || lower.includes('ship') || lower.includes('deliver') || lower.includes('phoenix') || lower.includes('arizona')) {
    return "We offer free local doorstep delivery across the Phoenix Metro area (Phoenix, Scottsdale, Paradise Valley, Gilbert, Chandler, Mesa, Cave Creek). Nationwide express shipping is $49 in insulated cooler boxes with dry ice, guaranteed 100% frozen arrival!";
  }

  if (lower.includes('reserve') || lower.includes('order') || lower.includes('buy') || lower.includes('deposit') || lower.includes('how to')) {
    return "To reserve a share, click 'Reserve Share' on our website, select your size (Full, Half, Quarter, or Eighth) and finishing choice (Grass-Fed or Grain-Finished), enter your delivery details, and pay a small deposit to lock your harvest allocation.";
  }

  if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey') || lower.includes('welcome') || lower.includes('good morning') || lower.includes('good afternoon')) {
    return "Welcome to Bastanzi Premium Beef Co.! We offer 21-day dry-aged pasture-raised beef shares with grass-fed and grain-finished butchering options, delivered direct to your door. How can I help you choose the right share today?";
  }

  if (lower.includes('half share') || lower.includes('half')) {
    return "Our Half Beef Share gives you ~200–220 lbs of packaged 21-day dry-aged beef ($1,650–$2,085, $300 deposit). It requires 8–10 cu. ft. of freezer space and includes a custom master butcher consult.";
  }

  if (lower.includes('share') || lower.includes('offer') || lower.includes('option') || lower.includes('tier') || lower.includes('size')) {
    return "We offer four pasture-raised 21-day dry-aged beef share sizes: Full Share (400–440 lbs, $3,300–$4,200), Half Share (200–220 lbs, $1,650–$2,085), Quarter Share (100–110 lbs, $850–$1,050), and Eighth Share (50–55 lbs, $450–$550). All shares feature 100% grass-fed or grain-finished options.";
  }

  return "Welcome to Bastanzi Premium Beef Co.! We offer 21-day dry-aged pasture-raised beef shares (Full, Half, Quarter, Eighth) with grass-fed and grain-finished butchering options, delivered direct to your door. How can I help you choose the right share today?";
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

    console.log('[Chat API] Incoming user message:', message, '| convId:', reqConvId);

    if (!message || typeof message !== 'string' || !message.trim()) {
      console.warn('[Chat API] Empty or invalid user message received.');
      return res.status(400).json({
        message: 'Message is required.',
        error: 'Message is required.',
      });
    }

    const conversationId = reqConvId || 'conv_' + Date.now();
    const conv = getOrCreateConversation(conversationId, customerName, customerEmail);

    const nowIso = new Date().toISOString();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Check if human agent is currently handling this conversation
    if (conv.status === 'human_handled') {
      const userMsg: ChatMessage = {
        id: 'usr_' + Date.now(),
        sender: 'user',
        text: message.trim(),
        timestamp: nowTime,
        createdAt: nowIso,
      };
      conv.messages.push(userMsg);
      conv.lastMessage = userMsg.text;
      conv.unreadAdmin = true;
      saveConversation(conv);

      const humanHandledReply = "A customer service representative is currently handling your chat and will respond shortly.";
      console.log('[Chat API] Chat handled by human agent. Returning message:', humanHandledReply);
      return res.status(200).json({
        message: humanHandledReply,
        reply: humanHandledReply,
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

      const userMsg: ChatMessage = {
        id: 'usr_' + Date.now(),
        sender: 'user',
        text: message.trim(),
        timestamp: nowTime,
        createdAt: nowIso,
      };
      conv.messages.push(userMsg);

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

      console.log('[Chat API] Explicit escalation triggered. Returning message:', escalationReply);
      return res.status(200).json({
        message: escalationReply,
        reply: escalationReply,
        conversation: conv,
      });
    }

    // STAGE 1 = Request received
    console.log('[STAGE 1] Request received | Message:', message, '| convId:', reqConvId);

    // STAGE 2 = Gemini initialized / Environment check
    const apiKey = process.env.GEMINI_API_KEY;
    const hasApiKey = !!apiKey && apiKey.trim().length > 0 && apiKey !== 'MY_GEMINI_API_KEY';
    console.log('[STAGE 2] Gemini initializing... GEMINI_API_KEY exists in process.env:', hasApiKey);

    let replyText = '';

    if (!hasApiKey) {
      console.warn('[STAGE 2 WARNING] GEMINI_API_KEY is missing in process.env. Generating fallback response from live knowledge base.');
      conv.messages = deduplicateMessages(conv.messages);
      const historyMsgs = conv.messages.slice(-12);
      replyText = getKnowledgeBaseReply(message, historyMsgs);
      console.log('[STAGE 2 SUCCESS] Knowledge base fallback generated successfully. Length:', replyText.length);
    } else {
      let aiClient: GoogleGenAI | null = null;
      try {
        aiClient = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        console.log('[STAGE 2 SUCCESS] @google/genai client initialized successfully.');
      } catch (initErr: any) {
        console.error('[STAGE 2 FAILED] @google/genai client initialization exception:', initErr?.message || initErr);
        conv.messages = deduplicateMessages(conv.messages);
        const historyMsgs = conv.messages.slice(-12);
        replyText = getKnowledgeBaseReply(message, historyMsgs);
      }

      if (!replyText) {
        // Format previous messages for memory context, ensuring strictly alternating roles
        conv.messages = deduplicateMessages(conv.messages);
        const historyMsgs = conv.messages.slice(-12);
        const contents: any[] = [];

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

        // Gemini API requires contents[0].role to be 'user'
        while (contents.length > 0 && contents[0].role === 'model') {
          contents.shift();
        }

        // Append current user message exactly once
        const currentUserText = message.trim();
        if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
          contents.push({
            role: 'user',
            parts: [{ text: currentUserText }],
          });
        } else if (contents[contents.length - 1].parts[0].text !== currentUserText) {
          contents.push({
            role: 'user',
            parts: [{ text: currentUserText }],
          });
        }

        // STAGE 3 = Gemini request sent (with 30-second timeout)
        const primaryModel = 'gemini-3.6-flash';
        const fallbackModel = 'gemini-flash-latest';
        console.log(`[STAGE 3] Gemini request starting... Model: ${primaryModel} | History blocks: ${contents.length}`);
        console.log('[STAGE 3] Gemini contents payload:', JSON.stringify(contents, null, 2));

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API request timed out after 30 seconds')), 30000)
        );

        let response: any = null;
        let usedModel = primaryModel;

        try {
          const geminiPromise = aiClient.models.generateContent({
            model: primaryModel,
            contents,
            config: {
              systemInstruction: buildDynamicSystemInstruction(),
              temperature: 0.7,
            },
          });

          response = await Promise.race([geminiPromise, timeoutPromise]);
        } catch (primaryErr: any) {
          console.warn(`[STAGE 3 WARNING] Primary model ${primaryModel} failed (${primaryErr?.message}). Retrying with ${fallbackModel}...`);
          usedModel = fallbackModel;
          try {
            const fallbackPromise = aiClient.models.generateContent({
              model: fallbackModel,
              contents,
              config: {
                systemInstruction: buildDynamicSystemInstruction(),
                temperature: 0.7,
              },
            });
            response = await Promise.race([fallbackPromise, timeoutPromise]);
          } catch (fallbackErr: any) {
            console.warn('[STAGE 3 WARNING] Gemini API call failed or had insufficient scopes. Generating response from live knowledge base. Error:', fallbackErr?.message || fallbackErr);
            replyText = getKnowledgeBaseReply(message, historyMsgs);
          }
        }

        if (response) {
          // STAGE 4 = Gemini response received
          console.log(`[STAGE 4] Gemini response received from model ${usedModel}. Available keys:`, Object.keys(response || {}));
          if (response?.candidates) {
            console.log('[STAGE 4] Candidate count:', response.candidates.length);
          }

          // STAGE 5 = Text successfully extracted
          let rawText = '';
          if (typeof response?.text === 'string' && response.text.trim()) {
            rawText = response.text.trim();
          } else if (response?.candidates?.[0]?.content?.parts) {
            rawText = response.candidates[0].content.parts
              .map((p: any) => p?.text || '')
              .join('')
              .trim();
          }

          console.log('[STAGE 5] Text extraction finished. Character length:', rawText.length);

          if (rawText && rawText.length > 0) {
            replyText = rawText;
            console.log('[STAGE 5 SUCCESS] Text successfully extracted from Gemini response.');
          }
        }
      }
    }

    if (!replyText || !replyText.trim() || replyText === 'TEMPORARY_ERROR') {
      console.warn('[STAGE 5 FALLBACK] Reply text empty after AI processing. Using live knowledge base fallback.');
      conv.messages = deduplicateMessages(conv.messages);
      const historyMsgs = conv.messages.slice(-12);
      replyText = getKnowledgeBaseReply(message, historyMsgs);
    }

    // STAGE 6 = JSON response returned & conversation saved
    // CRITICAL REQUIREMENT: Do NOT save conversation to chat-store.ts until AFTER a valid non-empty AI response has been generated!
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: message.trim(),
      timestamp: nowTime,
      createdAt: nowIso,
    };
    conv.messages.push(userMsg);

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

    console.log('[STAGE 6 SUCCESS] Non-empty AI response verified & conversation saved to store. Returning JSON response to client.');

    return res.status(200).json({
      message: replyText,
      reply: replyText,
      conversation: conv,
    });
  } catch (err: any) {
    console.error('[Chat API] Critical handler error caught:', err?.stack || err?.message || err);
    
    let fallbackMessage = getKnowledgeBaseReply(req?.body?.message || '');
    return res.status(200).json({
      message: fallbackMessage,
      reply: fallbackMessage,
      error: err?.message || 'Server processing error',
    });
  }
}
