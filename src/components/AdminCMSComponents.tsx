import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Image as ImageIcon,
  DollarSign,
  Package,
  Tag,
  Upload,
  RefreshCw,
  Trash2,
  Plus,
  Edit2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
  Bot,
  FileText,
  ChevronRight,
  Eye,
  ShieldCheck,
  Percent,
  Truck,
  Layers,
  Sliders,
} from 'lucide-react';
import {
  getClientContentStore,
  subscribeContentStore,
  saveShareTiersToStore,
  saveFeesToStore,
  addPhotoToStore,
  replacePhotoInStore,
  deletePhotoFromStore,
  PHOTO_CATEGORY_OPTIONS,
} from '../lib/contentStore';
import {
  ShareTier,
  ManagedPhoto,
  FeeStructure,
  PriceHistoryRecord,
  PhotoCategoryKey,
  ShareAvailabilityStatus,
} from '../types';

// ==========================================
// 1. PRODUCT INFORMATION MANAGEMENT COMPONENT
// ==========================================
export function ProductManagementSection() {
  const [contentStore, setContentStore] = useState(getClientContentStore());
  const [editingTier, setEditingTier] = useState<ShareTier | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeContentStore(() => {
      setContentStore({ ...getClientContentStore() });
    });
    return () => unsubscribe();
  }, []);

  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;

    let updatedTiers = [...contentStore.shareTiers];
    const existingIndex = updatedTiers.findIndex((t) => t.id === editingTier.id);

    if (existingIndex >= 0) {
      updatedTiers[existingIndex] = editingTier;
    } else {
      updatedTiers.push(editingTier);
    }

    await saveShareTiersToStore(
      updatedTiers,
      'Admin Manager',
      `Updated product information for ${editingTier.title}`
    );

    setSaveSuccessMsg(`Product details for "${editingTier.title}" successfully saved! AI Chatbot & website pages updated.`);
    setEditingTier(null);
    setIsAddingNew(false);

    setTimeout(() => setSaveSuccessMsg(''), 5000);
  };

  const handleCreateNewTier = () => {
    const newTier: ShareTier = {
      id: ('Custom_' + Date.now().toString().slice(-4)) as any,
      title: 'New Specialty Beef Share / Sampler',
      subtitle: 'Artisan Custom Cuts Selection',
      priceRange: '$600 – $750',
      minPrice: 600,
      maxPrice: 750,
      weightLbs: '60 – 75 lbs packaged beef',
      approxMeals: 140,
      freezerSpaceRequired: '3 – 3.5 cu. ft.',
      cubicFeet: 3,
      bestFor: 'Custom household sampler orders',
      depositAmount: 150,
      featured: false,
      image: '/images/bastanzi_countertop_boxes_1785838324488.jpg',
      availabilityStatus: 'In Stock',
      availabilityNote: 'New Custom Batch Available',
      cutSummary: {
        steaks: ['4 Ribeye Steaks', '4 NY Strip Steaks'],
        roastsAndSlow: ['2 Chuck Roasts', '1 Short Rib Rack'],
        groundAndSpecialty: ['25 lbs Gourmet Ground Beef'],
      },
    };
    setEditingTier(newTier);
    setIsAddingNew(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0f2217] p-6 rounded-2xl border border-emerald-800/60 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-900/80 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-amber-100 flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-400" />
              <span>Product Information & Beef Share Management</span>
            </h2>
            <p className="text-stone-300 text-xs font-light mt-1 max-w-3xl">
              Update product names, descriptions, share details, estimated weights, inventory availability, freezer requirements, and custom cut breakdowns. All updates automatically synchronize across product pages, reservation forms, and the AI chatbot knowledge base.
            </p>
          </div>
          <button
            onClick={handleCreateNewTier}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-serif text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Share / Sampler</span>
          </button>
        </div>

        {saveSuccessMsg && (
          <div className="p-4 bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 text-xs rounded-xl flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Sync Status Banner */}
        <div className="bg-[#07110a] p-3.5 rounded-xl border border-amber-500/30 flex items-center justify-between text-xs font-mono text-amber-300">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>AI Chatbot Auto-Sync Active: Chatbot answers automatically use live tier data</span>
          </div>
          <span className="text-[10px] text-stone-400">
            Last Updated: {new Date(contentStore.lastUpdated).toLocaleTimeString()}
          </span>
        </div>

        {/* Product Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {contentStore.shareTiers.map((tier) => (
            <div
              key={tier.id}
              className="bg-[#07110a] rounded-xl p-5 border border-emerald-800/60 space-y-4 hover:border-amber-500/40 transition-all relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                      ID: {tier.id}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-amber-100 mt-1">{tier.title}</h3>
                    <p className="text-stone-300 text-xs font-light italic">{tier.subtitle}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded-full uppercase border shrink-0 ${
                      tier.availabilityStatus === 'In Stock'
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600/60'
                        : tier.availabilityStatus === 'Limited Allocation'
                        ? 'bg-amber-950/90 text-amber-300 border-amber-600/60'
                        : tier.availabilityStatus === 'Sold Out'
                        ? 'bg-rose-950/90 text-rose-300 border-rose-600/60'
                        : 'bg-blue-950/90 text-blue-300 border-blue-600/60'
                    }`}
                  >
                    {tier.availabilityStatus || 'In Stock'}
                  </span>
                </div>

                {tier.image && (
                  <div className="w-full h-36 overflow-hidden rounded-lg mb-3 border border-emerald-900/60">
                    <img
                      src={tier.image}
                      alt={tier.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#0c1a12] p-3 rounded-lg border border-emerald-900/60 mb-3">
                  <div>
                    <span className="text-stone-400 text-[10px] block">Price Range</span>
                    <span className="text-amber-300 font-bold">{tier.priceRange}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block">Deposit Required</span>
                    <span className="text-emerald-400 font-bold">${tier.depositAmount}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block">Packaged Weight</span>
                    <span className="text-stone-200">{tier.weightLbs}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block">Freezer Space</span>
                    <span className="text-amber-200">{tier.freezerSpaceRequired}</span>
                  </div>
                </div>

                <div className="text-xs text-stone-300 space-y-1 font-light">
                  <p>
                    <strong className="text-stone-200">Portion Yield:</strong> ~{tier.approxMeals} meals
                  </p>
                  <p>
                    <strong className="text-stone-200">Ideal For:</strong> {tier.bestFor}
                  </p>
                  {tier.availabilityNote && (
                    <p className="text-emerald-400 font-mono text-[11px] pt-1 italic">
                      Note: {tier.availabilityNote}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-emerald-900/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setEditingTier({ ...tier });
                    setIsAddingNew(false);
                  }}
                  className="w-full py-2 bg-[#12261a] hover:bg-[#183222] text-amber-200 text-xs font-serif font-bold rounded-lg border border-emerald-700/60 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Product Info & Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingTier && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0f2217] border border-amber-500/50 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-emerald-900/80 pb-3">
              <h3 className="font-serif text-xl font-bold text-amber-200 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <span>{isAddingNew ? 'Add New Beef Share Tier' : `Edit ${editingTier.title}`}</span>
              </h3>
              <button
                onClick={() => setEditingTier(null)}
                className="text-stone-400 hover:text-white text-sm font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveTier} className="space-y-4 text-xs font-serif">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Product Title</label>
                  <input
                    type="text"
                    value={editingTier.title}
                    onChange={(e) => setEditingTier({ ...editingTier, title: e.target.value })}
                    required
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-amber-100 font-sans focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Product Subtitle</label>
                  <input
                    type="text"
                    value={editingTier.subtitle}
                    onChange={(e) => setEditingTier({ ...editingTier, subtitle: e.target.value })}
                    required
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-amber-100 font-sans focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-amber-300 font-bold mb-1">Price Range Display</label>
                  <input
                    type="text"
                    value={editingTier.priceRange}
                    onChange={(e) => setEditingTier({ ...editingTier, priceRange: e.target.value })}
                    required
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-amber-200 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Min Price ($)</label>
                  <input
                    type="number"
                    value={editingTier.minPrice}
                    onChange={(e) => setEditingTier({ ...editingTier, minPrice: Number(e.target.value) })}
                    required
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-amber-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Max Price ($)</label>
                  <input
                    type="number"
                    value={editingTier.maxPrice}
                    onChange={(e) => setEditingTier({ ...editingTier, maxPrice: Number(e.target.value) })}
                    required
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-amber-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-emerald-300 font-bold mb-1">Deposit Amount ($)</label>
                  <input
                    type="number"
                    value={editingTier.depositAmount}
                    onChange={(e) => setEditingTier({ ...editingTier, depositAmount: Number(e.target.value) })}
                    required
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-emerald-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Availability Inventory Status</label>
                  <select
                    value={editingTier.availabilityStatus || 'In Stock'}
                    onChange={(e) =>
                      setEditingTier({
                        ...editingTier,
                        availabilityStatus: e.target.value as ShareAvailabilityStatus,
                      })
                    }
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-amber-100 font-sans focus:outline-none focus:border-amber-400"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Limited Allocation">Limited Allocation</option>
                    <option value="Pre-Order">Pre-Order</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Availability Note</label>
                  <input
                    type="text"
                    value={editingTier.availabilityNote || ''}
                    onChange={(e) => setEditingTier({ ...editingTier, availabilityNote: e.target.value })}
                    placeholder="e.g. Reserving Fast for October Harvest"
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-stone-200 font-sans focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Estimated Packaged Weight</label>
                  <input
                    type="text"
                    value={editingTier.weightLbs}
                    onChange={(e) => setEditingTier({ ...editingTier, weightLbs: e.target.value })}
                    required
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-amber-100 font-sans focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Freezer Requirements</label>
                  <input
                    type="text"
                    value={editingTier.freezerSpaceRequired}
                    onChange={(e) => setEditingTier({ ...editingTier, freezerSpaceRequired: e.target.value })}
                    required
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-amber-100 font-sans focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Best For / Customer Recommendation</label>
                <input
                  type="text"
                  value={editingTier.bestFor}
                  onChange={(e) => setEditingTier({ ...editingTier, bestFor: e.target.value })}
                  required
                  className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-amber-100 font-sans focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Product Photo URL</label>
                <input
                  type="text"
                  value={editingTier.image || ''}
                  onChange={(e) => setEditingTier({ ...editingTier, image: e.target.value })}
                  className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-amber-100 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-emerald-900/80">
                <button
                  type="button"
                  onClick={() => setEditingTier(null)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-serif rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-serif font-bold rounded-lg transition-all cursor-pointer shadow-lg"
                >
                  Save Product Information
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. PRICING MANAGEMENT & HISTORY COMPONENT
// ==========================================
export function PricingManagementSection() {
  const [contentStore, setContentStore] = useState(getClientContentStore());
  const [feesForm, setFeesForm] = useState<FeeStructure>(contentStore.fees);
  const [editingSharePrices, setEditingSharePrices] = useState<ShareTier[]>(contentStore.shareTiers);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeContentStore(() => {
      const latest = getClientContentStore();
      setContentStore({ ...latest });
      setFeesForm(latest.fees);
      setEditingSharePrices([...latest.shareTiers]);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdatePrice = (index: number, field: keyof ShareTier, val: any) => {
    const updated = [...editingSharePrices];
    updated[index] = { ...updated[index], [field]: val };
    setEditingSharePrices(updated);
  };

  const handleSaveAllPricing = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveShareTiersToStore(editingSharePrices, 'Admin Pricing Desk', adminNotes || 'Pricing updated via admin dashboard');
    await saveFeesToStore(feesForm, 'Admin Pricing Desk');

    setSaveSuccessMsg('All pricing, fees, and promotional discounts successfully updated across website, checkout, and AI chatbot!');
    setAdminNotes('');
    setTimeout(() => setSaveSuccessMsg(''), 6000);
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#0f2217] p-6 rounded-2xl border border-emerald-800/60 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-900/80 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-amber-100 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-amber-400" />
              <span>Pricing, Fees & Promotions Management</span>
            </h2>
            <p className="text-stone-300 text-xs font-light mt-1 max-w-3xl">
              Control Quarter Share, Half Share, Whole Share, Sampler rates, processing fees, delivery/shipping fees, and promotional discount codes. All price updates automatically take effect on product pages, checkout calculations, and customer AI responses without code changes.
            </p>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="p-4 bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 text-xs rounded-xl flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveAllPricing} className="space-y-6">
          {/* Beef Share Tier Price Control Matrix */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-bold text-amber-200 border-b border-emerald-900/60 pb-2 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Beef Share Core Rates & Deposits</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editingSharePrices.map((tier, idx) => (
                <div
                  key={tier.id}
                  className="bg-[#07110a] p-4 rounded-xl border border-emerald-800/80 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
                    <span className="font-serif font-bold text-amber-100 text-base">{tier.title}</span>
                    <span className="text-[10px] font-mono text-stone-400 bg-emerald-950 px-2 py-0.5 rounded">
                      ID: {tier.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-serif">
                    <div>
                      <label className="block text-amber-300 text-[11px] font-bold mb-1">Display Price Range</label>
                      <input
                        type="text"
                        value={tier.priceRange}
                        onChange={(e) => handleUpdatePrice(idx, 'priceRange', e.target.value)}
                        required
                        className="w-full bg-[#0c1a12] border border-emerald-800 rounded p-2 text-amber-200 font-mono font-bold focus:outline-none focus:border-amber-400 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 text-[11px] font-bold mb-1">Min Price ($)</label>
                      <input
                        type="number"
                        value={tier.minPrice}
                        onChange={(e) => handleUpdatePrice(idx, 'minPrice', Number(e.target.value))}
                        required
                        className="w-full bg-[#0c1a12] border border-emerald-800 rounded p-2 text-stone-200 font-mono focus:outline-none focus:border-amber-400 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 text-[11px] font-bold mb-1">Max Price ($)</label>
                      <input
                        type="number"
                        value={tier.maxPrice}
                        onChange={(e) => handleUpdatePrice(idx, 'maxPrice', Number(e.target.value))}
                        required
                        className="w-full bg-[#0c1a12] border border-emerald-800 rounded p-2 text-stone-200 font-mono focus:outline-none focus:border-amber-400 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-serif">
                    <div>
                      <label className="block text-emerald-300 text-[11px] font-bold mb-1">Deposit Amount ($)</label>
                      <input
                        type="number"
                        value={tier.depositAmount}
                        onChange={(e) => handleUpdatePrice(idx, 'depositAmount', Number(e.target.value))}
                        required
                        className="w-full bg-[#0c1a12] border border-emerald-800 rounded p-2 text-emerald-300 font-mono font-bold focus:outline-none focus:border-amber-400 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 text-[11px] font-bold mb-1">Availability Status</label>
                      <select
                        value={tier.availabilityStatus || 'In Stock'}
                        onChange={(e) => handleUpdatePrice(idx, 'availabilityStatus', e.target.value)}
                        className="w-full bg-[#0c1a12] border border-emerald-800 rounded p-2 text-amber-100 focus:outline-none focus:border-amber-400 text-xs font-sans"
                      >
                        <option value="In Stock">In Stock</option>
                        <option value="Limited Allocation">Limited Allocation</option>
                        <option value="Pre-Order">Pre-Order</option>
                        <option value="Sold Out">Sold Out</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Processing, Delivery & Promotional Fee Structure */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-bold text-amber-200 border-b border-emerald-900/60 pb-2 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Processing, Delivery & Promotional Discount Configuration</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-serif">
              <div className="bg-[#07110a] p-4 rounded-xl border border-emerald-800/80 space-y-2">
                <label className="block font-bold text-stone-200">Processing Fee ($)</label>
                <input
                  type="number"
                  value={feesForm.processingFee}
                  onChange={(e) => setFeesForm({ ...feesForm, processingFee: Number(e.target.value) })}
                  className="w-full bg-[#0c1a12] border border-emerald-800 rounded p-2 text-amber-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  value={feesForm.processingFeeNote}
                  onChange={(e) => setFeesForm({ ...feesForm, processingFeeNote: e.target.value })}
                  placeholder="Processing Note"
                  className="w-full bg-[#0c1a12] border border-emerald-800 rounded p-2 text-stone-300 text-[11px] focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="bg-[#07110a] p-4 rounded-xl border border-emerald-800/80 space-y-2">
                <label className="block font-bold text-stone-200">Local Phoenix Delivery Fee ($)</label>
                <input
                  type="number"
                  value={feesForm.localDeliveryFee}
                  onChange={(e) => setFeesForm({ ...feesForm, localDeliveryFee: Number(e.target.value) })}
                  className="w-full bg-[#0c1a12] border border-emerald-800 rounded p-2 text-amber-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  value={feesForm.localDeliveryFeeNote}
                  onChange={(e) => setFeesForm({ ...feesForm, localDeliveryFeeNote: e.target.value })}
                  placeholder="Local Delivery Note"
                  className="w-full bg-[#0c1a12] border border-emerald-800 rounded p-2 text-stone-300 text-[11px] focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="bg-[#07110a] p-4 rounded-xl border border-emerald-800/80 space-y-2">
                <label className="block font-bold text-stone-200">Nationwide Express Shipping ($)</label>
                <input
                  type="number"
                  value={feesForm.nationwideShippingFee}
                  onChange={(e) => setFeesForm({ ...feesForm, nationwideShippingFee: Number(e.target.value) })}
                  className="w-full bg-[#0c1a12] border border-emerald-800 rounded p-2 text-amber-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  value={feesForm.nationwideShippingFeeNote}
                  onChange={(e) => setFeesForm({ ...feesForm, nationwideShippingFeeNote: e.target.value })}
                  placeholder="Shipping Note"
                  className="w-full bg-[#0c1a12] border border-emerald-800 rounded p-2 text-stone-300 text-[11px] focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Promotional Pricing Box */}
            <div className="bg-[#07110a] p-4 rounded-xl border border-amber-500/40 space-y-3 text-xs font-serif">
              <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-amber-200">Active Promotional Discount Banner</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-stone-300 font-mono">
                  <input
                    type="checkbox"
                    checked={feesForm.promotionalActive}
                    onChange={(e) => setFeesForm({ ...feesForm, promotionalActive: e.target.checked })}
                    className="rounded border-emerald-800 text-amber-400 focus:ring-amber-400"
                  />
                  <span>Enable Promotion Banner</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Promo Code</label>
                  <input
                    type="text"
                    value={feesForm.promotionalCode || ''}
                    onChange={(e) => setFeesForm({ ...feesForm, promotionalCode: e.target.value })}
                    placeholder="HARVEST2026"
                    className="w-full bg-[#0c1a12] border border-emerald-800 rounded p-2 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Deposit Discount ($)</label>
                  <input
                    type="number"
                    value={feesForm.promotionalDiscountAmount || 0}
                    onChange={(e) => setFeesForm({ ...feesForm, promotionalDiscountAmount: Number(e.target.value) })}
                    className="w-full bg-[#0c1a12] border border-emerald-800 rounded p-2 text-emerald-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Promotional Banner Announcement</label>
                  <input
                    type="text"
                    value={feesForm.promotionalBannerText || ''}
                    onChange={(e) => setFeesForm({ ...feesForm, promotionalBannerText: e.target.value })}
                    placeholder="Fall Harvest Special: Save $50 on deposit!"
                    className="w-full bg-[#0c1a12] border border-emerald-800 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-stone-300 font-serif text-xs font-bold">Admin Change Note (Logged to Timestamped History)</label>
            <input
              type="text"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Adjusted Fall 2026 Quarter Share deposit and local delivery rates"
              className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-stone-200 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-serif text-sm font-bold rounded-xl transition-all shadow-xl cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-950" />
              <span>Publish Price & Fee Updates Everywhere</span>
            </button>
          </div>
        </form>
      </div>

      {/* Timestamped Pricing History Log */}
      <div className="bg-[#0f2217] p-6 rounded-2xl border border-emerald-800/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-900/80 pb-3">
          <h3 className="font-serif text-xl font-bold text-amber-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Timestamped Audit History of Pricing Changes</span>
          </h3>
          <span className="text-xs font-mono text-stone-400">
            {contentStore.priceHistory.length} Total Logs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#07110a] text-amber-300 font-serif uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 border-b border-emerald-900">Timestamp</th>
                <th className="p-3 border-b border-emerald-900">Product / Item</th>
                <th className="p-3 border-b border-emerald-900">Previous Rate</th>
                <th className="p-3 border-b border-emerald-900">Updated Rate</th>
                <th className="p-3 border-b border-emerald-900">Modified By</th>
                <th className="p-3 border-b border-emerald-900">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/60 text-stone-300 font-mono">
              {contentStore.priceHistory.map((log) => (
                <tr key={log.id} className="hover:bg-[#12281b] transition-colors">
                  <td className="p-3 text-stone-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 font-serif font-bold text-amber-100">{log.itemTitle}</td>
                  <td className="p-3 text-stone-400">{log.oldPrice}</td>
                  <td className="p-3 text-emerald-300 font-bold">{log.newPrice}</td>
                  <td className="p-3 text-stone-300">{log.updatedBy}</td>
                  <td className="p-3 text-stone-400 text-[11px] italic">{log.notes || 'No note'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. PHOTO MANAGEMENT COMPONENT
// ==========================================
export function PhotoManagementSection() {
  const [contentStore, setContentStore] = useState(getClientContentStore());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [replaceModalOpen, setReplaceModalOpen] = useState<ManagedPhoto | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Upload Photo Form State
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState<PhotoCategoryKey>('beef_cuts');
  const [newPhotoDescription, setNewPhotoDescription] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetSection, setTargetSection] = useState('gallery');
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Replace Photo Form State
  const [replaceUrl, setReplaceUrl] = useState('');
  const [replaceFile, setReplaceFile] = useState<File | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeContentStore(() => {
      setContentStore({ ...getClientContentStore() });
    });
    return () => unsubscribe();
  }, []);

  // Image optimization / canvas compressor to base64
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200; // Resize to max 1200px width/height for fast web loading

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85); // 85% JPEG quality web optimization
            resolve(compressed);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setIsProcessingFile(true);
      try {
        const optimized = await processImageFile(file);
        setNewPhotoUrl(optimized);
      } catch (err) {
        console.error('Image compression error:', err);
      } finally {
        setIsProcessingFile(false);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl) return;

    await addPhotoToStore({
      title: newPhotoTitle || 'New Beef Photo',
      category: newPhotoCategory,
      imageUrl: newPhotoUrl,
      description: newPhotoDescription,
      targetSection,
    });

    setSaveSuccessMsg(`Photo "${newPhotoTitle || 'New Beef Photo'}" uploaded and published across website!`);
    setUploadModalOpen(false);
    setNewPhotoTitle('');
    setNewPhotoUrl('');
    setNewPhotoDescription('');
    setSelectedFile(null);

    setTimeout(() => setSaveSuccessMsg(''), 5000);
  };

  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceModalOpen || !replaceUrl) return;

    await replacePhotoInStore(replaceModalOpen.id, replaceUrl);

    setSaveSuccessMsg(`Photo "${replaceModalOpen.title}" successfully replaced!`);
    setReplaceModalOpen(null);
    setReplaceUrl('');
    setReplaceFile(null);

    setTimeout(() => setSaveSuccessMsg(''), 5000);
  };

  const handleDeletePhoto = async (photoId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await deletePhotoFromStore(photoId);
      setSaveSuccessMsg(`Photo "${title}" removed.`);
      setTimeout(() => setSaveSuccessMsg(''), 5000);
    }
  };

  const filteredPhotos =
    selectedCategory === 'all'
      ? contentStore.photos
      : contentStore.photos.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="bg-[#0f2217] p-6 rounded-2xl border border-emerald-800/60 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-900/80 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-amber-100 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-amber-400" />
              <span>Photo & Visual Asset Management</span>
            </h2>
            <p className="text-stone-300 text-xs font-light mt-1 max-w-3xl">
              Upload, replace, and categorize photos across all 12 official categories without editing code. Uploaded images are automatically optimized for fast web loading and displayed across website sections.
            </p>
          </div>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-serif text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Photo</span>
          </button>
        </div>

        {saveSuccessMsg && (
          <div className="p-4 bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 text-xs rounded-xl flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Categories Bar */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase text-amber-300 tracking-wider block">
            Filter by Official Photo Category ({PHOTO_CATEGORY_OPTIONS.length} Categories):
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow'
                  : 'bg-[#07110a] text-stone-300 hover:text-white border border-emerald-800/60'
              }`}
            >
              All Photos ({contentStore.photos.length})
            </button>
            {PHOTO_CATEGORY_OPTIONS.map((cat) => {
              const count = contentStore.photos.filter((p) => p.category === cat.key).length;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-serif transition-all cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-amber-400 text-emerald-950 font-bold shadow'
                      : 'bg-[#07110a] text-stone-300 hover:text-white border border-emerald-800/60'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="bg-[#07110a] rounded-xl border border-emerald-800/60 overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-md group"
            >
              <div>
                <div className="w-full h-44 overflow-hidden relative border-b border-emerald-900/80">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-black/80 text-amber-300 border border-amber-500/40 shadow">
                    {photo.categoryLabel}
                  </span>
                </div>
                <div className="p-3.5 space-y-1.5">
                  <h4 className="font-serif text-sm font-bold text-amber-100 line-clamp-1">
                    {photo.title}
                  </h4>
                  <p className="text-[#a8b8ad] text-[11px] font-light line-clamp-2">
                    {photo.description || 'No description provided.'}
                  </p>
                  <span className="text-[10px] text-stone-400 font-mono block">
                    Updated: {new Date(photo.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#0a180f] border-t border-emerald-900/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setReplaceModalOpen(photo);
                    setReplaceUrl(photo.imageUrl);
                  }}
                  className="px-2.5 py-1.5 bg-[#12281c] hover:bg-[#183424] text-amber-300 text-[11px] font-serif rounded border border-emerald-700/60 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-amber-400" />
                  <span>Replace Image</span>
                </button>
                <button
                  onClick={() => handleDeletePhoto(photo.id, photo.title)}
                  className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-[11px] font-serif rounded border border-rose-800/50 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Photo Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0f2217] border border-amber-500/50 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-emerald-900/80 pb-3">
              <h3 className="font-serif text-xl font-bold text-amber-200 flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-400" />
                <span>Upload & Publish New Website Photo</span>
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-stone-400 hover:text-white text-sm font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-serif">
              <div>
                <label className="block text-stone-300 font-bold mb-1">Photo Title / Caption</label>
                <input
                  type="text"
                  value={newPhotoTitle}
                  onChange={(e) => setNewPhotoTitle(e.target.value)}
                  placeholder="e.g. Dry-Aged Bone-In Prime Ribeye"
                  required
                  className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-amber-100 font-sans focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Photo Category (Required)</label>
                <select
                  value={newPhotoCategory}
                  onChange={(e) => setNewPhotoCategory(e.target.value as PhotoCategoryKey)}
                  className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-amber-200 font-sans focus:outline-none focus:border-amber-400"
                >
                  {PHOTO_CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Upload Local Image File (Auto-Optimized)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2 text-stone-300 font-mono text-xs focus:outline-none focus:border-amber-400 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-amber-400 file:text-emerald-950 file:font-serif file:font-bold"
                />
                {isProcessingFile && (
                  <span className="text-[10px] text-amber-400 font-mono block mt-1 animate-pulse">
                    Optimizing & compressing image for web speed...
                  </span>
                )}
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">OR Enter Image URL Direct Link</label>
                <input
                  type="text"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="/images/bastanzi_ribeye_slate_1785838381086.jpg"
                  className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-amber-100 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {newPhotoUrl && (
                <div className="w-full h-36 overflow-hidden rounded-lg border border-emerald-800/80">
                  <img src={newPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-stone-300 font-bold mb-1">Description / Details</label>
                <textarea
                  value={newPhotoDescription}
                  onChange={(e) => setNewPhotoDescription(e.target.value)}
                  rows={2}
                  placeholder="Describe marbling, aging, pasture raising, or cut type..."
                  className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-stone-200 font-sans focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-emerald-900/80">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-serif rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPhotoUrl || isProcessingFile}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-emerald-950 font-serif font-bold rounded-lg transition-all cursor-pointer shadow-lg"
                >
                  Upload & Publish Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Replace Photo Modal */}
      {replaceModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0f2217] border border-amber-500/50 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-emerald-900/80 pb-3">
              <h3 className="font-serif text-xl font-bold text-amber-200 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-400" />
                <span>Replace "{replaceModalOpen.title}"</span>
              </h3>
              <button
                onClick={() => setReplaceModalOpen(null)}
                className="text-stone-400 hover:text-white text-sm font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} className="space-y-4 text-xs font-serif">
              <div>
                <label className="block text-stone-300 font-bold mb-1">Select New Replacement Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const compressed = await processImageFile(e.target.files[0]);
                      setReplaceUrl(compressed);
                    }
                  }}
                  className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2 text-stone-300 font-mono text-xs focus:outline-none focus:border-amber-400 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-amber-400 file:text-emerald-950 file:font-serif file:font-bold"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">OR Enter Replacement Image URL</label>
                <input
                  type="text"
                  value={replaceUrl}
                  onChange={(e) => setReplaceUrl(e.target.value)}
                  className="w-full bg-[#07110a] border border-emerald-800 rounded-lg p-2.5 text-amber-100 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {replaceUrl && (
                <div className="w-full h-40 overflow-hidden rounded-lg border border-emerald-800/80">
                  <img src={replaceUrl} alt="Replacement Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-emerald-900/80">
                <button
                  type="button"
                  onClick={() => setReplaceModalOpen(null)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-serif rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!replaceUrl}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-emerald-950 font-serif font-bold rounded-lg transition-all cursor-pointer shadow-lg"
                >
                  Save Replacement Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
