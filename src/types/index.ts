export type ShareSize = 'Full' | 'Half' | 'Quarter' | 'Eighth';

export type FinishOption = 'Grass-fed' | 'Grain-finished' | 'Mixed';

export interface ShareTier {
  id: ShareSize;
  title: string;
  subtitle: string;
  priceRange: string;
  minPrice: number;
  maxPrice: number;
  weightLbs: string;
  approxMeals: number;
  freezerSpaceRequired: string;
  cubicFeet: number;
  bestFor: string;
  depositAmount: number;
  featured?: boolean;
  image?: string;
  cutSummary: {
    steaks: string[];
    roastsAndSlow: string[];
    groundAndSpecialty: string[];
  };
}

export interface ReservationPayload {
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  shareSize: ShareSize;
  finish: FinishOption;
  preferredDeliveryDate: string;
  notes: string;
}

export interface ReservationRecord extends ReservationPayload {
  id: string;
  createdAt: string;
  estimatedPrice: string;
  depositRequired: number;
  status: 'Pending' | 'Confirmed' | 'Fulfilled';
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export type OrderStatus =
  | 'Order Received'
  | 'Reservation Confirmed'
  | 'Payment Confirmed'
  | 'Preparing Beef Share'
  | 'Quality Inspection'
  | 'Packaged'
  | 'Ready for Pickup'
  | 'Out for Delivery'
  | 'Delivered';

export type FulfillmentMethod = 'Pickup' | 'Delivery';

export type PaymentStatus = 'Pending' | 'Deposit Paid' | 'Paid in Full' | 'Refunded';

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  beef_share: string;
  estimated_weight: string;
  total_price: number;
  payment_status: PaymentStatus | string;
  fulfillment_method: FulfillmentMethod | string;
  pickup_date: string;
  delivery_date: string;
  current_status: OrderStatus | string;
  notes: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  history?: OrderHistory[];
}

export interface OrderHistory {
  id: string;
  order_id: string;
  status: string;
  notes: string;
  created_at: string;
  created_by: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'ranch' | 'cuts' | 'culinary' | 'packaging';
  categoryLabel: string;
  imageUrl: string;
  description: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Ordering & Shares' | 'Beef Quality & Finishing' | 'Delivery & Shipping' | 'Freezer & Storage';
}

export interface ReviewItem {
  id: string;
  author: string;
  location: string;
  shareType: string;
  rating: number;
  date: string;
  comment: string;
}

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

