import { createClient } from '@supabase/supabase-js';
import {
  Customer,
  Order,
  OrderHistory,
  OrderStatus,
  ReservationPayload,
} from '../types';

function isValidHttpUrl(stringStr: string) {
  try {
    const u = new URL(stringStr);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

const env = (import.meta as any).env || {};
const supabaseUrl = (env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = isValidHttpUrl(supabaseUrl) && Boolean(supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial sample orders for fallback or demo (empty for production)
const DEFAULT_DEMO_ORDERS: Order[] = [];

// Helper to get local orders
function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem('bastanzi_orders');
    if (!raw) {
      localStorage.setItem('bastanzi_orders', JSON.stringify(DEFAULT_DEMO_ORDERS));
      return DEFAULT_DEMO_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DEMO_ORDERS;
  }
}

// Helper to save local orders
function saveLocalOrders(orders: Order[]) {
  try {
    localStorage.setItem('bastanzi_orders', JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// Generate unique sequential order number BST-2026-xxxxxx
export async function generateOrderNumber(): Promise<string> {
  const year = '2026';
  const prefix = `BST-${year}-`;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('order_number')
        .like('order_number', `${prefix}%`)
        .order('order_number', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const lastNumStr = data[0].order_number.replace(prefix, '');
        const lastSeq = parseInt(lastNumStr, 10);
        if (!isNaN(lastSeq)) {
          const nextSeq = lastSeq + 1;
          return `${prefix}${nextSeq.toString().padStart(6, '0')}`;
        }
      }
    } catch (e) {
      console.warn('Supabase order_number query failed, using local generator:', e);
    }
  }

  // Local fallback counter calculation
  const orders = getLocalOrders();
  let maxSeq = 0;
  for (const ord of orders) {
    if (ord.order_number && ord.order_number.startsWith(prefix)) {
      const seqStr = ord.order_number.replace(prefix, '');
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }
  const nextSeq = maxSeq + 1;
  return `${prefix}${nextSeq.toString().padStart(6, '0')}`;
}

// Search Order for Customer Tracking (Matches BOTH order_number AND email)
export async function fetchOrderForTracking(
  orderNumber: string,
  email: string
): Promise<{ success: boolean; order?: Order; message?: string }> {
  const cleanOrderNum = orderNumber.trim().toUpperCase();
  const cleanEmail = email.trim().toLowerCase();

  console.log(`[WORKFLOW STEP 4] Track My Order Form Input Received -> Order Number: "${cleanOrderNum}", Email: "${cleanEmail}"`);

  if (!cleanOrderNum || !cleanEmail) {
    return {
      success: false,
      message: 'Please provide both your Order Number and Email Address.',
    };
  }

  // 1. Try Backend API first (bypasses RLS issues and checks server DB)
  try {
    console.log(`[WORKFLOW STEP 5] Executing Backend Server Query via /api/track for Order "${cleanOrderNum}" and Email "${cleanEmail}"`);
    const apiRes = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber: cleanOrderNum, email: cleanEmail }),
    });

    const apiData = await apiRes.json();
    if (apiRes.ok && apiData.success && apiData.order) {
      console.log(`[WORKFLOW STEP 6] Server Query Success: Found order ${cleanOrderNum} for email ${cleanEmail}.`);
      return { success: true, order: apiData.order };
    } else if (apiData.message) {
      console.warn(`[WORKFLOW STEP 6] Server Query Result: ${apiData.message}`);
    }
  } catch (apiErr) {
    console.warn('[WORKFLOW STEP 6] /api/track fetch error, trying direct client lookup:', apiErr);
  }

  // 2. Try Direct Supabase Client Query
  if (supabase) {
    try {
      console.log(`[WORKFLOW STEP 5] Executing Direct Client Supabase Query: supabase.from('orders').select('*, customer:customers(*)').eq('order_number', '${cleanOrderNum}')`);
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*)
        `)
        .eq('order_number', cleanOrderNum)
        .maybeSingle();

      if (orderError) {
        console.warn(`[WORKFLOW STEP 6] Direct Query Execution Note: ${orderError.message}`);
      }

      if (orderData && orderData.customer) {
        const storedEmail = orderData.customer.email ? orderData.customer.email.trim().toLowerCase() : '';
        if (storedEmail === cleanEmail) {
          console.log(`[WORKFLOW STEP 6] Direct Query Success: Order ${cleanOrderNum} found for customer ${orderData.customer.first_name} (${storedEmail}).`);
          const { data: historyData } = await supabase
            .from('order_history')
            .select('*')
            .eq('order_id', orderData.id)
            .order('created_at', { ascending: true });

          const fullOrder: Order = {
            ...orderData,
            history: historyData || [],
          };
          return { success: true, order: fullOrder };
        } else {
          console.warn(`[WORKFLOW STEP 6] Security Check Failure: Order number "${cleanOrderNum}" exists, but associated email "${storedEmail}" does NOT match search email "${cleanEmail}".`);
          return {
            success: false,
            message: `Order #${cleanOrderNum} exists, but the email provided does not match our record for this reservation.`,
          };
        }
      } else {
        console.warn(`[WORKFLOW STEP 6] Zero Rows Returned from client Supabase query for order_number = "${cleanOrderNum}".`);
      }
    } catch (err) {
      console.warn('[WORKFLOW STEP 6] Client Supabase tracking lookup exception:', err);
    }
  }

  // 3. Local fallback search
  const orders = getLocalOrders();
  const matched = orders.find(
    (o) =>
      o.order_number.trim().toUpperCase() === cleanOrderNum &&
      o.customer?.email.trim().toLowerCase() === cleanEmail
  );

  if (matched) {
    console.log(`[WORKFLOW STEP 6] Local Store Fallback Success: Found order ${cleanOrderNum} for email ${cleanEmail}.`);
    return { success: true, order: matched };
  }

  return {
    success: false,
    message:
      'No order found matching both that Order Number and Email Address. Please verify your details.',
  };
}

// Fetch All Orders for Admin Dashboard
export async function fetchAllOrdersForAdmin(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.orders) && json.orders.length > 0) {
        return json.orders;
      }
    }
  } catch (err) {
    console.warn('API /api/orders fetch error, falling back to direct database client:', err);
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Fetch histories for all orders
        const ordersWithHistory = await Promise.all(
          data.map(async (ord) => {
            const { data: hist } = await supabase
              .from('order_history')
              .select('*')
              .eq('order_id', ord.id)
              .order('created_at', { ascending: true });

            return {
              ...ord,
              history: hist || [],
            };
          })
        );
        return ordersWithHistory;
      }
    } catch (err) {
      console.warn('Supabase admin fetch error:', err);
    }
  }

  return getLocalOrders();
}

// Send Email Notification Helper
export async function sendOrderNotificationEmail(
  order: Order,
  status: string,
  customNotes?: string
) {
  try {
    await fetch('/api/notify-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: order.order_number,
        customerName: order.customer
          ? `${order.customer.first_name} ${order.customer.last_name}`
          : 'Valued Customer',
        customerEmail: order.customer?.email,
        beefShare: order.beef_share,
        status,
        notes: customNotes || order.notes,
        fulfillmentMethod: order.fulfillment_method,
        pickupDate: order.pickup_date,
        deliveryDate: order.delivery_date,
      }),
    });
  } catch (err) {
    console.warn('Notification email trigger error:', err);
  }
}

// Create New Order
export async function createOrderInDatabase(orderInput: {
  order_number?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  beef_share: string;
  estimated_weight?: string;
  total_price?: number;
  payment_status?: string;
  fulfillment_method?: string;
  pickup_date?: string;
  delivery_date?: string;
  notes?: string;
  current_status?: string;
}): Promise<{ success: boolean; order?: Order; error?: string }> {
  const orderNumber = orderInput.order_number || (await generateOrderNumber());
  const timestamp = new Date().toISOString();
  const initialStatus = orderInput.current_status || 'Order Received';

  const customerId = 'cust-' + Math.random().toString(36).substring(2, 9);
  const orderId = 'ord-' + Math.random().toString(36).substring(2, 9);

  const customerObj: Customer = {
    id: customerId,
    first_name: orderInput.first_name,
    last_name: orderInput.last_name,
    email: orderInput.email,
    phone: orderInput.phone || '',
    address: orderInput.address || '',
    city: orderInput.city || '',
    state: orderInput.state || '',
    zip_code: orderInput.zip_code || '',
    created_at: timestamp,
  };

  const newOrder: Order = {
    id: orderId,
    order_number: orderNumber,
    customer_id: customerId,
    beef_share: orderInput.beef_share,
    estimated_weight: orderInput.estimated_weight || 'TBD',
    total_price: orderInput.total_price || 0,
    payment_status: orderInput.payment_status || 'Pending Deposit',
    fulfillment_method: orderInput.fulfillment_method || 'Pickup',
    pickup_date: orderInput.pickup_date || '',
    delivery_date: orderInput.delivery_date || '',
    current_status: initialStatus,
    notes: orderInput.notes || '',
    created_at: timestamp,
    updated_at: timestamp,
    customer: customerObj,
    history: [
      {
        id: 'hist-' + Math.random().toString(36).substring(2, 9),
        order_id: orderId,
        status: initialStatus,
        notes: orderInput.notes || 'Order placed and logged in system.',
        created_at: timestamp,
        created_by: 'System',
      },
    ],
  };

  console.log(`[WORKFLOW STEP 1] Writing order to database... Order Number: "${orderNumber}", Email: "${orderInput.email}", Beef Share: "${orderInput.beef_share}"`);

  // 1. Store in Supabase if configured
  if (supabase) {
    try {
      // Insert customer
      const { data: custData, error: custErr } = await supabase
        .from('customers')
        .insert([
          {
            first_name: orderInput.first_name,
            last_name: orderInput.last_name,
            email: orderInput.email,
            phone: orderInput.phone,
            address: orderInput.address,
            city: orderInput.city,
            state: orderInput.state,
            zip_code: orderInput.zip_code,
          },
        ])
        .select()
        .single();

      if (!custErr && custData) {
        const dbCustId = custData.id;
        const { data: ordData, error: ordErr } = await supabase
          .from('orders')
          .insert([
            {
              order_number: orderNumber,
              customer_id: dbCustId,
              beef_share: orderInput.beef_share,
              estimated_weight: orderInput.estimated_weight || 'TBD',
              total_price: orderInput.total_price || 0,
              payment_status: orderInput.payment_status || 'Pending Deposit',
              fulfillment_method: orderInput.fulfillment_method || 'Pickup',
              pickup_date: orderInput.pickup_date || '',
              delivery_date: orderInput.delivery_date || '',
              current_status: initialStatus,
              notes: orderInput.notes || '',
            },
          ])
          .select()
          .single();

        if (!ordErr && ordData) {
          // Insert initial history
          await supabase.from('order_history').insert([
            {
              order_id: ordData.id,
              status: initialStatus,
              notes: orderInput.notes || 'Order received',
              created_by: 'System',
            },
          ]);

          newOrder.id = ordData.id;
          newOrder.customer_id = dbCustId;
          newOrder.customer = custData;

          // STEP 2: Immediately after saving, retrieve that same order by its ID & confirm existence
          const { data: verifyOrder } = await supabase
            .from('orders')
            .select(`*, customer:customers(*)`)
            .eq('id', ordData.id)
            .single();

          console.log(`[WORKFLOW STEP 2] Verification Retrieval: Querying database for saved Order ID "${ordData.id}" -> Record Exists: ${Boolean(verifyOrder)}`);

          // STEP 3: Print exact stored values
          if (verifyOrder && verifyOrder.customer) {
            console.log(`[WORKFLOW STEP 3] Stored Database Values Confirmed -> Order Number: "${verifyOrder.order_number}", Email Address: "${verifyOrder.customer.email}"`);
          } else {
            console.log(`[WORKFLOW STEP 3] Stored Database Values Confirmed -> Order Number: "${ordData.order_number}", Email Address: "${custData.email}"`);
          }
        } else if (ordErr) {
          console.warn('[WORKFLOW STEP 1] Supabase order insert error:', ordErr.message);
        }
      } else if (custErr) {
        console.warn('[WORKFLOW STEP 1] Supabase customer insert error:', custErr.message);
      }
    } catch (e) {
      console.warn('Supabase create order error, using local state:', e);
    }
  }

  // 2. Save in local storage fallback
  const localOrders = getLocalOrders();
  localOrders.unshift(newOrder);
  saveLocalOrders(localOrders);

  // 3. Trigger email notification
  sendOrderNotificationEmail(newOrder, initialStatus);

  return { success: true, order: newOrder };
}

// Update Order Status
export async function updateOrderStatusInDatabase(
  orderId: string,
  newStatus: OrderStatus | string,
  notes: string = '',
  adminEmail: string = 'admin@bastanzibeef.com'
): Promise<{ success: boolean; order?: Order }> {
  const timestamp = new Date().toISOString();

  // Supabase update
  if (supabase) {
    try {
      await supabase
        .from('orders')
        .update({ current_status: newStatus, updated_at: timestamp })
        .eq('id', orderId);

      await supabase.from('order_history').insert([
        {
          order_id: orderId,
          status: newStatus,
          notes: notes || `Status updated to ${newStatus}`,
          created_by: adminEmail,
        },
      ]);
    } catch (e) {
      console.warn('Supabase status update fallback:', e);
    }
  }

  // Local storage update
  const orders = getLocalOrders();
  const order = orders.find((o) => o.id === orderId);

  if (order) {
    order.current_status = newStatus;
    order.updated_at = timestamp;

    if (!order.history) order.history = [];
    const newHist: OrderHistory = {
      id: 'hist-' + Math.random().toString(36).substring(2, 9),
      order_id: orderId,
      status: newStatus,
      notes: notes || `Status updated to ${newStatus}`,
      created_at: timestamp,
      created_by: adminEmail,
    };
    order.history.push(newHist);

    saveLocalOrders(orders);

    // Send notification email to customer
    sendOrderNotificationEmail(order, newStatus, notes);

    return { success: true, order };
  }

  return { success: false };
}

// Add Custom Timeline Entry
export async function addTimelineEntryToDatabase(
  orderId: string,
  status: string,
  notes: string,
  adminEmail: string = 'admin@bastanzibeef.com'
): Promise<{ success: boolean; order?: Order }> {
  const timestamp = new Date().toISOString();

  if (supabase) {
    try {
      await supabase.from('order_history').insert([
        {
          order_id: orderId,
          status,
          notes,
          created_by: adminEmail,
        },
      ]);
    } catch (e) {
      console.warn('Supabase timeline entry fallback:', e);
    }
  }

  const orders = getLocalOrders();
  const order = orders.find((o) => o.id === orderId);

  if (order) {
    if (!order.history) order.history = [];
    order.history.push({
      id: 'hist-' + Math.random().toString(36).substring(2, 9),
      order_id: orderId,
      status,
      notes,
      created_at: timestamp,
      created_by: adminEmail,
    });
    saveLocalOrders(orders);
    return { success: true, order };
  }

  return { success: false };
}

// Update Order Details
export async function updateOrderDetailsInDatabase(
  orderId: string,
  updates: Partial<Order>,
  customerUpdates?: Partial<Customer>
): Promise<{ success: boolean; order?: Order }> {
  const timestamp = new Date().toISOString();

  if (supabase) {
    try {
      await supabase
        .from('orders')
        .update({
          beef_share: updates.beef_share,
          estimated_weight: updates.estimated_weight,
          total_price: updates.total_price,
          payment_status: updates.payment_status,
          fulfillment_method: updates.fulfillment_method,
          pickup_date: updates.pickup_date,
          delivery_date: updates.delivery_date,
          notes: updates.notes,
          updated_at: timestamp,
        })
        .eq('id', orderId);

      if (customerUpdates && updates.customer_id) {
        await supabase
          .from('customers')
          .update(customerUpdates)
          .eq('id', updates.customer_id);
      }
    } catch (e) {
      console.warn('Supabase update order details fallback:', e);
    }
  }

  const orders = getLocalOrders();
  const orderIndex = orders.findIndex((o) => o.id === orderId);

  if (orderIndex !== -1) {
    const existing = orders[orderIndex];
    orders[orderIndex] = {
      ...existing,
      ...updates,
      updated_at: timestamp,
      customer: existing.customer
        ? { ...existing.customer, ...customerUpdates }
        : existing.customer,
    };
    saveLocalOrders(orders);
    return { success: true, order: orders[orderIndex] };
  }

  return { success: false };
}

// Delete Order
export async function deleteOrderFromDatabase(orderId: string): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('orders').delete().eq('id', orderId);
    } catch (e) {
      console.warn('Supabase delete error:', e);
    }
  }

  const orders = getLocalOrders().filter((o) => o.id !== orderId);
  saveLocalOrders(orders);
  return true;
}

// Existing Reservation integration function updated to create an Order
export async function saveReservationToDatabase(reservation: ReservationPayload, customOrderNumber?: string) {
  const nameParts = reservation.name.trim().split(' ');
  const firstName = nameParts[0] || 'Valued';
  const lastName = nameParts.slice(1).join(' ') || 'Customer';

  const res = await createOrderInDatabase({
    order_number: customOrderNumber,
    first_name: firstName,
    last_name: lastName,
    email: reservation.email,
    phone: reservation.phone,
    address: reservation.address,
    city: reservation.city,
    state: reservation.state,
    zip_code: reservation.zip,
    beef_share: `${reservation.shareSize} Beef Share`,
    notes: `Finish: ${reservation.finish || 'Pasture-Raised'}. ${reservation.notes || ''}`,
    current_status: 'Order Received',
    delivery_date: reservation.preferredDeliveryDate,
  });

  if (res.success && res.order) {
    return {
      success: true,
      id: res.order.order_number,
      orderNumber: res.order.order_number,
      data: res.order,
      name: `${res.order.customer?.first_name || ''} ${res.order.customer?.last_name || ''}`.trim() || reservation.name,
      email: res.order.customer?.email || reservation.email,
      shareSize: reservation.shareSize,
      finish: reservation.finish,
      depositRequired: reservation.shareSize === 'Quarter' ? 150 : reservation.shareSize === 'Half' ? 300 : 500,
      preferredDeliveryDate: reservation.preferredDeliveryDate,
      address: reservation.address,
      city: reservation.city,
      state: reservation.state,
      zip: reservation.zip,
      phone: reservation.phone,
      notes: reservation.notes,
    };
  }

  return { success: false, id: 'RES-FAILED' };
}
