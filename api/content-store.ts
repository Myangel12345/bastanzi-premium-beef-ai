import fs from 'fs';
import path from 'path';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {
  ShareTier,
  ManagedPhoto,
  FeeStructure,
  PriceHistoryRecord,
  ContentStoreState,
  PhotoCategoryKey,
} from '../src/types';

const getEnv = (key: string): string => {
  return (process.env[key] || process.env[`VITE_${key}`] || '').trim();
};

const supabaseUrl = getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');

const isHttpUrl = (url: string) => {
  try {
    return /^https?:\/\//i.test(url);
  } catch {
    return false;
  }
};

const supabase = (supabaseUrl && isHttpUrl(supabaseUrl) && supabaseKey && supabaseKey.length > 10)
  ? (() => {
      try {
        return createClient(supabaseUrl, supabaseKey);
      } catch (err) {
        console.warn('Failed to initialize Supabase client in api/content-store.ts:', err);
        return null;
      }
    })()
  : null;

const STORE_PATH = path.join('/tmp', 'bastanzi_content.json');

export const CATEGORY_LABELS: Record<PhotoCategoryKey, string> = {
  beef_cuts: 'Beef Cuts',
  ribeye: 'Ribeye',
  ny_strip: 'New York Strip',
  filet_mignon: 'Filet Mignon',
  brisket: 'Brisket',
  chuck_roast: 'Chuck Roast',
  short_ribs: 'Short Ribs',
  ground_beef: 'Ground Beef Packages',
  vacuum_packaging: 'Vacuum-Sealed Packaging',
  ranch_cattle: 'Ranch & Cattle',
  butcher_processing: 'Butcher & Processing',
  marketing: 'Marketing & Branding',
};

const DEFAULT_SHARE_TIERS: ShareTier[] = [
  {
    id: 'Full',
    title: 'Full Beef Share',
    subtitle: 'The Ultimate Ranch Experience – Maximum Value & Custom Butchering',
    priceRange: '$3,300 – $4,200',
    minPrice: 3300,
    maxPrice: 4200,
    weightLbs: '400 – 440 lbs packaged beef',
    approxMeals: 850,
    freezerSpaceRequired: '16 – 20 cu. ft (Large Chest Freezer)',
    cubicFeet: 18,
    bestFor: 'Large families, avid entertainers, or neighborhood beef share splitters',
    depositAmount: 500,
    featured: true,
    image: '/images/bastanzi_countertop_boxes_1785838324488.jpg',
    availabilityStatus: 'In Stock',
    availabilityNote: 'Fall 2026 Batch - Limited Whole Carcass Allocations',
    cutSummary: {
      steaks: [
        '16-20 Prime Ribeye Steaks (1.25" thick)',
        '16-20 New York Strip Steaks',
        '8-12 Filet Mignons (Tenderloin)',
        '8 Sirloin Steaks & 4 Flank / Skirt Steaks',
      ],
      roastsAndSlow: [
        '6-8 Chuck & Arm Roasts (3-4 lbs each)',
        '4 Prime Rib / Ribeye Roasts',
        '2 Full Packer Briskets (12-14 lbs each)',
        '4 Rump & Top Round Roasts',
        '6 Beef Short Rib Racks',
      ],
      groundAndSpecialty: [
        '180-200 lbs Gourmet Ground Beef (80/20 & 90/10 lean)',
        'Stew Meat, Beef Shank, Ox Tail',
        'Option for Custom Offal / Bones / Fat Cap',
      ],
    },
  },
  {
    id: 'Half',
    title: 'Half Beef Share',
    subtitle: 'The Most Popular Choice for Beef Enthusiasts',
    priceRange: '$1,650 – $2,085',
    minPrice: 1650,
    maxPrice: 2085,
    weightLbs: '200 – 220 lbs packaged beef',
    approxMeals: 420,
    freezerSpaceRequired: '8 – 10 cu. ft (Medium Chest Freezer)',
    cubicFeet: 9,
    bestFor: 'Families of 3 to 5 eating high-quality beef year-round',
    depositAmount: 300,
    image: '/images/bastanzi_boxed_roasts_1785838239509.jpg',
    availabilityStatus: 'In Stock',
    availabilityNote: 'Most Popular - Reserving Fast for October Harvest',
    cutSummary: {
      steaks: [
        '8-10 Prime Ribeye Steaks',
        '8-10 NY Strip Steaks',
        '4-6 Filet Mignons',
        '4 Sirloin Steaks & 2 Skirt/Flank Steaks',
      ],
      roastsAndSlow: [
        '3-4 Chuck Roasts',
        '2 Rib Roast Sections',
        '1 Whole Packer Brisket',
        '2 Rump Roasts',
        '3 Short Rib Racks',
      ],
      groundAndSpecialty: [
        '90-100 lbs Artisan Ground Beef (1 lb vacuum packs)',
        'Stew Meat & Osso Buco Shanks',
        'Marrow Bones for bone broth',
      ],
    },
  },
  {
    id: 'Quarter',
    title: 'Quarter Beef Share',
    subtitle: 'Balanced Mix of Steaks, Roasts & Ground Beef',
    priceRange: '$850 – $1,050',
    minPrice: 850,
    maxPrice: 1050,
    weightLbs: '100 – 110 lbs packaged beef',
    approxMeals: 210,
    freezerSpaceRequired: '4 – 5 cu. ft (Small Chest Freezer or Upright)',
    cubicFeet: 4.5,
    bestFor: 'Couples and small families looking for 4-6 months of beef',
    depositAmount: 200,
    image: '/images/bastanzi_chest_freezer_1785838268756.jpg',
    availabilityStatus: 'In Stock',
    availabilityNote: 'Great Starter Share - Fits in Small Chest Freezer',
    cutSummary: {
      steaks: [
        '4-5 Ribeye Steaks',
        '4-5 NY Strip Steaks',
        '2-3 Filet Mignons',
        '2 Top Sirloin Steaks',
      ],
      roastsAndSlow: [
        '2 Chuck Roasts',
        '1 Rump Roast',
        '1 Half Brisket or Short Rib Rack',
      ],
      groundAndSpecialty: [
        '45-50 lbs Dry-Aged Ground Beef',
        '10 lbs Stew Meat & Soup Bones',
      ],
    },
  },
  {
    id: 'Eighth',
    title: 'Eighth Beef Share',
    subtitle: 'The Perfect Sampler – Fits in Standard Refrigerator Freezers',
    priceRange: '$450 – $550',
    minPrice: 450,
    maxPrice: 550,
    weightLbs: '50 – 55 lbs packaged beef',
    approxMeals: 100,
    freezerSpaceRequired: '2 – 2.5 cu. ft (Standard Kitchen Freezer Space)',
    cubicFeet: 2.2,
    bestFor: 'First-time buyers testing luxury pasture-raised beef',
    depositAmount: 100,
    image: '/images/bastanzi_floor_boxes_1785838337186.jpg',
    availabilityStatus: 'In Stock',
    availabilityNote: 'Fits in Kitchen Freezer - No Extra Freezer Needed',
    cutSummary: {
      steaks: [
        '2 Ribeye Steaks',
        '2 NY Strip Steaks',
        '1 Filet Mignon or Sirloin',
      ],
      roastsAndSlow: [
        '1 Pot Roast / Chuck Roast (3 lbs)',
        '1 Short Rib Rack portion',
      ],
      groundAndSpecialty: [
        '22-25 lbs Premium Ground Beef',
        '5 lbs Stew Meat / Sirloin Tips',
      ],
    },
  },
];

const DEFAULT_PHOTOS: ManagedPhoto[] = [
  {
    id: 'photo-1',
    title: 'Dry-Aged Prime Ribeye Steaks on Slate',
    category: 'ribeye',
    categoryLabel: 'Ribeye',
    imageUrl: '/images/bastanzi_ribeye_slate_1785838381086.jpg',
    description: 'Intense intramuscular marbling dry-aged for exceptional steakhouse flavor.',
    updatedAt: new Date().toISOString(),
    targetSection: 'shares',
  },
  {
    id: 'photo-2',
    title: 'Center-Cut Filet Mignon Tenderloin',
    category: 'filet_mignon',
    categoryLabel: 'Filet Mignon',
    imageUrl: '/images/bastanzi_filet_mignon_1785838437969.jpg',
    description: 'Center-cut Filet Mignon steaks seasoned with pepper and sea salt.',
    updatedAt: new Date().toISOString(),
    targetSection: 'shares',
  },
  {
    id: 'photo-3',
    title: 'Whole Packer Beef Brisket & Roasts',
    category: 'brisket',
    categoryLabel: 'Brisket',
    imageUrl: '/images/bastanzi_boxed_roasts_1785838239509.jpg',
    description: 'Whole packer brisket and chuck roasts prepared for slow smoking.',
    updatedAt: new Date().toISOString(),
    targetSection: 'shares',
  },
  {
    id: 'photo-4',
    title: 'Chuck & Arm Roasts',
    category: 'chuck_roast',
    categoryLabel: 'Chuck Roast',
    imageUrl: '/images/bastanzi_stew_cubes_1785838393915.jpg',
    description: 'Thick hand-cut marbled chuck roast and stew beef portions.',
    updatedAt: new Date().toISOString(),
    targetSection: 'shares',
  },
  {
    id: 'photo-5',
    title: 'Bone-In English Cut Short Ribs',
    category: 'short_ribs',
    categoryLabel: 'Short Ribs',
    imageUrl: '/images/bastanzi_english_shortribs_1785838367019.jpg',
    description: 'Thick English cut beef short rib racks ready for braising.',
    updatedAt: new Date().toISOString(),
    targetSection: 'shares',
  },
  {
    id: 'photo-6',
    title: 'Artisan Vacuum-Sealed Ground Beef Packs',
    category: 'ground_beef',
    categoryLabel: 'Ground Beef Packages',
    imageUrl: '/images/bastanzi_countertop_boxes_1785838324488.jpg',
    description: '1lb flash-frozen ground beef vacuum packages (80/20 & 90/10 lean).',
    updatedAt: new Date().toISOString(),
    targetSection: 'packaging',
  },
  {
    id: 'photo-7',
    title: 'Heavy-Duty Vacuum-Sealed Packaging',
    category: 'vacuum_packaging',
    categoryLabel: 'Vacuum-Sealed Packaging',
    imageUrl: '/images/bastanzi_chest_freezer_1785838268756.jpg',
    description: 'Commercial 5-mil vacuum sealed packaging preventing freezer burn.',
    updatedAt: new Date().toISOString(),
    targetSection: 'packaging',
  },
  {
    id: 'photo-8',
    title: 'Pasture Cattle Grazing at Ranch',
    category: 'ranch_cattle',
    categoryLabel: 'Ranch & Cattle',
    imageUrl: '/images/bastanzi_founders_menu_1785838280690.jpg',
    description: 'Pasture-raised cattle grazing peacefully on open lush Arizona fields.',
    updatedAt: new Date().toISOString(),
    targetSection: 'ranch',
  },
  {
    id: 'photo-9',
    title: '21-Day Dry Aging Cooler Facility',
    category: 'butcher_processing',
    categoryLabel: 'Butcher & Processing',
    imageUrl: '/images/bastanzi_hanging_carcasses_1785838293834.jpg',
    description: 'Whole carcasses dry-aging in state-of-the-art climate-controlled room.',
    updatedAt: new Date().toISOString(),
    targetSection: 'about',
  },
  {
    id: 'photo-10',
    title: 'Bastanzi Official Brand Emblem',
    category: 'marketing',
    categoryLabel: 'Marketing & Branding',
    imageUrl: '/images/bastanzi_official_emblem_1785838313342.jpg',
    description: 'Official seal of pasture-raised 21-day dry aged beef excellence.',
    updatedAt: new Date().toISOString(),
    targetSection: 'hero',
  },
];

const DEFAULT_FEES: FeeStructure = {
  processingFee: 0,
  processingFeeNote: 'USDA Inspection, Dry Aging & Precision Hand-Butchering included in share price',
  localDeliveryFee: 0,
  localDeliveryFeeNote: 'Free Phoenix Metro Doorstep Delivery (Scottsdale, PV, Chandler, Gilbert, Mesa)',
  nationwideShippingFee: 49,
  nationwideShippingFeeNote: 'Insulated Express Cooler Box with Dry Ice (Guaranteed Rock-Solid Arrival)',
  promotionalCode: 'HARVEST2026',
  promotionalDiscountPercent: 0,
  promotionalDiscountAmount: 50,
  promotionalBannerText: 'Fall Harvest Special: Reserve early and save $50 on your share deposit!',
  promotionalActive: true,
};

const DEFAULT_PRICE_HISTORY: PriceHistoryRecord[] = [
  {
    id: 'ph-1',
    timestamp: new Date().toISOString(),
    itemTitle: 'Initial System Launch Rates',
    oldPrice: 'N/A',
    newPrice: 'Full: $3,300, Half: $1,650, Quarter: $850, Eighth: $450',
    updatedBy: 'Bastanzi Admin',
    notes: 'Base 2026 harvest pricing initialized.',
  },
];

let inMemoryState: ContentStoreState | null = null;

export function loadContentStore(): ContentStoreState {
  if (inMemoryState) return inMemoryState;

  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, 'utf-8');
      inMemoryState = JSON.parse(data) as ContentStoreState;
      return inMemoryState;
    }
  } catch (err) {
    console.error('[ContentStore] Error reading disk state:', err);
  }

  inMemoryState = {
    shareTiers: DEFAULT_SHARE_TIERS,
    photos: DEFAULT_PHOTOS,
    fees: DEFAULT_FEES,
    priceHistory: DEFAULT_PRICE_HISTORY,
    lastUpdated: new Date().toISOString(),
  };

  persistContentStore();
  return inMemoryState;
}

export function persistContentStore(): void {
  if (!inMemoryState) return;
  try {
    inMemoryState.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STORE_PATH, JSON.stringify(inMemoryState, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ContentStore] Error writing disk state:', err);
  }
}

export async function loadContentStoreFromSupabase(): Promise<ContentStoreState | null> {
  if (!supabase) return null;
  try {
    const { data: storeRow, error: storeErr } = await supabase
      .from('content_store')
      .select('data')
      .eq('id', 'main')
      .maybeSingle();

    let fetchedStore: ContentStoreState | null = null;
    if (!storeErr && storeRow?.data) {
      fetchedStore = storeRow.data as ContentStoreState;
    }

    const { data: photoRows, error: photoErr } = await supabase
      .from('photos')
      .select('*')
      .order('updated_at', { ascending: false });

    let fetchedPhotos: ManagedPhoto[] | null = null;
    if (!photoErr && photoRows && photoRows.length > 0) {
      fetchedPhotos = photoRows.map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        categoryLabel: item.category_label || item.category,
        imageUrl: item.image_url || item.imageUrl,
        description: item.description || '',
        updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
        targetSection: item.target_section || item.targetSection || 'gallery',
      }));
    }

    if (fetchedStore || fetchedPhotos) {
      const baseStore = fetchedStore || loadContentStore();
      const finalPhotos = fetchedPhotos || baseStore.photos;

      inMemoryState = {
        ...baseStore,
        photos: finalPhotos,
        lastUpdated: new Date().toISOString(),
      };
      persistContentStore();
      return inMemoryState;
    }
  } catch (err) {
    console.warn('[ContentStore] Supabase async load exception:', err);
  }
  return null;
}

export async function saveContentStoreToSupabase(store: ContentStoreState): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('content_store').upsert(
      {
        id: 'main',
        data: store,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (store.photos && Array.isArray(store.photos)) {
      for (const p of store.photos) {
        await supabase.from('photos').upsert(
          {
            id: p.id,
            title: p.title,
            category: p.category,
            category_label: p.categoryLabel,
            image_url: p.imageUrl,
            description: p.description,
            target_section: p.targetSection,
            updated_at: p.updatedAt || new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      }
    }
  } catch (err) {
    console.warn('[ContentStore] Supabase save exception:', err);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    if (supabase) {
      await loadContentStoreFromSupabase();
    }
    const store = loadContentStore();
    return res.status(200).json(store);
  }

  if (req.method === 'POST') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim() || (req.query?.token as string);

    if (token !== 'bastanzi2026' && token !== 'true') {
      return res.status(401).json({ error: 'Unauthorized admin access.' });
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      if (supabase) {
        await loadContentStoreFromSupabase();
      }
      const store = loadContentStore();

      if (body.action === 'update_share_tiers') {
        if (Array.isArray(body.shareTiers)) {
          for (const newTier of body.shareTiers as ShareTier[]) {
            const oldTier = store.shareTiers.find((t) => t.id === newTier.id);
            if (oldTier && (oldTier.minPrice !== newTier.minPrice || oldTier.maxPrice !== newTier.maxPrice || oldTier.depositAmount !== newTier.depositAmount)) {
              store.priceHistory.unshift({
                id: 'ph_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
                timestamp: new Date().toISOString(),
                itemTitle: `${newTier.title} (${newTier.id})`,
                oldPrice: `${oldTier.priceRange} (Deposit: $${oldTier.depositAmount})`,
                newPrice: `${newTier.priceRange} (Deposit: $${newTier.depositAmount})`,
                updatedBy: body.updatedBy || 'Admin User',
                notes: body.notes || 'Updated via Admin Pricing Console',
              });
            }
          }
          store.shareTiers = body.shareTiers;
        }
      }

      if (body.action === 'update_fees') {
        if (body.fees) {
          const oldFees = store.fees;
          const newFees = body.fees as FeeStructure;

          if (
            oldFees.localDeliveryFee !== newFees.localDeliveryFee ||
            oldFees.nationwideShippingFee !== newFees.nationwideShippingFee ||
            oldFees.processingFee !== newFees.processingFee ||
            oldFees.promotionalDiscountAmount !== newFees.promotionalDiscountAmount
          ) {
            store.priceHistory.unshift({
              id: 'ph_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
              timestamp: new Date().toISOString(),
              itemTitle: 'Fee & Promotional Structure',
              oldPrice: `Local: $${oldFees.localDeliveryFee}, Shipping: $${oldFees.nationwideShippingFee}, Promo: $${oldFees.promotionalDiscountAmount || 0}`,
              newPrice: `Local: $${newFees.localDeliveryFee}, Shipping: $${newFees.nationwideShippingFee}, Promo: $${newFees.promotionalDiscountAmount || 0}`,
              updatedBy: body.updatedBy || 'Admin User',
              notes: 'Fee structure updated',
            });
          }

          store.fees = newFees;
        }
      }

      if (body.action === 'update_photos') {
        if (Array.isArray(body.photos)) {
          store.photos = body.photos;
        }
      }

      if (body.action === 'add_photo') {
        if (body.photo) {
          const newPhoto: ManagedPhoto = {
            id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
            title: body.photo.title || 'Uploaded Beef Photo',
            category: body.photo.category || 'beef_cuts',
            categoryLabel: CATEGORY_LABELS[body.photo.category as PhotoCategoryKey] || 'Beef Cuts',
            imageUrl: body.photo.imageUrl,
            description: body.photo.description || '',
            updatedAt: new Date().toISOString(),
            targetSection: body.photo.targetSection || 'gallery',
          };
          store.photos.unshift(newPhoto);
        }
      }

      if (body.action === 'delete_photo') {
        if (body.photoId) {
          store.photos = store.photos.filter((p) => p.id !== body.photoId);
          if (supabase) {
            await supabase.from('photos').delete().eq('id', body.photoId);
          }
        }
      }

      if (body.action === 'replace_photo') {
        if (body.photoId && body.newImageUrl) {
          const found = store.photos.find((p) => p.id === body.photoId);
          if (found) {
            // Append cache busting timestamp if not already present
            const finalUrl = body.newImageUrl.includes('v=')
              ? body.newImageUrl
              : (body.newImageUrl.includes('?') ? `${body.newImageUrl}&v=${Date.now()}` : `${body.newImageUrl}?v=${Date.now()}`);

            found.imageUrl = finalUrl;
            if (body.title) found.title = body.title;
            if (body.category) {
              found.category = body.category;
              found.categoryLabel = CATEGORY_LABELS[body.category as PhotoCategoryKey] || found.categoryLabel;
            }
            if (body.description) found.description = body.description;
            found.updatedAt = new Date().toISOString();
          }
        }
      }

      persistContentStore();
      if (supabase) {
        await saveContentStoreToSupabase(store);
      }
      return res.status(200).json({ success: true, store });
    } catch (err: any) {
      console.error('[ContentStoreHandler] Error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to update content store.' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
