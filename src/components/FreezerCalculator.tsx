import { useState } from 'react';
import { Package, Check, Sparkles } from 'lucide-react';
import { BEEF_SHARE_TIERS } from '../data/content';
import { ShareSize } from '../types';

interface FreezerCalculatorProps {
  onSelectShare?: (shareSize: ShareSize) => void;
}

export default function FreezerCalculator({ onSelectShare }: FreezerCalculatorProps) {
  const [householdSize, setHouseholdSize] = useState<number>(4);
  const [meatFrequency, setMeatFrequency] = useState<'high' | 'medium' | 'low'>('medium');

  // Estimate annual beef consumption (lbs)
  // Low = 25 lbs/person/yr, Medium = 50 lbs/person/yr, High = 85 lbs/person/yr
  const multiplier = meatFrequency === 'high' ? 85 : meatFrequency === 'medium' ? 50 : 25;
  const estimatedAnnualLbs = householdSize * multiplier;

  // Recommended Share
  let recommendedSize: ShareSize = 'Half';
  if (estimatedAnnualLbs >= 350) recommendedSize = 'Full';
  else if (estimatedAnnualLbs >= 160) recommendedSize = 'Half';
  else if (estimatedAnnualLbs >= 80) recommendedSize = 'Quarter';
  else recommendedSize = 'Eighth';

  const selectedTier = BEEF_SHARE_TIERS.find((t) => t.id === recommendedSize)!;

  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-amber-500/30 rounded-2xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-serif text-xl font-bold text-amber-200">Interactive Freezer Space Estimator</h3>
          <p className="text-xs text-zinc-400">Calculate how much freezer space you need & find your ideal Bastanzi Share.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2 font-serif">
              <span className="text-zinc-300">People in Household:</span>
              <span className="text-amber-400 font-bold font-mono text-base">{householdSize} People</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              value={householdSize}
              onChange={(e) => setHouseholdSize(Number(e.target.value))}
              className="w-full accent-amber-400 bg-zinc-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
              <span>1 Person</span>
              <span>4 Family</span>
              <span>8+ Large Household</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-serif text-zinc-300 block mb-2">Beef Meal Frequency:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMeatFrequency('low')}
                className={`py-2 px-3 rounded-lg text-xs font-serif transition-all border ${
                  meatFrequency === 'low'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                1-2x / week
              </button>
              <button
                type="button"
                onClick={() => setMeatFrequency('medium')}
                className={`py-2 px-3 rounded-lg text-xs font-serif transition-all border ${
                  meatFrequency === 'medium'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                3-4x / week
              </button>
              <button
                type="button"
                onClick={() => setMeatFrequency('high')}
                className={`py-2 px-3 rounded-lg text-xs font-serif transition-all border ${
                  meatFrequency === 'high'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                Daily Beef
              </button>
            </div>
          </div>

          <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Est. Annual Beef Needs:</span>
              <span className="text-white font-mono font-bold">{estimatedAnnualLbs} lbs / year</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Required Freezer Space:</span>
              <span className="text-amber-300 font-mono font-bold">{selectedTier.cubicFeet} Cu. Ft.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Estimated Meals Provided:</span>
              <span className="text-emerald-400 font-mono font-bold">~{selectedTier.approxMeals} Portions</span>
            </div>
          </div>
        </div>

        {/* Visual Freezer Box Representation */}
        <div className="lg:col-span-6 bg-zinc-950 p-6 rounded-xl border border-amber-500/20 flex flex-col items-center justify-center text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Recommended Match</span>
          </div>

          <h4 className="font-serif text-2xl font-bold text-gradient bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
            {selectedTier.title}
          </h4>
          <p className="text-xs text-amber-400 font-mono mt-0.5">{selectedTier.priceRange}</p>

          {/* Chest Freezer Graphical Diagram */}
          <div className="w-full max-w-xs my-5 p-4 bg-zinc-900 border-2 border-dashed border-amber-500/40 rounded-xl relative flex flex-col items-center justify-center gap-2">
            <div className="w-full h-24 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black rounded-lg border border-amber-500/30 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:12px_12px]" />
              <div className="z-10 text-center px-2">
                <span className="text-xs font-mono text-amber-300 font-bold block">{selectedTier.cubicFeet} CU. FT. FREEZER</span>
                <span className="text-[10px] text-zinc-400 block">{selectedTier.freezerSpaceRequired}</span>
              </div>
            </div>
            <span className="text-[11px] text-zinc-400 italic">
              {selectedTier.id === 'Eighth'
                ? 'Fits easily in standard kitchen refrigerator freezer!'
                : `Fits in a compact ${selectedTier.cubicFeet} cu. ft chest freezer.`}
            </span>
          </div>

          <p className="text-xs text-zinc-300 mb-4 px-2">
            {selectedTier.bestFor}
          </p>

          <button
            onClick={() => onSelectShare?.(selectedTier.id)}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-serif font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Reserve {selectedTier.title} (${selectedTier.depositAmount} Deposit)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
