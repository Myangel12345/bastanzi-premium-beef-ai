import { useState } from 'react';
import { GALLERY_ITEMS } from '../data/content';
import { GalleryItem } from '../types';
import { Maximize2, X, Sparkles } from 'lucide-react';
import SeoHead from '../components/SeoHead';

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const filteredItems =
    activeCategory === 'all'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen pb-20">
      <SeoHead
        title="Photo Gallery | Bastanzi Premium Beef Co. Ranch & Prime Cuts"
        description="High-resolution photos of our Montana ranch pastures, Black Angus cattle, 21-day dry aged prime ribeyes, and custom beef share packaging."
      />

      {/* Page Header */}
      <section className="py-16 bg-[#111111] border-b border-[#C5A028]/20 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-3">
          <span className="text-[10px] font-mono text-[#C5A028] uppercase tracking-[0.3em] bg-[#C5A028]/10 px-3 py-1 border border-[#C5A028]/30 inline-block">
            VISUAL HERITAGE
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
            The Bastanzi Photo Gallery
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Step behind the scenes at our Montana ranch. Explore our pastures, dry-aging chambers, master butcher cuts, and luxury share packaging.
          </p>
        </div>
      </section>

      {/* Category Tabs & Grid */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 space-y-8">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-[#C5A028]/20 pb-6">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 text-xs uppercase tracking-widest transition-all ${
              activeCategory === 'all'
                ? 'bg-[#C5A028] text-black font-bold'
                : 'bg-[#111111] text-zinc-400 hover:text-white border border-[#C5A028]/20'
            }`}
          >
            All Photos ({GALLERY_ITEMS.length})
          </button>
          <button
            onClick={() => setActiveCategory('ranch')}
            className={`px-4 py-2 text-xs uppercase tracking-widest transition-all ${
              activeCategory === 'ranch'
                ? 'bg-[#C5A028] text-black font-bold'
                : 'bg-[#111111] text-zinc-400 hover:text-white border border-[#C5A028]/20'
            }`}
          >
            Our Ranch & Herd
          </button>
          <button
            onClick={() => setActiveCategory('cuts')}
            className={`px-4 py-2 text-xs uppercase tracking-widest transition-all ${
              activeCategory === 'cuts'
                ? 'bg-[#C5A028] text-black font-bold'
                : 'bg-[#111111] text-zinc-400 hover:text-white border border-[#C5A028]/20'
            }`}
          >
            Prime Beef Cuts
          </button>
          <button
            onClick={() => setActiveCategory('culinary')}
            className={`px-4 py-2 text-xs uppercase tracking-widest transition-all ${
              activeCategory === 'culinary'
                ? 'bg-[#C5A028] text-black font-bold'
                : 'bg-[#111111] text-zinc-400 hover:text-white border border-[#C5A028]/20'
            }`}
          >
            Culinary Creations
          </button>
          <button
            onClick={() => setActiveCategory('packaging')}
            className={`px-4 py-2 text-xs uppercase tracking-widest transition-all ${
              activeCategory === 'packaging'
                ? 'bg-[#C5A028] text-black font-bold'
                : 'bg-[#111111] text-zinc-400 hover:text-white border border-[#C5A028]/20'
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
              className="bg-[#111111] border border-[#C5A028]/20 hover:border-[#C5A028] transition-all cursor-pointer group shadow-xl overflow-hidden"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-[#0a0a0a]">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div className="flex items-center justify-between w-full text-amber-200">
                    <span className="text-xs font-serif font-bold">{item.title}</span>
                    <Maximize2 className="w-4 h-4 text-[#C5A028]" />
                  </div>
                </div>
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 border border-[#C5A028]/30 text-[9px] text-[#C5A028] font-mono uppercase tracking-widest">
                  {item.categoryLabel}
                </div>
              </div>
              <div className="p-3 bg-[#111111]">
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
            className="bg-[#111111] border border-[#C5A028]/40 max-w-3xl w-full overflow-hidden shadow-2xl relative text-white"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/70 text-zinc-300 hover:text-white"
            >
              <X className="w-5 h-5 text-[#C5A028]" />
            </button>

            <div className="relative aspect-16/9 bg-black">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-6 bg-[#0a0a0a] space-y-2 border-t border-[#C5A028]/20">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#C5A028]/10 text-[#C5A028] border border-[#C5A028]/30 text-[10px] font-mono uppercase tracking-widest">
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
