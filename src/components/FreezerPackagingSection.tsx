import { useState, useEffect } from 'react';
import { Box, Shield, Snowflake, Thermometer, CheckCircle2 } from 'lucide-react';
import { BRAND_IMAGES } from '../data/content';
import { getClientContentStore, subscribeContentStore } from '../lib/contentStore';
import FreezerCalculator from './FreezerCalculator';

export default function FreezerPackagingSection() {
  const [contentStore, setContentStore] = useState(getClientContentStore());

  useEffect(() => {
    const unsubscribe = subscribeContentStore(() => {
      setContentStore({ ...getClientContentStore() });
    });
    return () => unsubscribe();
  }, []);

  const packagingPhoto = contentStore.photos.find(
    (p) => p.targetSection === 'packaging' || p.category === 'vacuum_packaging'
  );
  const packagingImageUrl = packagingPhoto ? packagingPhoto.imageUrl : BRAND_IMAGES.beefShareBox;
  const packagingFeatures = [
    {
      icon: Shield,
      title: 'Commercial 5-Mil Vacuum Barriers',
      description: 'Puncture-resistant, oxygen-impermeable commercial sleeves lock out air and moisture completely, preventing freezer burn for up to 18 months.',
    },
    {
      icon: Snowflake,
      title: 'Flash-Frozen at -20°F',
      description: 'Cuts are sub-zero flash-frozen immediately following 21-day dry aging and trimming, preserving cellular integrity, tender juices, and color.',
    },
    {
      icon: Box,
      title: 'Clear Cut Labeling & Date Stamps',
      description: 'Every individual pouch is clearly labeled with exact cut name, thickness/weight, and butcher inspection code for easy meal planning.',
    },
    {
      icon: Thermometer,
      title: 'Insulated Eco-Cooler Delivery',
      description: 'Shipped in heavy insulated cooler boxes packed with dry ice, ensuring your order arrives rock-solid frozen to your doorstep.',
    },
  ];

  const shareCapacity = [
    {
      share: 'Eighth Share',
      weight: '50 – 55 lbs',
      cuFt: '1.5 – 2 cu. ft',
      freezerType: 'Fits inside standard kitchen fridge freezer',
      idealFor: 'Couples / Small households',
    },
    {
      share: 'Quarter Share',
      weight: '100 – 110 lbs',
      cuFt: '4.5 – 5 cu. ft',
      freezerType: 'Small chest freezer or upright freezer',
      idealFor: 'Families of 2–3',
    },
    {
      share: 'Half Share',
      weight: '200 – 220 lbs',
      cuFt: '8 – 9 cu. ft',
      freezerType: 'Medium chest freezer',
      idealFor: 'Families of 4–5',
    },
    {
      share: 'Full Share',
      weight: '400 – 440 lbs',
      cuFt: '16 – 18 cu. ft',
      freezerType: 'Large chest freezer',
      idealFor: 'Large families & share splitters',
    },
  ];

  return (
    <section className="py-20 bg-[#09140e] text-[#f7f2e8] relative overflow-hidden border-b border-emerald-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-widest uppercase">
            <Box className="w-3.5 h-3.5 text-amber-400" />
            <span>Artisan Protection</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-amber-100">
            Freezer-Ready Packaging & Storage
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
            Our heavy-duty vacuum sealing and sub-zero flash freezing technology guarantee your beef stays fresh, juicy, and freezer-burn free for over a year.
          </p>
        </div>

        {/* 2-Column Packaging Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-16">
          {/* Packaging Image Box */}
          <div className="relative rounded-2xl overflow-hidden border border-emerald-800/60 bg-[#12241a] shadow-2xl">
            <img
              src={packagingImageUrl}
              alt="Freezer Ready Beef Packages"
              className="w-full h-80 sm:h-[400px] object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-emerald-950/90 backdrop-blur-md rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-serif font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Commercial Flash-Frozen Guarantee</span>
              </div>
              <p className="text-stone-300 text-xs font-light">
                Individually portioned, labeled, and vacuum-sealed in 5mil barrier film for instant transfer into your home freezer.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="space-y-4">
            {packagingFeatures.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#102218] border border-emerald-800/40 hover:border-amber-500/40 p-5 rounded-2xl flex items-start gap-4 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-amber-100 mb-1">
                      {feat.title}
                    </h3>
                    <p className="text-stone-300 text-xs leading-relaxed font-light">
                      {feat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Capacity Table & Freezer Calculator */}
        <div className="bg-[#12241a] border border-emerald-800/50 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
          <div className="text-center sm:text-left space-y-2">
            <h3 className="font-serif text-2xl font-bold text-amber-100">
              Freezer Space Guide
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm font-light">
              Rule of thumb: 1 cubic foot of freezer space accommodates roughly 35 to 40 lbs of packaged beef.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {shareCapacity.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#0c1a12] border border-emerald-800/40 p-5 rounded-xl space-y-2"
              >
                <div className="text-amber-300 font-serif font-bold text-lg">
                  {item.share}
                </div>
                <div className="text-stone-200 text-sm font-mono font-medium">
                  {item.weight}
                </div>
                <div className="text-amber-400/90 text-xs font-mono">
                  Needs: {item.cuFt}
                </div>
                <div className="text-stone-300 text-xs border-t border-emerald-900/60 pt-2 font-light">
                  {item.freezerType}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Calculator Section */}
          <div className="pt-4 border-t border-emerald-900/60">
            <h4 className="font-serif text-lg font-bold text-amber-200 mb-4 text-center sm:text-left">
              Interactive Household Freezer Calculator
            </h4>
            <FreezerCalculator />
          </div>
        </div>
      </div>
    </section>
  );
}
