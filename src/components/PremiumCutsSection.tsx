import { useState } from 'react';
import { Sparkles, Flame, Check } from 'lucide-react';
import { BRAND_IMAGES } from '../data/content';

export default function PremiumCutsSection() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'steaks' | 'roasts' | 'ground'>('all');

  const cutsData = [
    {
      id: 'cut-1',
      name: 'USDA-Quality Ribeye Steak',
      category: 'steaks',
      thickness: '1.25" – 1.5" Thick Cut',
      marbling: 'High Intramuscular Marbling',
      cooking: 'High-Heat Cast Iron Sear / Grilling',
      description: 'Rich, juicy ribeye featuring intricate marbling streaks dry-aged for 21 days for maximum steakhouse tenderness.',
      imageUrl: '/src/assets/images/prime_ribeye_steaks_1785603143408.jpg',
      shareInclusion: 'Full, Half, Quarter & Eighth Shares',
    },
    {
      id: 'cut-2',
      name: 'New York Strip Steak / T-Bone',
      category: 'steaks',
      thickness: '1.25" Thick Cut',
      marbling: 'Bold Edge Fat Cap & Dense Marbling',
      cooking: 'Pan Seared with Garlic Butter & Herbs',
      description: 'Classic steakhouse cut offering robust beef flavor, tight grain texture, and a flavorful outer fat ribbon.',
      imageUrl: '/src/assets/images/tbone_porterhouse_1785603154311.jpg',
      shareInclusion: 'Full, Half, Quarter & Eighth Shares',
    },
    {
      id: 'cut-3',
      name: 'Center-Cut Filet Mignon',
      category: 'steaks',
      thickness: '1.5" – 2" Center Cut',
      marbling: 'Ultra-Lean & Extremely Tender',
      cooking: 'Reverse Sear / Butter Basted',
      description: 'The most tender muscle on the animal. Melt-in-your-mouth texture with delicate butter notes.',
      imageUrl: '/src/assets/images/filet_mignon_cuts_1785603211893.jpg',
      shareInclusion: 'Full, Half & Quarter Shares',
    },
    {
      id: 'cut-4',
      name: 'Top Sirloin & Skirt Steak',
      category: 'steaks',
      thickness: '1" – 1.25" Thick Cut',
      marbling: 'Lean & Mineral-Rich',
      cooking: 'Grilling / Broiling / Kabobs',
      description: 'Versatile, juicy top sirloin steaks packed with intense beef flavor and clean finishing notes.',
      imageUrl: '/src/assets/images/flank_skirt_strips_1785603222196.jpg',
      shareInclusion: 'Full, Half, Quarter & Eighth Shares',
    },
    {
      id: 'cut-5',
      name: 'Full Packer Brisket & Strip Roast',
      category: 'roasts',
      thickness: '10 – 14 lbs Whole Packer',
      marbling: 'Complete Flat & Point Fat Cap',
      cooking: 'Low & Slow Wood Smoking (225°F)',
      description: 'Un-trimmed whole packer roast with thick fat cap ready for pitmasters and long weekend smokes.',
      imageUrl: '/src/assets/images/strip_roast_1785603200463.jpg',
      shareInclusion: 'Full & Half Shares (Optional Quarter)',
    },
    {
      id: 'cut-6',
      name: 'Artisan Stew Beef Cubes',
      category: 'roasts',
      thickness: '3 – 4 lbs Portion',
      marbling: 'Deep Intermuscular Fat',
      cooking: 'Braising / Dutch Oven Stew',
      description: 'Hand-trimmed beef stew cubes that break down into fork-tender, melt-in-your-mouth pot roast and beef stew.',
      imageUrl: '/src/assets/images/artisan_stew_beef_1785603256501.jpg',
      shareInclusion: 'Full, Half, Quarter & Eighth Shares',
    },
    {
      id: 'cut-7',
      name: 'English Cut Short Ribs',
      category: 'roasts',
      thickness: 'Thick Bone-In Racks',
      marbling: 'High Collagen & Deep Marbling',
      cooking: 'Red Wine Braise / Smoked Beef Ribs',
      description: 'Meaty bone-in short rib racks that become incredibly rich and tender when slow-braised.',
      imageUrl: '/src/assets/images/english_short_ribs_1785603167290.jpg',
      shareInclusion: 'Full, Half & Quarter Shares',
    },
    {
      id: 'cut-8',
      name: '80/20 & 90/10 Gourmet Ground Beef',
      category: 'ground',
      thickness: '1 lb Flash-Frozen Vacuum Chubs',
      marbling: 'Pure Muscle & Clean Fat Blend',
      cooking: 'Smash Burgers / Meatballs / Tacos',
      description: 'Single-source artisan ground beef ground from whole muscle trimmings with zero additives or fillers.',
      imageUrl: '/src/assets/images/gourmet_ground_beef_1785603243471.jpg',
      shareInclusion: 'All Beef Shares (Approx 45-50% of Total Weight)',
    },
  ];

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
                  <h3 className="font-serif text-lg font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                    {cut.name}
                  </h3>
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
