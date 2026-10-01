import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import {
  getOrCreateConversation,
  saveConversation,
  ChatMessage,
  deduplicateMessages,
} from './chat-store';
import { loadContentStore } from './content-store';
import {
  getInternalNotificationEmail,
  sendEmailWithDiagnostics,
} from './email-service';

function buildDynamicSystemInstruction(): string {
  const store = loadContentStore();
  const tiers = store.shareTiers;
  const fees = store.fees;

  const tiersFormatted = tiers
    .map(
      (t) =>
        `- ${t.title} (${t.id}): ${t.priceRange} (Deposit: $${t.depositAmount}). Weight: ${t.weightLbs} (~${t.approxMeals} meals). Freezer space required: ${t.freezerSpaceRequired}. Status: ${t.availabilityStatus || 'In Stock'} (${t.availabilityNote || 'Available'}). Best for: ${t.bestFor}. Steaks included: ${t.cutSummary?.steaks?.join(', ') || 'Prime cuts'}. Roasts: ${t.cutSummary?.roastsAndSlow?.join(', ') || 'Artisanal roasts'}. Ground/Specialty: ${t.cutSummary?.groundAndSpecialty?.join(', ') || 'Dry-aged ground beef'}.`
    )
    .join('\n');

  const feesFormatted = `
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
- When asked follow-up questions (e.g., "How much is the half share?" or "How much freezer space would I need?"), reference previous turns and answer directly for that specific share size (e.g., Half Share is $1,650–$2,085 and needs 8–9 cu. ft. of freezer space).
- When user asks "Which share size fits my freezer space?", provide the clear breakdown: "Eighth Share needs 1.5–2 cu ft, Quarter Share needs 4.5–5 cu ft, Half Share needs 8–9 cu ft, Full Share needs 16–18 cu ft."
- When user asks "What is the difference between hanging weight and take-home weight?", explain that hanging weight is carcass weight before 21 days of dry aging and trimming, whereas Bastanzi transparently sells exact packaged take-home weight (~60–65% yield of hanging weight after moisture loss and precision trimming). Customers pay only for take-home cut weight!
- When asked about pricing for shares smaller than an Eighth Share or custom orders, explain that for custom orders or portions smaller than an Eighth Share (~50–55 lbs), customers should select "Contact for Pricing" on the Beef Shares page or contact the concierge team directly at info@bastanzibeef.com.
- When asked about prime steaks or cuts included in a Quarter Share, quote the exact steaks from the live store: 4–5 Prime Ribeye Steaks, 4–5 NY Strip Steaks, 2–3 Filet Mignons, and 2 Top Sirloin Steaks.
- When asked about 100% Grass-Fed vs Grain-Finished cuts, explain that 100% Grass-Fed is leaner, mineral-rich, herbal in flavor, and high in Omega-3s and CLA; Grain-Finished grazes pasture for 85% of life and is finished on local barley and alfalfa for buttery marbling. Full and Half shares also offer a 50/50 Mixed Split!
- When asked about delivery and shipping, explain that local doorstep delivery across the Phoenix Metro area is free, and nationwide express shipping is $49 in insulated cooler boxes with dry ice, guaranteed 100% frozen arrival.
- Direct customers toward the website reservation process when appropriate (selecting tier, finishing style, entering address, and placing deposit).
- NEVER invent prices, availability, shipping promises, policies, or order numbers. Always use the live knowledge base below as the ground truth.

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

function getIntentTag(msg: string): string {
  const lower = (msg || '').toLowerCase();
  if (lower.includes('freezer') || lower.includes('space') || lower.includes('cubic') || lower.includes('cu. ft') || lower.includes('cu ft')) return 'freezer_space';
  if (lower.includes('hanging') || lower.includes('take-home') || lower.includes('take home') || lower.includes('carcass') || lower.includes('yield')) return 'hanging_vs_takehome';
  if (lower.includes('price') || lower.includes('pricing') || lower.includes('cost') || lower.includes('how much') || lower.includes('rate') || lower.includes('deposit')) return 'pricing_deposit';
  if (lower.includes('grass') || lower.includes('grain') || lower.includes('finishing') || lower.includes('finished')) return 'grass_vs_grain';
  if (lower.includes('dry-age') || lower.includes('dry aging') || lower.includes('dry aged')) return 'dry_aging';
  if (lower.includes('cut') || lower.includes('ribeye') || lower.includes('steak') || lower.includes('brisket')) return 'cuts_selection';
  if (lower.includes('shipping') || lower.includes('delivery') || lower.includes('ship') || lower.includes('deliver') || lower.includes('arizona') || lower.includes('phoenix')) return 'shipping_delivery';
  if (lower.includes('reserve') || lower.includes('order')) return 'reservation';
  if (lower.includes('hi') || lower.includes('hello')) return 'greeting';
  return 'general_beef_inquiry';
}

function getKnowledgeBaseReply(message: string, historyMsgs: ChatMessage[] = []): string {
  const liveStore = loadContentStore();
  const liveTiers = liveStore.shareTiers;

  const fullTier = liveTiers.find((t) => t.id === 'Full') || {
    id: 'Full',
    title: 'Full Beef Share',
    priceRange: '$3,300 – $4,200',
    depositAmount: 500,
    weightLbs: '400 – 440 lbs',
    cutSummary: {
      steaks: ['16-20 Prime Ribeyes', '16-20 NY Strips', '8-12 Filet Mignons', '8 Sirloins', '4 Skirt/Flank Steaks'],
      roastsAndSlow: ['6-8 Chuck & Arm Roasts', '4 Prime Rib Roasts', '2 Full Packer Briskets', '4 Rump Roasts'],
      groundAndSpecialty: ['180-200 lbs Gourmet Ground Beef'],
    },
  };
  const halfTier = liveTiers.find((t) => t.id === 'Half') || {
    id: 'Half',
    title: 'Half Beef Share',
    priceRange: '$1,650 – $2,085',
    depositAmount: 300,
    weightLbs: '200 – 220 lbs',
    cutSummary: {
      steaks: ['8-10 Prime Ribeyes', '8-10 NY Strips', '4-6 Filet Mignons', '4 Sirloins', '2 Skirt/Flank Steaks'],
      roastsAndSlow: ['3-4 Chuck Roasts', '2 Rib Roasts', '1 Whole Packer Brisket', '2 Rump Roasts'],
      groundAndSpecialty: ['90-100 lbs Artisan Ground Beef'],
    },
  };
  const quarterTier = liveTiers.find((t) => t.id === 'Quarter') || {
    id: 'Quarter',
    title: 'Quarter Beef Share',
    priceRange: '$850 – $1,050',
    depositAmount: 200,
    weightLbs: '100 – 110 lbs',
    cutSummary: {
      steaks: ['4-5 Prime Ribeye Steaks', '4-5 NY Strip Steaks', '2-3 Filet Mignons', '2 Top Sirloin Steaks'],
      roastsAndSlow: ['2 Chuck Roasts', '1 Rump Roast', '1 Half Brisket or Short Rib Rack'],
      groundAndSpecialty: ['45-50 lbs Dry-Aged Ground Beef'],
    },
  };
  const eighthTier = liveTiers.find((t) => t.id === 'Eighth') || {
    id: 'Eighth',
    title: 'Eighth Beef Share',
    priceRange: '$450 – $550',
    depositAmount: 100,
    weightLbs: '50 – 55 lbs',
    cutSummary: {
      steaks: ['2-3 Prime Ribeyes', '2-3 NY Strips', '1-2 Filet Mignons', '1-2 Sirloins'],
      roastsAndSlow: ['1 Chuck Roast', '1 Tri-Tip or Sirloin Tip Roast'],
      groundAndSpecialty: ['20-25 lbs Dry-Aged Ground Beef'],
    },
  };

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
    else if (recentText.includes('eighth') || recentText.includes('1/8')) contextualTopic = 'eighth';
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

  // 1. Requests for shares smaller than an Eighth Share / custom fractions
  if (
    (lower.includes('smaller') || lower.includes('less than') || lower.includes('under') || lower.includes('sub-eighth') || lower.includes('custom share')) &&
    (lower.includes('eighth') || lower.includes('1/8') || lower.includes('share') || lower.includes('size') || lower.includes('pricing') || lower.includes('price'))
  ) {
    return 'For custom orders or portions smaller than our Eighth Share (~50–55 lbs), please select "Contact for Pricing" on our Beef Shares page or contact our concierge directly at info@bastanzibeef.com. We can also accommodate custom quarter or half share split allocations!';
  }

  // 2. Freezer Space Requirements
  if (
    lower.includes('freezer') ||
    lower.includes('space') ||
    lower.includes('cubic') ||
    lower.includes('cu. ft') ||
    lower.includes('cu ft')
  ) {
    if (lower.includes('half') || activeTopic === 'half') {
      return `For a Half Beef Share (~${halfTier.weightLbs}), you will need 8–9 cu ft of freezer space (a medium chest freezer).`;
    } else if (lower.includes('full') || activeTopic === 'full') {
      return `For a Full Beef Share (~${fullTier.weightLbs}), you will need 16–18 cu ft of freezer space (a large chest freezer).`;
    } else if (lower.includes('quarter') || activeTopic === 'quarter') {
      return `For a Quarter Beef Share (~${quarterTier.weightLbs}), you will need 4.5–5 cu ft of freezer space (a small chest freezer or upright).`;
    } else if (lower.includes('eighth') || lower.includes('1/8') || activeTopic === 'eighth') {
      return `An Eighth Beef Share (~${eighthTier.weightLbs}) needs 1.5–2 cu ft of freezer space and fits right in a standard kitchen refrigerator freezer.`;
    }
    return 'Freezer space rules of thumb: Eighth Share needs 1.5–2 cu ft, Quarter Share needs 4.5–5 cu ft, Half Share needs 8–9 cu ft, Full Share needs 16–18 cu ft.';
  }

  // 3. Hanging Weight vs Take-Home Weight
  if (
    lower.includes('hanging') ||
    lower.includes('take-home') ||
    lower.includes('take home') ||
    lower.includes('packaged weight') ||
    lower.includes('cut weight') ||
    lower.includes('yield') ||
    lower.includes('carcass')
  ) {
    return 'Hanging weight is carcass weight before 21 days of dry-aging and trimming. Bastanzi transparently sells exact packaged take-home weight (~60–65% yield of hanging weight). You pay only for exact packaged cut weight!';
  }

  // 4. Cuts and Prime Steaks (Tier-Specific & General)
  if (
    !lower.includes('grass') &&
    !lower.includes('grain') &&
    (
      lower.includes('cut') ||
      lower.includes('steak') ||
      lower.includes('ribeye') ||
      lower.includes('filet') ||
      lower.includes('strip') ||
      lower.includes('brisket') ||
      lower.includes('roast') ||
      lower.includes('ground') ||
      lower.includes('included')
    )
  ) {
    if (lower.includes('quarter') || activeTopic === 'quarter') {
      const qSteaks = quarterTier.cutSummary?.steaks?.join(', ') || '4-5 Prime Ribeye Steaks, 4-5 NY Strip Steaks, 2-3 Filet Mignons, 2 Top Sirloin Steaks';
      const qRoasts = quarterTier.cutSummary?.roastsAndSlow?.join(', ') || '2 Chuck Roasts, 1 Rump Roast, 1 Half Brisket or Short Rib Rack';
      const qGround = quarterTier.cutSummary?.groundAndSpecialty?.join(', ') || '45-50 lbs Dry-Aged Ground Beef';
      if (lower.includes('steak') || lower.includes('prime')) {
        return `In our Quarter Beef Share (~${quarterTier.weightLbs}), the prime steaks included are: ${qSteaks}. The share also includes artisanal roasts (${qRoasts}) and gourmet ground beef (${qGround}).`;
      }
      return `Our Quarter Beef Share (~${quarterTier.weightLbs}) includes: Prime Steaks (${qSteaks}), Roasts & Slow Braising (${qRoasts}), and Ground Beef (${qGround}).`;
    }

    if (lower.includes('half') || activeTopic === 'half') {
      const hSteaks = halfTier.cutSummary?.steaks?.join(', ') || '8-10 Prime Ribeye Steaks, 8-10 NY Strip Steaks, 4-6 Filet Mignons, 4 Sirloins, 2 Skirt/Flank Steaks';
      const hRoasts = halfTier.cutSummary?.roastsAndSlow?.join(', ') || '3-4 Chuck Roasts, 2 Rib Roasts, 1 Whole Packer Brisket, 2 Rump Roasts, 3 Short Rib Racks';
      const hGround = halfTier.cutSummary?.groundAndSpecialty?.join(', ') || '90-100 lbs Artisan Ground Beef';
      if (lower.includes('steak') || lower.includes('prime')) {
        return `In our Half Beef Share (~${halfTier.weightLbs}), the prime steaks included are: ${hSteaks}. Half shares also include a Master Butcher consult for custom cut specifications!`;
      }
      return `Our Half Beef Share (~${halfTier.weightLbs}) includes: Prime Steaks (${hSteaks}), Roasts (${hRoasts}), and Ground Beef (${hGround}), with a Master Butcher custom consult.`;
    }

    if (lower.includes('full') || activeTopic === 'full') {
      const fSteaks = fullTier.cutSummary?.steaks?.join(', ') || '16-20 Prime Ribeye Steaks, 16-20 NY Strip Steaks, 8-12 Filet Mignons, 8 Sirloins, 4 Skirt/Flank Steaks';
      const fRoasts = fullTier.cutSummary?.roastsAndSlow?.join(', ') || '6-8 Chuck Roasts, 4 Prime Rib Roasts, 2 Full Packer Briskets, 4 Rump Roasts, 6 Short Rib Racks';
      const fGround = fullTier.cutSummary?.groundAndSpecialty?.join(', ') || '180-200 lbs Gourmet Ground Beef';
      if (lower.includes('steak') || lower.includes('prime')) {
        return `In our Full Beef Share (~${fullTier.weightLbs}), the prime steaks included are: ${fSteaks}. Full shares feature 100% custom butchering for all steaks and roasts!`;
      }
      return `Our Full Beef Share (~${fullTier.weightLbs}) includes: Prime Steaks (${fSteaks}), Roasts (${fRoasts}), and Ground Beef (${fGround}), with full custom butchery.`;
    }

    if (lower.includes('eighth') || lower.includes('1/8') || activeTopic === 'eighth') {
      const eSteaks = eighthTier.cutSummary?.steaks?.join(', ') || '2-3 Prime Ribeye Steaks, 2-3 NY Strip Steaks, 1-2 Filet Mignons, 1-2 Sirloins';
      return `In our Eighth Beef Share (~${eighthTier.weightLbs}), the prime steaks included are: ${eSteaks}. It also includes 1 Chuck Roast, 1 Tri-Tip or Sirloin Tip Roast, and 20-25 lbs of single-source gourmet ground beef in 1lb vacuum packs.`;
    }

    return 'All of our shares include a balanced selection of 21-day dry-aged Prime Steaks (Ribeyes, NY Strips, Filet Mignon, Sirloins), Roasts & Slow Cuts (Chuck Roast, Brisket, Short Ribs, Rump Roast), and Gourmet Ground Beef in 1lb vacuum packs. Full and Half shares include a Master Butcher consult for custom specs.';
  }

  // 5. Grass-Fed vs Grain-Finished
  if (
    lower.includes('grass') ||
    lower.includes('grain') ||
    lower.includes('finishing') ||
    lower.includes('finished') ||
    lower.includes('marbling') ||
    lower.includes('pasture')
  ) {
    return 'We offer both 100% Grass-Fed (leaner, mineral-rich, herbal flavor high in Omega-3s) and Grain-Finished (pasture-raised for 85% of life, finished on local barley & alfalfa for rich, buttery marbling). Full and Half shares also offer a 50/50 Mixed Split!';
  }

  // 6. Shipping & Phoenix Metro Delivery
  if (
    lower.includes('shipping') ||
    lower.includes('delivery') ||
    lower.includes('ship') ||
    lower.includes('deliver') ||
    lower.includes('phoenix') ||
    lower.includes('arizona') ||
    lower.includes('nationwide')
  ) {
    return 'We offer free local doorstep delivery across the Phoenix Metro area (Phoenix, Scottsdale, Paradise Valley, Gilbert, Chandler, Mesa, Cave Creek). Nationwide express shipping is $49 in insulated cooler boxes with dry ice, guaranteed 100% frozen arrival!';
  }

  // 7. Pricing and Deposits (Matches 'pricing', 'price', 'cost', 'how much', 'rate', 'deposit')
  if (
    lower.includes('price') ||
    lower.includes('pricing') ||
    lower.includes('cost') ||
    lower.includes('how much') ||
    lower.includes('rate') ||
    lower.includes('deposit')
  ) {
    if (lower.includes('half') || activeTopic === 'half') {
      return `Our Half Beef Share is priced at ${halfTier.priceRange} ($${halfTier.depositAmount} deposit) for ~${halfTier.weightLbs} of 21-day dry-aged packaged beef. It includes a custom master butcher consultation for your favorite cuts.`;
    } else if (lower.includes('full') || activeTopic === 'full') {
      return `Our Full Beef Share is priced at ${fullTier.priceRange} ($${fullTier.depositAmount} deposit) for ~${fullTier.weightLbs} of packaged beef with custom butcher options.`;
    } else if (lower.includes('quarter') || activeTopic === 'quarter') {
      return `Our Quarter Beef Share is priced at ${quarterTier.priceRange} ($${quarterTier.depositAmount} deposit) for ~${quarterTier.weightLbs} of packaged beef.`;
    } else if (lower.includes('eighth') || lower.includes('1/8') || activeTopic === 'eighth') {
      return `Our Eighth Beef Share is priced at ${eighthTier.priceRange} ($${eighthTier.depositAmount} deposit) for ~${eighthTier.weightLbs} of packaged beef.`;
    }
    return `Our live Beef Share rates are: ${pricesSummary}. Local delivery is $${liveStore.fees.localDeliveryFee} and nationwide express shipping is $${liveStore.fees.nationwideShippingFee}.`;
  }

  // 8. 21-Day Dry Aging
  if (
    lower.includes('dry-age') ||
    lower.includes('dry aging') ||
    lower.includes('dry aged') ||
    lower.includes('aging') ||
    lower.includes('aged')
  ) {
    return 'All Bastanzi beef undergoes our signature 21-day artisanal dry aging in temperature- and humidity-controlled cedar chambers. This natural enzymatic aging concentrates rich steakhouse beef flavor and breaks down connective tissue for unparalleled tenderness.';
  }

  // 9. Reservation & Ordering Process
  if (
    lower.includes('reserve') ||
    lower.includes('order') ||
    lower.includes('buy') ||
    lower.includes('how to')
  ) {
    return `To reserve a share, click 'Reserve Share' on our website, select your size (Full, Half, Quarter, or Eighth) and finishing choice (Grass-Fed or Grain-Finished), enter your delivery details, and pay a small deposit ($${eighthTier.depositAmount}–$${fullTier.depositAmount}) to lock your harvest allocation.`;
  }

  // 10. Specific Share Size Mentions without cuts or pricing
  if (lower.includes('half share') || (lower.includes('half') && lower.includes('share'))) {
    return `Our Half Beef Share gives you ~${halfTier.weightLbs} of packaged 21-day dry-aged beef (${halfTier.priceRange}, $${halfTier.depositAmount} deposit). It requires 8–9 cu ft of freezer space and includes a custom master butcher consult.`;
  }

  if (lower.includes('full share') || (lower.includes('full') && lower.includes('share'))) {
    return `Our Full Beef Share gives you ~${fullTier.weightLbs} of packaged 21-day dry-aged beef (${fullTier.priceRange}, $${fullTier.depositAmount} deposit). It requires 16–18 cu ft of freezer space and custom butchering options.`;
  }

  if (lower.includes('quarter share') || (lower.includes('quarter') && lower.includes('share'))) {
    return `Our Quarter Beef Share gives you ~${quarterTier.weightLbs} of packaged beef (${quarterTier.priceRange}, $${quarterTier.depositAmount} deposit) and needs 4.5–5 cu ft of freezer space.`;
  }

  if (lower.includes('eighth share') || ((lower.includes('eighth') || lower.includes('1/8')) && lower.includes('share'))) {
    return `Our Eighth Beef Share gives you ~${eighthTier.weightLbs} of packaged beef (${eighthTier.priceRange}, $${eighthTier.depositAmount} deposit) and fits in 1.5–2 cu ft of standard refrigerator freezer space.`;
  }

  if (lower.includes('share') || lower.includes('offer') || lower.includes('option') || lower.includes('tier') || lower.includes('size')) {
    return `We offer four pasture-raised 21-day dry-aged beef share sizes: Full Share (${fullTier.weightLbs}, ${fullTier.priceRange}), Half Share (${halfTier.weightLbs}, ${halfTier.priceRange}), Quarter Share (${quarterTier.weightLbs}, ${quarterTier.priceRange}), and Eighth Share (${eighthTier.weightLbs}, ${eighthTier.priceRange}). All shares feature 100% grass-fed or grain-finished options.`;
  }

  // 11. Greetings
  if (
    lower.includes('hi') ||
    lower.includes('hello') ||
    lower.includes('hey') ||
    lower.includes('welcome') ||
    lower.includes('good morning') ||
    lower.includes('good afternoon')
  ) {
    return 'Welcome to Bastanzi Premium Beef Co.! We offer 21-day dry-aged pasture-raised beef shares with grass-fed and grain-finished butchering options, delivered direct to your door. How can I help you choose the right share today?';
  }

  return 'Welcome to Bastanzi Premium Beef Co.! We offer 21-day dry-aged pasture-raised beef shares (Full, Half, Quarter, Eighth) with grass-fed and grain-finished butchering options, delivered direct to your door. How can I help you choose the right share today?';
}

/**
 * Triggers an escalation notification email via Resend to RESEND_NOTIFICATION_EMAIL.
 */
async function sendEscalationAlert(conv: any, reason: string) {
  if (conv.escalationNotified) {
    return;
  }
  conv.escalationNotified = true;

  const internalRecipient = getInternalNotificationEmail();
  const recentExcerpts = (conv.messages || [])
    .slice(-6)
    .map(
      (m: any) =>
        `<p style="margin: 4px 0;"><strong>${m.sender === 'user' ? 'Customer' : m.sender}:</strong> ${m.text}</p>`
    )
    .join('');

  const escalationHtml = `
    <div style="font-family: Arial, sans-serif; padding: 25px; background-color: #fff1f2; color: #881337; border-left: 4px solid #e11d48;">
      <h2 style="color: #9f1239; margin-top: 0;">🚨 AI Concierge Chat Escalation Alert</h2>
      <p>A customer has requested human support or the AI concierge transferred the conversation to a representative.</p>
      <p><strong>Conversation ID:</strong> ${conv.id}</p>
      <p><strong>Customer Name:</strong> ${conv.customerName || 'Guest Visitor'}</p>
      <p><strong>Customer Email:</strong> ${conv.customerEmail || 'Not provided'}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <hr style="border: none; border-top: 1px solid #fecdd3; margin: 15px 0;" />
      <h3 style="color: #9f1239; margin-bottom: 8px;">Recent Chat Messages:</h3>
      <div style="background-color: #ffffff; padding: 14px; border-radius: 6px; border: 1px solid #fecdd3; font-size: 13px; line-height: 1.5;">
        ${recentExcerpts || '<p>No previous messages.</p>'}
      </div>
      <p style="margin-top: 24px;">
        <a href="https://bastanzibeef.com/admin/chat" style="background-color: #e11d48; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Open Admin Chat Console</a>
      </p>
    </div>
  `;

  await sendEmailWithDiagnostics({
    type: 'chat_escalation',
    category: 'internal',
    to: internalRecipient,
    subject: `🚨 Chat Escalation: Customer requesting human support [${conv.id.substring(0, 10)}]`,
    html: escalationHtml,
  });
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

    // Ingest client history if provided
    const clientHistory = body.history || body.messages || [];
    if (Array.isArray(clientHistory) && clientHistory.length > 0) {
      conv.messages = deduplicateMessages([...conv.messages, ...clientHistory]);
    }

    const intentTag = getIntentTag(message);
    console.log(
      `[Diagnostic Audit] Incoming message: "${message.trim()}" | History length: ${conv.messages.length} | Selected intent: ${intentTag}`
    );

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

      const humanHandledReply =
        'A customer service representative is currently handling your chat and will respond shortly.';
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
      const escalationReply =
        'I can connect you with a Bastanzi Premium Beef Co. support representative. Please wait while we connect you.';

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

      // Trigger Resend escalation notification email to RESEND_NOTIFICATION_EMAIL
      await sendEscalationAlert(conv, `Customer requested human support: "${message.trim()}"`);

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
      console.warn(
        '[STAGE 2 WARNING] GEMINI_API_KEY is missing in process.env. Generating fallback response from live knowledge base.'
      );
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
        console.error(
          '[STAGE 2 FAILED] @google/genai client initialization exception:',
          initErr?.message || initErr
        );
        conv.messages = deduplicateMessages(conv.messages);
        const historyMsgs = conv.messages.slice(-12);
        replyText = getKnowledgeBaseReply(message, historyMsgs);
      }

      if (!replyText) {
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

        while (contents.length > 0 && contents[0].role === 'model') {
          contents.shift();
        }

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

        // Use valid models supported by @google/genai TypeScript SDK
        const primaryModel = 'gemini-3.8-flash';
        const fallbackModel = 'gemini-flash-latest';
        console.log(
          `[STAGE 3] Gemini request starting... Model: ${primaryModel} | History blocks: ${contents.length}`
        );

        // Safe timeout of 6 seconds to prevent exceeding Vercel 10s serverless limit
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API request timed out after 6 seconds')), 6000)
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
          console.warn(
            `[STAGE 3 WARNING] Primary model ${primaryModel} failed (${primaryErr?.message}). Retrying with ${fallbackModel}...`
          );
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
            console.warn(
              '[STAGE 3 WARNING] Gemini API call failed. Generating response from live knowledge base. Error:',
              fallbackErr?.message || fallbackErr
            );
            replyText = getKnowledgeBaseReply(message, historyMsgs);
          }
        }

        if (response) {
          console.log(`[STAGE 4] Gemini response received from model ${usedModel}.`);

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

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: message.trim(),
      timestamp: nowTime,
      createdAt: nowIso,
    };
    conv.messages.push(userMsg);

    // Check if Gemini triggered escalation wording
    if (replyText.includes('I can connect you with a Bastanzi Premium Beef Co. support representative')) {
      conv.status = 'escalated';
      conv.unreadAdmin = true;
      await sendEscalationAlert(conv, 'AI model escalated inquiry to human representative');
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

    console.log(
      `[STAGE 6 SUCCESS] Non-empty AI response verified & conversation saved to store. Final reply text length: ${replyText.length}. Returning JSON response to client.`
    );

    return res.status(200).json({
      message: replyText,
      reply: replyText,
      conversation: conv,
    });
  } catch (err: any) {
    console.error('[Chat API] Critical handler error caught:', err?.stack || err?.message || err);

    const fallbackMessage = getKnowledgeBaseReply(req?.body?.message || '');
    return res.status(200).json({
      message: fallbackMessage,
      reply: fallbackMessage,
      error: err?.message || 'Server processing error',
    });
  }
}
