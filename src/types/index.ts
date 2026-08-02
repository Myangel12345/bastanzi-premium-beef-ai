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
  phone: string;
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
