import { useState } from 'react';
import { Package, Check, Sparkles } from 'lucide-react';
import { BEEF_SHARE_TIERS } from '../data/content';
import { ShareSize } from '../types';

interface FreezerCalculatorProps {
  onSelectShare: (shareSize: ShareSize) => void;
}

export default function FreezerCalculator({ onSelectShare }: FreezerCalculatorProps) {
  const [householdSize, setHouseholdSize] = useState<number>(4);
  const [meatFrequency, setMeatFrequency] = useState<'high' | 'medium' | 'low'>('medium');

  // Estimate annual beef consumption (lbs)
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
    <div className="bg-[#111111] border border-[#C5A028]/30 p-6 sm:p-8 text-white relative overflow-hidden">
      <div className="flex items-center gap-3.5 mb-6 border-b border-[#C5A028]/20 pb-4">
        <div className="p-2.5 bg-[#0a0a0a] border border-[#C5A028]/40 text-[#C5A028]">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#C5A028] block">FREEZER PLANNING TOOL</span>
          <h3 className="font-serif text-xl font-bold text-amber-100">Interactive Freezer Space Estimator</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex justify-between text-xs mb-2 font-serif uppercase tracking-wider">
              <span className="text-zinc-300">People in Household:</span>
              <span className="text-[#C5A028] font-bold font-mono text-sm">{householdSize} People</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              value={householdSize}
              onChange={(e) => setHouseholdSize(Number(e.target.value))}
              className="w-full accent-[#C5A028] bg-[#0a0a0a] h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-1">
              <span>1 Person</span>
              <span>4 Family</span>
              <span>8+ Large Household</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-serif uppercase tracking-widest text-zinc-300 block mb-2">Beef Meal Frequency:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMeatFrequency('low')}
                className={`py-2 px-3 text-[10px] font-serif uppercase tracking-widest transition-all border ${
                  meatFrequency === 'low'
                    ? 'bg-[#C5A028] text-black font-bold border-[#C5A028]'
                    : 'bg-[#0a0a0a] text-zinc-400 border-[#C5A028]/20 hover:border-[#C5A028]/50'
                }`}
              >
                1-2x / week
              </button>
              <button
                type="button"
                onClick={() => setMeatFrequency('medium')}
                className={`py-2 px-3 text-[10px] font-serif uppercase tracking-widest transition-all border ${
                  meatFrequency === 'medium'
                    ? 'bg-[#C5A028] text-black font-bold border-[#C5A028]'
                    : 'bg-[#0a0a0a] text-zinc-400 border-[#C5A028]/20 hover:border-[#C5A028]/50'
                }`}
              >
                3-4x / week
              </button>
              <button
                type="button"
                onClick={() => setMeatFrequency('high')}
                className={`py-2 px-3 text-[10px] font-serif uppercase tracking-widest transition-all border ${
                  meatFrequency === 'high'
                    ? 'bg-[#C5A028] text-black font-bold border-[#C5A028]'
                    : 'bg-[#0a0a0a] text-zinc-400 border-[#C5A028]/20 hover:border-[#C5A028]/50'
                }`}
              >
                Daily Beef
              </button>
            </div>
          </div>

          <div className="p-4 bg-[#0a0a0a] border border-[#C5A028]/20 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Est. Annual Beef Needs:</span>
              <span className="text-white font-mono font-bold">{estimatedAnnualLbs} lbs / year</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Required Freezer Space:</span>
              <span className="text-[#C5A028] font-mono font-bold">{selectedTier.cubicFeet} Cu. Ft.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Estimated Meals Provided:</span>
              <span className="text-emerald-400 font-mono font-bold">~{selectedTier.approxMeals} Portions</span>
            </div>
          </div>
        </div>

        {/* Visual Freezer Box Representation */}
        <div className="lg:col-span-6 bg-[#0a0a0a] p-6 border border-[#C5A028]/30 flex flex-col items-center justify-center text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C5A028]/10 text-[#C5A028] border border-[#C5A028]/30 text-[10px] font-mono uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A028]" />
            <span>Recommended Match</span>
          </div>

          <h4 className="font-serif text-2xl font-bold text-amber-100">
            {selectedTier.title}
          </h4>
          <p className="text-xs text-[#C5A028] font-mono mt-0.5 uppercase tracking-wider">{selectedTier.priceRange}</p>

          {/* Chest Freezer Diagram */}
          <div className="w-full max-w-xs my-5 p-4 bg-[#111111] border border-[#C5A028]/30 relative flex flex-col items-center justify-center gap-2">
            <div className="w-full h-24 bg-[#0a0a0a] border border-[#C5A028]/20 flex items-center justify-center relative overflow-hidden">
              <div className="z-10 text-center px-2">
                <span className="text-xs font-mono text-[#C5A028] font-bold block">{selectedTier.cubicFeet} CU. FT. FREEZER</span>
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
            onClick={() => onSelectShare(selectedTier.id)}
            className="w-full py-3 bg-[#C5A028] hover:bg-[#d6af30] text-black font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Reserve {selectedTier.title} (${selectedTier.depositAmount} Deposit)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
