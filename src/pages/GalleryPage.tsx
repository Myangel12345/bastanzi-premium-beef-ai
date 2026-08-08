import { useState, useEffect } from 'react';
import { GALLERY_ITEMS } from '../data/content';
import { GalleryItem } from '../types';
import { getClientContentStore, subscribeContentStore } from '../lib/contentStore';
import { Maximize2, X, Sparkles } from 'lucide-react';
import SeoHead from '../components/SeoHead';

export default function GalleryPage() {
  const [contentStore, setContentStore] = useState(getClientContentStore());
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeContentStore(() => {
      setContentStore({ ...getClientContentStore() });
    });
    return () => unsubscribe();
  }, []);

  // Merge static gallery items with admin-managed photos
  const managedGalleryItems: GalleryItem[] = contentStore.photos.map((p) => ({
    id: p.id,
    title: p.title,
    category:
      p.category.includes('ranch') || p.category.includes('marketing')
        ? 'ranch'
        : p.category.includes('packaging') || p.category.includes('vacuum')
        ? 'packaging'
        : p.category.includes('butcher')
        ? 'culinary'
        : 'cuts',
    categoryLabel: p.categoryLabel,
    imageUrl: p.imageUrl,
    description: p.description,
  }));

  const allItems = [...managedGalleryItems, ...GALLERY_ITEMS];

  const filteredItems =
    activeCategory === 'all'
      ? allItems
      : allItems.filter((item) => item.category === activeCategory);

  return (
    <div className="bg-[#0a180f] text-[#f7f2e8] min-h-screen pb-20">
      <SeoHead
        title="Photo Gallery | Bastanzi Premium Beef Co. Ranch & Prime Cuts"
        description="High-resolution photos of our ranch pastures, Black Angus cattle, 21-day dry aged prime ribeyes, and custom beef share packaging."
      />

      {/* Page Header */}
      <section className="py-16 bg-[#0c1a12] border-b border-emerald-900/60 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest bg-emerald-900/60 px-3 py-1 rounded-full border border-amber-500/30">
            VISUAL HERITAGE
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">
            The Bastanzi Photo Gallery
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto font-light">
            Step behind the scenes at our ranch. Explore our pastures, dry-aging chambers, master butcher cuts, and luxury share packaging.
          </p>
        </div>
      </section>

      {/* Category Tabs & Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-emerald-900/60 pb-6">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-serif transition-all ${
              activeCategory === 'all'
                ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            All Photos ({GALLERY_ITEMS.length})
          </button>
          <button
            onClick={() => setActiveCategory('ranch')}
            className={`px-4 py-2 rounded-full text-xs font-serif transition-all ${
              activeCategory === 'ranch'
                ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Our Ranch & Herd
          </button>
          <button
            onClick={() => setActiveCategory('cuts')}
            className={`px-4 py-2 rounded-full text-xs font-serif transition-all ${
              activeCategory === 'cuts'
                ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Prime Beef Cuts
          </button>
          <button
            onClick={() => setActiveCategory('culinary')}
            className={`px-4 py-2 rounded-full text-xs font-serif transition-all ${
              activeCategory === 'culinary'
                ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Culinary Creations
          </button>
          <button
            onClick={() => setActiveCategory('packaging')}
            className={`px-4 py-2 rounded-full text-xs font-serif transition-all ${
              activeCategory === 'packaging'
                ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Share Packaging
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 hover:border-amber-500/40 transition-all cursor-pointer group shadow-xl"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-zinc-900">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div className="flex items-center justify-between w-full text-amber-200">
                    <span className="text-xs font-serif font-bold">{item.title}</span>
                    <Maximize2 className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-amber-500/30 text-[10px] text-amber-300 font-mono">
                  {item.categoryLabel}
                </div>
              </div>
              <div className="p-3 bg-zinc-900/80">
                <h3 className="font-serif text-sm font-bold text-amber-100">{item.title}</h3>
                <p className="text-zinc-400 text-xs mt-1 line-clamp-2">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-amber-500/40 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative text-white"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/70 rounded-full text-zinc-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-16/9 bg-black">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-6 bg-zinc-950 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-mono uppercase">
                  {selectedImage.categoryLabel}
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-amber-100">{selectedImage.title}</h3>
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">{selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
