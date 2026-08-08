import {
  ShareTier,
  ManagedPhoto,
  FeeStructure,
  PriceHistoryRecord,
  ContentStoreState,
  PhotoCategoryKey,
} from '../types';

export const PHOTO_CATEGORY_OPTIONS: { key: PhotoCategoryKey; label: string }[] = [
  { key: 'beef_cuts', label: 'Beef cuts' },
  { key: 'ribeye', label: 'Ribeye' },
  { key: 'ny_strip', label: 'New York strip' },
  { key: 'filet_mignon', label: 'Filet mignon' },
  { key: 'brisket', label: 'Brisket' },
  { key: 'chuck_roast', label: 'Chuck roast' },
  { key: 'short_ribs', label: 'Short ribs' },
  { key: 'ground_beef', label: 'Ground beef packages' },
  { key: 'vacuum_packaging', label: 'Vacuum-sealed beef packaging' },
  { key: 'ranch_cattle', label: 'Ranch/cattle photos' },
  { key: 'butcher_processing', label: 'Butcher/processing photos' },
  { key: 'marketing', label: 'Marketing images' },
];

const LOCAL_STORAGE_KEY = 'bastanzi_content_store_v1';

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

let currentStoreState: ContentStoreState = {
  shareTiers: DEFAULT_SHARE_TIERS,
  photos: DEFAULT_PHOTOS,
  fees: DEFAULT_FEES,
  priceHistory: [
    {
      id: 'ph-init',
      timestamp: new Date().toISOString(),
      itemTitle: 'System Base Launch Pricing',
      oldPrice: 'N/A',
      newPrice: 'Full: $3,300, Half: $1,650, Quarter: $850, Eighth: $450',
      updatedBy: 'Bastanzi Admin',
      notes: 'Initial release',
    },
  ],
  lastUpdated: new Date().toISOString(),
};

import {
  syncPhotoToSupabase,
  deletePhotoFromSupabase,
  fetchPhotosFromSupabase,
} from './supabase';

const listeners: Set<() => void> = new Set();

export function subscribeContentStore(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('[ContentStore] Listener error:', e);
    }
  });
}

// Load initial state from LocalStorage or API and Supabase
export function initContentStore(): ContentStoreState {
  if (typeof window === 'undefined') return currentStoreState;

  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      currentStoreState = JSON.parse(local);
    }
  } catch (err) {
    console.error('[ContentStore] Error loading local storage:', err);
  }

  // Fetch remote Supabase photos if configured
  fetchPhotosFromSupabase()
    .then((supabasePhotos) => {
      if (supabasePhotos && supabasePhotos.length > 0) {
        // Merge Supabase photos into store
        const existingIds = new Set(supabasePhotos.map((p) => p.id));
        const mergedPhotos = [
          ...supabasePhotos,
          ...currentStoreState.photos.filter((p) => !existingIds.has(p.id)),
        ];
        currentStoreState.photos = mergedPhotos;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentStoreState));
        notifyListeners();
      }
    })
    .catch((err) => {
      console.warn('[ContentStore] Supabase photo sync warning:', err);
    });

  // Fetch remote backend state
  fetch('/api/content-store')
    .then((res) => {
      if (res.ok) return res.json();
      throw new Error('Failed to fetch remote content store');
    })
    .then((data: ContentStoreState) => {
      if (data && data.shareTiers) {
        // Keep any newly synced Supabase photos
        const combinedPhotos = [
          ...currentStoreState.photos,
          ...(data.photos || []).filter((dp) => !currentStoreState.photos.some((cp) => cp.id === dp.id)),
        ];
        currentStoreState = {
          ...data,
          photos: combinedPhotos.length > 0 ? combinedPhotos : data.photos,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentStoreState));
        notifyListeners();
      }
    })
    .catch((err) => {
      console.warn('[ContentStore] Remote sync warning, using local state:', err);
    });

  return currentStoreState;
}

export function getClientContentStore(): ContentStoreState {
  return currentStoreState;
}

export async function saveShareTiersToStore(
  shareTiers: ShareTier[],
  updatedBy = 'Admin',
  notes = 'Updated product & pricing'
): Promise<ContentStoreState> {
  const previousTiers = currentStoreState.shareTiers;
  currentStoreState.shareTiers = shareTiers;
  currentStoreState.lastUpdated = new Date().toISOString();

  // Generate price history records
  shareTiers.forEach((nt) => {
    const ot = previousTiers.find((t) => t.id === nt.id);
    if (ot && (ot.minPrice !== nt.minPrice || ot.maxPrice !== nt.maxPrice || ot.depositAmount !== nt.depositAmount)) {
      currentStoreState.priceHistory.unshift({
        id: 'ph_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        timestamp: new Date().toISOString(),
        itemTitle: `${nt.title} (${nt.id})`,
        oldPrice: `${ot.priceRange} (Deposit: $${ot.depositAmount})`,
        newPrice: `${nt.priceRange} (Deposit: $${nt.depositAmount})`,
        updatedBy,
        notes,
      });
    }
  });

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentStoreState));
  notifyListeners();

  try {
    const res = await fetch('/api/content-store', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer bastanzi2026',
      },
      body: JSON.stringify({
        action: 'update_share_tiers',
        shareTiers,
        updatedBy,
        notes,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.store) {
        currentStoreState = data.store;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.store));
        notifyListeners();
      }
    }
  } catch (err) {
    console.error('[ContentStore] Save share tiers error:', err);
  }

  return currentStoreState;
}

export async function saveFeesToStore(fees: FeeStructure, updatedBy = 'Admin'): Promise<ContentStoreState> {
  currentStoreState.fees = fees;
  currentStoreState.lastUpdated = new Date().toISOString();

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentStoreState));
  notifyListeners();

  try {
    const res = await fetch('/api/content-store', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer bastanzi2026',
      },
      body: JSON.stringify({
        action: 'update_fees',
        fees,
        updatedBy,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.store) {
        currentStoreState = data.store;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.store));
        notifyListeners();
      }
    }
  } catch (err) {
    console.error('[ContentStore] Save fees error:', err);
  }

  return currentStoreState;
}

export async function addPhotoToStore(photo: {
  title: string;
  category: PhotoCategoryKey;
  imageUrl: string;
  description: string;
  targetSection?: string;
}): Promise<ContentStoreState> {
  const catObj = PHOTO_CATEGORY_OPTIONS.find((c) => c.key === photo.category);
  const newPhoto: ManagedPhoto = {
    id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
    title: photo.title || 'Uploaded Photo',
    category: photo.category,
    categoryLabel: catObj ? catObj.label : 'Beef Cuts',
    imageUrl: photo.imageUrl,
    description: photo.description || '',
    updatedAt: new Date().toISOString(),
    targetSection: photo.targetSection || 'gallery',
  };

  currentStoreState.photos.unshift(newPhoto);

  // If photo targets product shares or matches a share size name, update the corresponding product tier image
  if (photo.targetSection === 'shares' || photo.category === 'beef_cuts') {
    const titleLower = photo.title.toLowerCase();
    const matchedTier = currentStoreState.shareTiers.find((t) =>
      titleLower.includes(t.id.toLowerCase()) || titleLower.includes(t.title.toLowerCase())
    );
    if (matchedTier) {
      matchedTier.image = photo.imageUrl;
    } else if (photo.targetSection === 'shares' && currentStoreState.shareTiers.length > 0) {
      // Default fallback to first tier if targeted at shares section
      currentStoreState.shareTiers[0].image = photo.imageUrl;
    }
  }

  currentStoreState.lastUpdated = new Date().toISOString();

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentStoreState));
  notifyListeners();

  // Sync to Supabase database table
  syncPhotoToSupabase(newPhoto).catch((e) => console.warn('Supabase photo sync error:', e));

  try {
    const res = await fetch('/api/content-store', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer bastanzi2026',
      },
      body: JSON.stringify({
        action: 'add_photo',
        photo: newPhoto,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.store) {
        currentStoreState = {
          ...data.store,
          photos: currentStoreState.photos,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentStoreState));
        notifyListeners();
      }
    }
  } catch (err) {
    console.error('[ContentStore] Add photo error:', err);
  }

  return currentStoreState;
}

export async function replacePhotoInStore(
  photoId: string,
  newImageUrl: string,
  title?: string,
  category?: PhotoCategoryKey,
  description?: string
): Promise<ContentStoreState> {
  const target = currentStoreState.photos.find((p) => p.id === photoId);
  if (target) {
    target.imageUrl = newImageUrl;
    if (title) target.title = title;
    if (category) {
      target.category = category;
      const catObj = PHOTO_CATEGORY_OPTIONS.find((c) => c.key === category);
      if (catObj) target.categoryLabel = catObj.label;
    }
    if (description !== undefined) target.description = description;
    target.updatedAt = new Date().toISOString();

    // Sync to Supabase database table
    syncPhotoToSupabase(target).catch((e) => console.warn('Supabase photo sync error:', e));
  }

  currentStoreState.lastUpdated = new Date().toISOString();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentStoreState));
  notifyListeners();

  try {
    const res = await fetch('/api/content-store', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer bastanzi2026',
      },
      body: JSON.stringify({
        action: 'replace_photo',
        photoId,
        newImageUrl,
        title,
        category,
        description,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.store) {
        currentStoreState = {
          ...data.store,
          photos: currentStoreState.photos,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentStoreState));
        notifyListeners();
      }
    }
  } catch (err) {
    console.error('[ContentStore] Replace photo error:', err);
  }

  return currentStoreState;
}

export async function deletePhotoFromStore(photoId: string): Promise<ContentStoreState> {
  currentStoreState.photos = currentStoreState.photos.filter((p) => p.id !== photoId);
  currentStoreState.lastUpdated = new Date().toISOString();

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentStoreState));
  notifyListeners();

  // Delete from Supabase database table
  deletePhotoFromSupabase(photoId).catch((e) => console.warn('Supabase photo delete error:', e));

  try {
    const res = await fetch('/api/content-store', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer bastanzi2026',
      },
      body: JSON.stringify({
        action: 'delete_photo',
        photoId,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.store) {
        currentStoreState = {
          ...data.store,
          photos: currentStoreState.photos,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentStoreState));
        notifyListeners();
      }
    }
  } catch (err) {
    console.error('[ContentStore] Delete photo error:', err);
  }

  return currentStoreState;
}

// Auto-init on import
if (typeof window !== 'undefined') {
  initContentStore();
}
