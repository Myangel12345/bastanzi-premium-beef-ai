import fs from 'fs';
import path from 'path';

export type ChatRole = 'user' | 'ai' | 'human_agent' | 'system';
export type ConversationStatus = 'ai_handled' | 'escalated' | 'human_handled' | 'resolved';

export interface ChatMessage {
  id: string;
  sender: ChatRole;
  text: string;
  timestamp: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  customerEmail?: string;
  status: ConversationStatus;
  lastMessage: string;
  unreadAdmin: boolean;
  unreadCustomer: boolean;
  messages: ChatMessage[];
  associatedOrderId?: string;
}

const STORE_PATH = path.join('/tmp', 'bastanzi_chats.json');

// In-memory cache
let conversationsInMemory: Map<string, ChatConversation> | null = null;

function loadStore(): Map<string, ChatConversation> {
  if (conversationsInMemory) return conversationsInMemory;
  conversationsInMemory = new Map<string, ChatConversation>();
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(data) as ChatConversation[];
      for (const conv of parsed) {
        conversationsInMemory.set(conv.id, conv);
      }
    }
  } catch (err) {
    console.error('[ChatStore] Error reading store from disk:', err);
  }
  return conversationsInMemory;
}

function persistStore() {
  if (!conversationsInMemory) return;
  try {
    const list = Array.from(conversationsInMemory.values());
    fs.writeFileSync(STORE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ChatStore] Error writing store to disk:', err);
  }
}

export function deduplicateMessages(messages: ChatMessage[]): ChatMessage[] {
  if (!Array.isArray(messages)) return [];

  const seenIds = new Set<string>();
  const result: ChatMessage[] = [];

  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') continue;

    const id = (msg.id || '').trim();
    const sender = (msg.sender || 'user').trim();
    const text = (msg.text || '').trim();

    if (!text || text === 'TEMPORARY_ERROR') continue;

    if (id && seenIds.has(id)) {
      continue;
    }

    const msgTime = new Date(msg.createdAt || Date.now()).getTime();
    const isRecentDuplicate = result.some((existing) => {
      if (existing.sender !== sender || existing.text !== text) return false;
      const existingTime = new Date(existing.createdAt || Date.now()).getTime();
      return Math.abs(msgTime - existingTime) < 60000;
    });

    if (isRecentDuplicate) {
      continue;
    }

    if (id) seenIds.add(id);

    result.push({
      ...msg,
      id: id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sender: sender as ChatRole,
      text,
    });
  }

  return result;
}

export function getOrCreateConversation(
  conversationId: string,
  customerName?: string,
  customerEmail?: string
): ChatConversation {
  const store = loadStore();
  let conv = store.get(conversationId);

  if (!conv) {
    const nowIso = new Date().toISOString();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    conv = {
      id: conversationId,
      createdAt: nowIso,
      updatedAt: nowIso,
      customerName: customerName || 'Guest Visitor',
      customerEmail: customerEmail || '',
      status: 'ai_handled',
      lastMessage: 'Welcome to Bastanzi Premium Beef Co. Concierge!',
      unreadAdmin: false,
      unreadCustomer: false,
      messages: [
        {
          id: 'welcome_' + conversationId,
          sender: 'ai',
          text: 'Welcome to Bastanzi Premium Beef Co. I am your AI Beef Concierge. How may I assist you today? Ask me anything about our pasture-raised 21-day dry-aged shares, pricing, freezer requirements, cut checklists, or custom butcher specs.',
          timestamp: nowTime,
          createdAt: nowIso,
        },
      ],
    };
    store.set(conversationId, conv);
    persistStore();
  } else {
    if (customerName && !conv.customerName) conv.customerName = customerName;
    if (customerEmail && !conv.customerEmail) conv.customerEmail = customerEmail;
    conv.messages = deduplicateMessages(conv.messages);
  }

  return conv;
}

export function saveConversation(conv: ChatConversation): void {
  const store = loadStore();
  conv.updatedAt = new Date().toISOString();
  conv.messages = deduplicateMessages(conv.messages);
  store.set(conv.id, conv);
  persistStore();
}

export function listConversationsForAdmin(statusFilter?: string): ChatConversation[] {
  const store = loadStore();
  let list = Array.from(store.values());

  if (statusFilter && statusFilter !== 'all') {
    if (statusFilter === 'escalated') {
      list = list.filter((c) => c.status === 'escalated');
    } else if (statusFilter === 'human_handled') {
      list = list.filter((c) => c.status === 'human_handled');
    } else if (statusFilter === 'ai_handled') {
      list = list.filter((c) => c.status === 'ai_handled');
    } else if (statusFilter === 'resolved') {
      list = list.filter((c) => c.status === 'resolved');
    }
  }

  // Sort by updatedAt descending
  return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export default async function chatAdminHandler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify Admin Auth
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim() || req.query?.token;
  
  if (token !== 'bastanzi2026' && token !== 'true') {
    return res.status(401).json({ error: 'Unauthorized admin access.' });
  }

  if (req.method === 'GET') {
    const status = (req.query?.status as string) || 'all';
    const conversations = listConversationsForAdmin(status);
    const unreadEscalatedCount = listConversationsForAdmin('escalated').length;

    return res.status(200).json({
      conversations,
      unreadEscalatedCount,
    });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { conversationId, action, messageText } = body;

      if (!conversationId) {
        return res.status(400).json({ error: 'conversationId is required.' });
      }

      const store = loadStore();
      const conv = store.get(conversationId);

      if (!conv) {
        return res.status(404).json({ error: 'Conversation not found.' });
      }

      const nowIso = new Date().toISOString();
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (action === 'take_over') {
        conv.status = 'human_handled';
        conv.unreadAdmin = false;
        conv.unreadCustomer = true;
        const sysMsg: ChatMessage = {
          id: 'sys_' + Date.now(),
          sender: 'system',
          text: 'A Bastanzi Premium Beef Co. support representative has joined the conversation.',
          timestamp: nowTime,
          createdAt: nowIso,
        };
        conv.messages.push(sysMsg);
        conv.lastMessage = sysMsg.text;
        saveConversation(conv);
        return res.status(200).json({ success: true, conversation: conv });
      }

      if (action === 'send_message') {
        if (!messageText || typeof messageText !== 'string') {
          return res.status(400).json({ error: 'messageText is required.' });
        }
        conv.status = 'human_handled';
        conv.unreadAdmin = false;
        conv.unreadCustomer = true;

        const agentMsg: ChatMessage = {
          id: 'agent_' + Date.now(),
          sender: 'human_agent',
          text: messageText.trim(),
          timestamp: nowTime,
          createdAt: nowIso,
        };
        conv.messages.push(agentMsg);
        conv.lastMessage = agentMsg.text;
        saveConversation(conv);
        return res.status(200).json({ success: true, conversation: conv });
      }

      if (action === 'return_to_ai') {
        conv.status = 'ai_handled';
        conv.unreadAdmin = false;
        const sysMsg: ChatMessage = {
          id: 'sys_' + Date.now(),
          sender: 'system',
          text: 'The representative has returned the chat to AI Concierge.',
          timestamp: nowTime,
          createdAt: nowIso,
        };
        conv.messages.push(sysMsg);
        conv.lastMessage = sysMsg.text;
        saveConversation(conv);
        return res.status(200).json({ success: true, conversation: conv });
      }

      if (action === 'resolve') {
        conv.status = 'resolved';
        conv.unreadAdmin = false;
        const sysMsg: ChatMessage = {
          id: 'sys_' + Date.now(),
          sender: 'system',
          text: 'This conversation was marked as resolved by customer support.',
          timestamp: nowTime,
          createdAt: nowIso,
        };
        conv.messages.push(sysMsg);
        conv.lastMessage = sysMsg.text;
        saveConversation(conv);
        return res.status(200).json({ success: true, conversation: conv });
      }

      return res.status(400).json({ error: 'Invalid action.' });
    } catch (err: any) {
      console.error('[AdminChatHandler] Error:', err);
      return res.status(500).json({ error: err?.message || 'Server error.' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
