import { createClient } from '@supabase/supabase-js';

// Interfaces
export interface ShipmentOrder {
  id: string;
  trackingNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  shareSize: string;
  finish: string;
  status:
    | 'Order received'
    | 'Payment confirmed'
    | 'Processing'
    | 'Beef at processor'
    | 'Packaging'
    | 'Ready for pickup'
    | 'Shipped'
    | 'Out for delivery'
    | 'Delivered';
  origin: string;
  destination: string;
  carrier: string;
  estimatedDelivery: string;
  createdAt: string;
  updated_at?: string;
  updated_by?: string;
  notes?: string;
  totalAmount?: number;
  paymentStatus?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  shareSize: string;
  finish: string;
  price: number;
  hangingWeight: string;
  takeHomeWeight: string;
  description: string;
  imageUrl: string;
  inventory: number;
  isOutOfStock: boolean;
  isFeatured: boolean;
  cutsIncluded: string[];
}

export interface TestimonialItem {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  sharePurchased: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'new' | 'read' | 'replied';
}

export interface SubscriberItem {
  id: string;
  email: string;
  createdAt: string;
}

// Memory Store Initial State
let memoryOrders: ShipmentOrder[] = [
  {
    id: 'RES-882194A',
    trackingNumber: 'OGF-882194A',
    name: 'Harrison Vance',
    email: 'harrison.vance@example.com',
    phone: '415-555-0192',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    zip: '97477',
    shareSize: 'Quarter',
    finish: 'Pasture-Raised Grain-Finished',
    status: 'Shipped',
    origin: 'Bastanzi Ranch - Sheridan, MT',
    destination: 'Springfield, OR',
    carrier: 'OGFCARGO Cold Chain Logistics',
    estimatedDelivery: '2026-08-05',
    createdAt: '2026-08-01T11:46:51.025Z',
    updated_at: '2026-08-02T11:46:51.026Z',
    updated_by: 'admin@ogfcargo.com',
    notes: 'Keep chilled below 0°F in vacuum packaging.',
    totalAmount: 1150,
    paymentStatus: 'Paid in Full',
  },
  {
    id: 'RES-993021B',
    trackingNumber: 'OGF-993021B',
    name: 'Evelyn Sterling',
    email: 'evelyn@sterlingwealth.com',
    phone: '310-555-0144',
    address: '1000 Wilshire Blvd Suite 400',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90017',
    shareSize: 'Full',
    finish: '100% Grass-Fed & Finished',
    status: 'Processing',
    origin: 'Bastanzi Processing Facility',
    destination: 'Los Angeles, CA',
    carrier: 'OGFCARGO Priority Express',
    estimatedDelivery: '2026-08-08',
    createdAt: '2026-08-03T06:46:51.026Z',
    updated_at: '2026-08-03T06:46:51.026Z',
    updated_by: 'system',
    notes: 'VIP customer. Include custom butcher cut sheet.',
    totalAmount: 4200,
    paymentStatus: 'Paid in Full',
  },
  {
    id: 'RES-441203C',
    trackingNumber: 'OGF-441203C',
    name: 'Marcus Brody',
    email: 'mbrody@brodyarch.com',
    phone: '212-555-0188',
    address: '450 Lexington Ave Fl 12',
    city: 'New York',
    state: 'NY',
    zip: '10017',
    shareSize: 'Half',
    finish: 'Pasture-Raised Grain-Finished',
    status: 'Delivered',
    origin: 'Bastanzi Ranch - Sheridan, MT',
    destination: 'New York, NY',
    carrier: 'OGFCARGO Cold Chain Logistics',
    estimatedDelivery: '2026-08-01',
    createdAt: '2026-07-28T11:46:51.026Z',
    updated_at: '2026-08-02T11:46:51.026Z',
    updated_by: 'admin@ogfcargo.com',
    notes: 'Delivered and signed by concierge desk.',
    totalAmount: 2200,
    paymentStatus: 'Paid in Full',
  },
];

let memoryProducts: ProductItem[] = [
  {
    id: 'prod-quarter',
    name: 'Quarter Beef Share',
    shareSize: 'Quarter',
    finish: 'Pasture-Raised Grain-Finished',
    price: 1150,
    hangingWeight: '175 - 200 lbs',
    takeHomeWeight: '100 - 115 lbs',
    description: 'Perfect for families. Includes a balanced selection of steaks, roasts, brisket, ribs, and 85/15 premium ground beef.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
    inventory: 12,
    isOutOfStock: false,
    isFeatured: true,
    cutsIncluded: ['Ribeye Steaks', 'NY Strip Steaks', 'Filet Mignon', 'Chuck Roasts', 'Brisket', 'Short Ribs', 'Premium Ground Beef'],
  },
  {
    id: 'prod-half',
    name: 'Half Beef Share',
    shareSize: 'Half',
    finish: 'Pasture-Raised Grain-Finished',
    price: 2200,
    hangingWeight: '350 - 400 lbs',
    takeHomeWeight: '200 - 230 lbs',
    description: 'Our most popular share. Complete custom cut choices, double ribeyes, T-bones, prime rib, roasts, and artisan ground beef.',
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=800',
    inventory: 8,
    isOutOfStock: false,
    isFeatured: true,
    cutsIncluded: ['Prime Rib Roast', 'T-Bone & Porterhouse Steaks', 'Ribeye & NY Strip', 'Sirloin & Tenderloin', 'Brisket & Flank', 'Organ Meats (Optional)', '85/15 Ground Beef'],
  },
  {
    id: 'prod-full',
    name: 'Whole Beef Share',
    shareSize: 'Full',
    finish: '100% Grass-Fed & Finished',
    price: 4200,
    hangingWeight: '700 - 800 lbs',
    takeHomeWeight: '400 - 460 lbs',
    description: 'Maximum value for neighborhood co-ops or large families. Full custom butcher sheet control and guaranteed priority delivery.',
    imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=800',
    inventory: 5,
    isOutOfStock: false,
    isFeatured: true,
    cutsIncluded: ['100% Complete Steaks Selection', 'Whole Prime Rib Roasts', 'Briskets & Shank Roasts', 'Custom Thickness Steaks', 'Artisan Sausage & Ground Beef'],
  },
  {
    id: 'prod-eighth',
    name: 'Eighth Beef Sampler',
    shareSize: 'Eighth',
    finish: 'Pasture-Raised Grain-Finished',
    price: 620,
    hangingWeight: '85 - 100 lbs',
    takeHomeWeight: '50 - 58 lbs',
    description: 'Ideal introductory sampler pack for standard freezer compartments. A curated split of premium steaks, roasts, and burger.',
    imageUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=800',
    inventory: 15,
    isOutOfStock: false,
    isFeatured: false,
    cutsIncluded: ['Ribeye & NY Strip Steaks', 'Chuck Roast', 'Stew Meat', 'Premium Ground Beef'],
  },
];

let memoryTestimonials: TestimonialItem[] = [
  {
    id: 'test-1',
    name: 'Col. Robert Vance',
    location: 'Bozeman, MT',
    rating: 5,
    comment: 'The marbling on the quarter share ribeyes surpassed any steakhouse in Chicago or NYC. Arrived rock solid frozen in dry ice. Customer for life!',
    sharePurchased: 'Quarter Share',
    status: 'approved',
    createdAt: '2026-07-15T10:00:00Z',
  },
  {
    id: 'test-2',
    name: 'Sarah & David Miller',
    location: 'Denver, CO',
    rating: 5,
    comment: 'Splitting a Half Beef Share with our neighbors was the best decision we made this year. Beautiful cut sheet precision and zero freezer burn!',
    sharePurchased: 'Half Share',
    status: 'approved',
    createdAt: '2026-07-20T14:30:00Z',
  },
  {
    id: 'test-3',
    name: 'Dr. Evelyn Sterling',
    location: 'Los Angeles, CA',
    rating: 5,
    comment: 'The 100% grass-fed finishing is unbelievable. Rich flavor, lean yet incredibly tender. OGFCARGO tracking kept us updated every step.',
    sharePurchased: 'Whole Share',
    status: 'approved',
    createdAt: '2026-07-28T09:15:00Z',
  },
];

let memoryMessages: ContactMessage[] = [
  {
    id: 'msg-101',
    name: 'Jackson Reed',
    email: 'j.reed@example.com',
    phone: '406-555-0112',
    subject: 'Freezer Space Question for Half Share',
    message: 'Hello, I have an 8 cu ft chest freezer. Will a half share fit along with some frozen vegetables?',
    createdAt: '2026-08-02T16:20:00Z',
    status: 'new',
  },
];

let memorySubscribers: SubscriberItem[] = [
  { id: 'sub-1', email: 'harrison.vance@example.com', createdAt: '2026-08-01T12:00:00Z' },
  { id: 'sub-2', email: 'evelyn@sterlingwealth.com', createdAt: '2026-08-03T07:00:00Z' },
];

function getSupabase() {
  try {
    const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
    const key =
      (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY ||
        '').trim();
    if (url && key && url.startsWith('http')) {
      return createClient(url, key);
    }
  } catch (err) {
    console.warn('Supabase DB init skipped:', err);
  }
  return null;
}

// Order Functions
export async function getOrders(): Promise<ShipmentOrder[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          trackingNumber: item.tracking_number || `OGF-${item.id.replace('RES-', '')}`,
          name: item.name,
          email: item.email,
          phone: item.phone,
          address: item.address || '',
          city: item.city || '',
          state: item.state || '',
          zip: item.zip || '',
          shareSize: item.share_size || 'Quarter',
          finish: item.finish_preference || 'Pasture-Raised Grain-Finished',
          status: item.status || 'Order received',
          origin: 'Bastanzi Ranch - Sheridan, MT',
          destination: `${item.city || ''}, ${item.state || ''}`.trim() || 'Customer Address',
          carrier: 'OGFCARGO Cold Chain Express',
          estimatedDelivery: item.preferred_delivery_date || 'In 3-5 Business Days',
          createdAt: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || item.created_at || new Date().toISOString(),
          updated_by: item.updated_by || 'system',
          notes: item.notes || '',
          totalAmount: item.total_amount || 1150,
          paymentStatus: item.payment_status || 'Paid',
        }));
      }
    } catch (err) {
      console.warn('Error fetching orders from Supabase:', err);
    }
  }
  return [...memoryOrders];
}

export async function getOrderByIdOrTracking(idOrTracking: string): Promise<ShipmentOrder | null> {
  const query = idOrTracking.trim().toUpperCase();
  const all = await getOrders();
  return (
    all.find(
      (o) =>
        o.id.toUpperCase() === query ||
        o.trackingNumber.toUpperCase() === query ||
        o.email.toUpperCase() === query
    ) || null
  );
}

export async function saveOrder(order: ShipmentOrder): Promise<ShipmentOrder> {
  memoryOrders = [order, ...memoryOrders.filter((o) => o.id !== order.id)];

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('reservations').upsert({
        id: order.id,
        tracking_number: order.trackingNumber,
        name: order.name,
        email: order.email,
        phone: order.phone,
        address: order.address,
        city: order.city,
        state: order.state,
        zip: order.zip,
        share_size: order.shareSize,
        finish_preference: order.finish,
        status: order.status,
        notes: order.notes,
        created_at: order.createdAt,
        updated_at: order.updated_at || new Date().toISOString(),
        updated_by: order.updated_by || 'system',
      });
    } catch (e) {
      console.warn('Error upserting order to Supabase:', e);
    }
  }
  return order;
}

export async function deleteOrder(id: string): Promise<boolean> {
  memoryOrders = memoryOrders.filter((o) => o.id !== id);
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('reservations').delete().eq('id', id);
    } catch (e) {
      console.warn('Error deleting order from Supabase:', e);
    }
  }
  return true;
}

// Product Functions
export async function getProducts(): Promise<ProductItem[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data && data.length > 0) {
        return data.map((p: any) => ({
          id: p.id,
          name: p.name,
          shareSize: p.share_size,
          finish: p.finish,
          price: p.price,
          hangingWeight: p.hanging_weight,
          takeHomeWeight: p.take_home_weight,
          description: p.description,
          imageUrl: p.image_url,
          inventory: p.inventory,
          isOutOfStock: p.is_out_of_stock,
          isFeatured: p.is_featured,
          cutsIncluded: typeof p.cuts_included === 'string' ? JSON.parse(p.cuts_included) : p.cuts_included || [],
        }));
      }
    } catch (e) {
      console.warn('Supabase product query error:', e);
    }
  }
  return [...memoryProducts];
}

export async function saveProduct(product: ProductItem): Promise<ProductItem> {
  memoryProducts = [product, ...memoryProducts.filter((p) => p.id !== product.id)];

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('products').upsert({
        id: product.id,
        name: product.name,
        share_size: product.shareSize,
        finish: product.finish,
        price: product.price,
        hanging_weight: product.hangingWeight,
        take_home_weight: product.takeHomeWeight,
        description: product.description,
        image_url: product.imageUrl,
        inventory: product.inventory,
        is_out_of_stock: product.isOutOfStock,
        is_featured: product.isFeatured,
        cuts_included: JSON.stringify(product.cutsIncluded),
      });
    } catch (e) {
      console.warn('Supabase product upsert error:', e);
    }
  }
  return product;
}

export async function deleteProduct(id: string): Promise<boolean> {
  memoryProducts = memoryProducts.filter((p) => p.id !== id);
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete product error:', e);
    }
  }
  return true;
}

// Testimonials Functions
export async function getTestimonials(approvedOnly = true): Promise<TestimonialItem[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase.from('testimonials').select('*');
      if (approvedOnly) {
        query = query.eq('status', 'approved');
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((t: any) => ({
          id: t.id,
          name: t.name,
          location: t.location,
          rating: t.rating,
          comment: t.comment,
          sharePurchased: t.share_purchased,
          status: t.status,
          createdAt: t.created_at,
        }));
      }
    } catch (e) {
      console.warn('Supabase testimonials error:', e);
    }
  }
  if (approvedOnly) {
    return memoryTestimonials.filter((t) => t.status === 'approved');
  }
  return [...memoryTestimonials];
}

export async function saveTestimonial(testimonial: TestimonialItem): Promise<TestimonialItem> {
  memoryTestimonials = [testimonial, ...memoryTestimonials.filter((t) => t.id !== testimonial.id)];
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('testimonials').upsert({
        id: testimonial.id,
        name: testimonial.name,
        location: testimonial.location,
        rating: testimonial.rating,
        comment: testimonial.comment,
        share_purchased: testimonial.sharePurchased,
        status: testimonial.status,
        created_at: testimonial.createdAt,
      });
    } catch (e) {
      console.warn('Supabase testimonial save error:', e);
    }
  }
  return testimonial;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  memoryTestimonials = memoryTestimonials.filter((t) => t.id !== id);
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('testimonials').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete testimonial error:', e);
    }
  }
  return true;
}

// Contact Message Functions
export async function getContactMessages(): Promise<ContactMessage[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((m: any) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          phone: m.phone || '',
          subject: m.subject || '',
          message: m.message,
          createdAt: m.created_at,
          status: m.status || 'new',
        }));
      }
    } catch (e) {
      console.warn('Supabase contact messages query error:', e);
    }
  }
  return [...memoryMessages];
}

export async function saveContactMessage(msg: ContactMessage): Promise<ContactMessage> {
  memoryMessages = [msg, ...memoryMessages.filter((m) => m.id !== msg.id)];
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('contact_messages').upsert({
        id: msg.id,
        name: msg.name,
        email: msg.email,
        phone: msg.phone,
        subject: msg.subject,
        message: msg.message,
        created_at: msg.createdAt,
        status: msg.status,
      });
    } catch (e) {
      console.warn('Supabase contact message save error:', e);
    }
  }
  return msg;
}

// Newsletter Subscriber Functions
export async function getSubscribers(): Promise<SubscriberItem[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((s: any) => ({
          id: s.id,
          email: s.email,
          createdAt: s.created_at,
        }));
      }
    } catch (e) {
      console.warn('Supabase subscribers query error:', e);
    }
  }
  return [...memorySubscribers];
}

export async function addSubscriber(email: string): Promise<SubscriberItem> {
  const existing = memorySubscribers.find((s) => s.email.toLowerCase() === email.toLowerCase());
  if (existing) return existing;

  const sub: SubscriberItem = {
    id: 'sub-' + Math.random().toString(36).substring(2, 8),
    email,
    createdAt: new Date().toISOString(),
  };

  memorySubscribers = [sub, ...memorySubscribers];

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('subscribers').insert({
        id: sub.id,
        email: sub.email,
        created_at: sub.createdAt,
      });
    } catch (e) {
      console.warn('Supabase subscriber insert error:', e);
    }
  }
  return sub;
}
