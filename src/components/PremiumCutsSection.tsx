import { useState, useEffect } from 'react';
import { Sparkles, Flame, Check } from 'lucide-react';
import { BRAND_IMAGES } from '../data/content';
import { getClientContentStore, subscribeContentStore } from '../lib/contentStore';

export default function PremiumCutsSection() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'steaks' | 'roasts' | 'ground'>('all');
  const [contentStore, setContentStore] = useState(getClientContentStore());

  useEffect(() => {
    const unsubscribe = subscribeContentStore(() => {
      setContentStore({ ...getClientContentStore() });
    });
    return () => unsubscribe();
  }, []);

  const baseCuts = [
    {
      id: 'cut-1',
      name: 'USDA-Quality Ribeye Steak',
      category: 'steaks',
      cutCategoryKey: 'ribeye',
      thickness: '1.25" – 1.5" Thick Cut',
      priceNotice: 'Contact us for pricing',
      marbling: 'High Intramuscular Marbling',
      cooking: 'High-Heat Cast Iron Sear / Grilling',
      description: 'Rich, juicy ribeye featuring intricate marbling streaks dry-aged for 21 days for maximum steakhouse tenderness.',
      defaultImageUrl: '/images/bastanzi_ribeye_slate_1785838381086.jpg',
      shareInclusion: 'Full, Half, Quarter & Eighth Shares',
    },
    {
      id: 'cut-2',
      name: 'New York Strip Steak & T-Bone',
      category: 'steaks',
      cutCategoryKey: 'beef_cuts',
      thickness: '1.25" Thick Cut',
      priceNotice: 'Contact us for pricing',
      marbling: 'Bold Edge Fat Cap & Dense Marbling',
      cooking: 'Pan Seared with Garlic Butter & Herbs',
      description: 'Classic steakhouse cut offering robust beef flavor, tight grain texture, and a flavorful outer fat ribbon.',
      defaultImageUrl: '/images/bastanzi_meat_display_1785838215157.jpg',
      shareInclusion: 'Full, Half, Quarter & Eighth Shares',
    },
    {
      id: 'cut-3',
      name: 'Center-Cut Filet Mignon',
      category: 'steaks',
      cutCategoryKey: 'filet_mignon',
      thickness: '1.5" – 2" Center Cut',
      priceNotice: 'Contact us for pricing',
      marbling: 'Ultra-Lean & Extremely Tender',
      cooking: 'Reverse Sear / Butter Basted',
      description: 'The most tender muscle on the animal. Melt-in-your-mouth texture with delicate butter notes.',
      defaultImageUrl: '/images/bastanzi_filet_mignon_1785838437969.jpg',
      shareInclusion: 'Full, Half & Quarter Shares',
    },
    {
      id: 'cut-4',
      name: 'Top Sirloin & Skirt Steak',
      category: 'steaks',
      cutCategoryKey: 'beef_cuts',
      thickness: '1" – 1.25" Thick Cut',
      priceNotice: 'Contact us for pricing',
      marbling: 'Lean & Mineral-Rich',
      cooking: 'Grilling / Broiling / Kabobs',
      description: 'Versatile, juicy top sirloin and skirt steaks packed with intense beef flavor and clean finishing notes.',
      defaultImageUrl: '/images/bastanzi_skirt_strips_1785838348308.jpg',
      shareInclusion: 'Full, Half, Quarter & Eighth Shares',
    },
    {
      id: 'cut-5',
      name: 'Full Packer Brisket & Strip Roast',
      category: 'roasts',
      cutCategoryKey: 'brisket',
      thickness: '10 – 14 lbs Whole Packer',
      priceNotice: 'Contact us for pricing',
      marbling: 'Complete Flat & Point Fat Cap',
      cooking: 'Low & Slow Wood Smoking (225°F)',
      description: 'Un-trimmed whole packer brisket and roasts with thick fat cap ready for pitmasters and long weekend smokes.',
      defaultImageUrl: '/images/bastanzi_boxed_roasts_1785838239509.jpg',
      shareInclusion: 'Full & Half Shares (Optional Quarter)',
    },
    {
      id: 'cut-6',
      name: 'Chuck Roast & English Short Ribs',
      category: 'roasts',
      cutCategoryKey: 'short_ribs',
      thickness: 'Thick Bone-In Racks',
      priceNotice: 'Contact us for pricing',
      marbling: 'High Collagen & Deep Marbling',
      cooking: 'Red Wine Braise / Smoked Beef Ribs',
      description: 'Meaty bone-in short rib racks and chuck roasts that become incredibly rich and tender when slow-braised.',
      defaultImageUrl: '/images/bastanzi_english_shortribs_1785838367019.jpg',
      shareInclusion: 'Full, Half & Quarter Shares',
    },
    {
      id: 'cut-7',
      name: 'Artisan Stew Meat & Soup Bones',
      category: 'roasts',
      cutCategoryKey: 'chuck_roast',
      thickness: '3 – 4 lbs Portion',
      priceNotice: 'Contact us for pricing',
      marbling: 'Deep Intermuscular Fat & Marrow',
      cooking: 'Braising / Dutch Oven Stew & Broth',
      description: 'Hand-trimmed beef stew cubes and nutrient-rich marrow soup bones for rich beef broth.',
      defaultImageUrl: '/images/bastanzi_stew_cubes_1785838393915.jpg',
      shareInclusion: 'Full, Half, Quarter & Eighth Shares',
    },
    {
      id: 'cut-8',
      name: 'Gourmet Ground Beef (80/20 & 90/10)',
      category: 'ground',
      cutCategoryKey: 'ground_beef',
      thickness: '1 lb Flash-Frozen Vacuum Chubs',
      priceNotice: 'Contact us for pricing',
      marbling: 'Pure Muscle & Clean Fat Blend',
      cooking: 'Smash Burgers / Meatballs / Tacos',
      description: 'Single-source artisan ground beef ground from whole muscle trimmings with zero additives or fillers.',
      defaultImageUrl: '/images/bastanzi_countertop_boxes_1785838324488.jpg',
      shareInclusion: 'All Beef Shares (Approx 45-50% of Total Weight)',
    },
  ];

  // Map dynamic uploaded photos to cut cards
  const cutsData = baseCuts.map((cut) => {
    // Check if store has a photo matching the cut category key or cut title
    const matchingPhoto = contentStore.photos.find(
      (p) =>
        p.category === cut.cutCategoryKey ||
        p.title.toLowerCase().includes(cut.name.toLowerCase().split(' ')[0]) ||
        p.description.toLowerCase().includes(cut.name.toLowerCase().split(' ')[0])
    );
    return {
      ...cut,
      imageUrl: matchingPhoto ? matchingPhoto.imageUrl : cut.defaultImageUrl,
    };
  });

  const filteredCuts = activeCategory === 'all' 
    ? cutsData 
    : cutsData.filter(c => c.category === activeCategory);

  return (
    <section className="py-20 bg-[#0c1a12] text-[#f7f2e8] relative overflow-hidden border-b border-emerald-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Master Butcher Portfolio</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-amber-100">
            Premium Beef Cuts Guide
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
            Every Bastanzi beef share includes a balanced assortment of dry-aged steaks, slow-cooking roasts, and gourmet ground beef.
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {[
              { id: 'all', label: 'All Premium Cuts' },
              { id: 'steaks', label: 'Prime Steaks' },
              { id: 'roasts', label: 'Roasts & Brisket' },
              { id: 'ground', label: 'Gourmet Ground' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-5 py-2 rounded-xl text-xs font-serif transition-all duration-200 ${
                  activeCategory === tab.id
                    ? 'bg-amber-500 text-emerald-950 font-bold shadow-md'
                    : 'bg-[#14281d] text-stone-300 border border-emerald-800/40 hover:border-amber-500/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cuts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCuts.map(cut => (
            <div
              key={cut.id}
              className="bg-[#12241a] border border-emerald-800/40 hover:border-amber-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl group"
            >
              <div>
                <div className="relative aspect-4/3 overflow-hidden bg-emerald-950">
                  <img
                    src={cut.imageUrl}
                    alt={cut.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-950/90 backdrop-blur-md border border-amber-500/30 px-2.5 py-1 rounded-lg text-[10px] font-mono text-amber-300">
                    {cut.thickness}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif text-lg font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                      {cut.name}
                    </h3>
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-medium">
                    {cut.priceNotice}
                  </div>
                  <p className="text-stone-300 text-xs leading-relaxed font-light">
                    {cut.description}
                  </p>

                  <div className="pt-2 space-y-1.5 border-t border-emerald-900/60 text-[11px]">
                    <div className="flex items-center gap-1.5 text-stone-300">
                      <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-medium text-amber-200/90">Best Cook:</span> {cut.cooking}
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-400">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{cut.shareInclusion}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
