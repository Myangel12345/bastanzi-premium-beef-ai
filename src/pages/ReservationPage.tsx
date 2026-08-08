import { useState, useEffect, FormEvent } from 'react';
import confetti from 'canvas-confetti';
import { BRAND_IMAGES } from '../data/content';
import { getClientContentStore, subscribeContentStore } from '../lib/contentStore';
import { ShareSize, FinishOption, ReservationPayload } from '../types';
import { saveReservationToDatabase } from '../lib/supabase';
import { getActiveHarvestBatches } from '../lib/harvestBatches';
import { Check, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Printer, AlertCircle, Home, Truck, Sparkles, Tag } from 'lucide-react';
import SeoHead from '../components/SeoHead';

interface ReservationPageProps {
  initialShareSize?: ShareSize;
}

export default function ReservationPage({ initialShareSize }: ReservationPageProps) {
  const [contentStore, setContentStore] = useState(getClientContentStore());
  const [step, setStep] = useState<number>(1);
  const [shareSize, setShareSize] = useState<ShareSize>(initialShareSize || 'Half');
  const [finish, setFinish] = useState<FinishOption>('Grain-finished');
  const activeBatches = getActiveHarvestBatches();

  useEffect(() => {
    const unsubscribe = subscribeContentStore(() => {
      setContentStore({ ...getClientContentStore() });
    });
    return () => unsubscribe();
  }, []);

  const shareTiers = contentStore.shareTiers;
  const fees = contentStore.fees;

  const [formData, setFormData] = useState<ReservationPayload>({
    name: '',
    email: '',
    address: '',
    city: '',
    state: 'AZ',
    zip: '',
    shareSize: initialShareSize || 'Half',
    finish: 'Grain-finished',
    preferredDeliveryDate: activeBatches[0]?.name || 'Late Fall 2026 Harvest (October–November)',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [reservationConfirmed, setReservationConfirmed] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialShareSize) {
      setShareSize(initialShareSize);
      setFormData((prev) => ({ ...prev, shareSize: initialShareSize }));
    }
  }, [initialShareSize]);

  const selectedTier = shareTiers.find((t) => t.id === shareSize) || shareTiers[0];

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#fef08a', '#ffffff', '#b8962e'],
      });
    } catch {
      // fallback if canvas fails
    }
  };

  const handleNextStep = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (step === 1) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2) {
      if (!formData.name || !formData.email || !formData.address) {
        setErrorMsg('Please complete all required customer and delivery fields.');
        return;
      }
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitReservation = async () => {
    setLoading(true);
    setErrorMsg('');

    const payload: ReservationPayload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      address: formData.address ? formData.address.trim() : '',
      city: formData.city ? formData.city.trim() : '',
      state: formData.state ? formData.state.trim() : 'AZ',
      zip: formData.zip ? formData.zip.trim() : '',
      shareSize: shareSize || formData.shareSize,
      finish: finish || formData.finish,
      preferredDeliveryDate: formData.preferredDeliveryDate,
      notes: formData.notes ? formData.notes.trim() : '',
    };

    try {
      // 1. Save into Supabase database (or local store fallback) to get official order number
      const dbResult = await saveReservationToDatabase(payload);
      const officialOrderNum = dbResult.orderNumber || dbResult.id || 'BST-2026-' + Math.floor(100000 + Math.random() * 900000);

      // 2. Call Backend API for Resend emails & server logging with official orderNumber
      let serverData: any = {};
      try {
        const res = await fetch('/api/reserve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            orderNumber: officialOrderNum,
          }),
        });
        serverData = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.warn('Reservation API email/logger warning:', res.status, serverData);
        }
      } catch (apiErr) {
        console.warn('Backend reserve API fetch warning (proceeding with local order):', apiErr);
      }

      const record = {
        id: officialOrderNum,
        ...payload,
        createdAt: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        estimatedPrice: selectedTier.priceRange,
        depositRequired: selectedTier.depositAmount,
      };

      setReservationConfirmed(record);
      triggerConfetti();

      // Reset form state after successful submission
      const freshBatches = getActiveHarvestBatches();
      setFormData({
        name: '',
        email: '',
        address: '',
        city: '',
        state: 'AZ',
        zip: '',
        shareSize: 'Half',
        finish: 'Grain-finished',
        preferredDeliveryDate: freshBatches[0]?.name || 'Late Fall 2026 Harvest (October–November)',
        notes: '',
      });
      setShareSize('Half');
      setFinish('Grain-finished');
      setStep(1);
    } catch (err: any) {
      console.error('Reservation submission exception:', err);
      setErrorMsg(err?.message || 'Failed to submit reservation. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a180f] text-[#f7f2e8] min-h-screen pb-20">
      <SeoHead
        title="Reserve Your Beef Share | Bastanzi Premium Beef Co."
        description="Official Beef Share Reservation Form. Select Full, Half, Quarter, or Eighth shares with customizable grass-fed or grain-finished butchering options."
      />

      {/* Header */}
      <section className="py-14 bg-[#0c1a12] border-b border-emerald-900/60 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest bg-emerald-900/60 px-3 py-1 rounded-full border border-amber-500/30">
            OFFICIAL HERD ALLOCATION
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">
            Reserve Your Beef Share
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto font-light">
            Place your refundable deposit to hold your pasture-raised animal allocation for an upcoming dry-aging harvest batch.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {reservationConfirmed ? (
          /* Order Confirmation View */
          <div className="bg-[#102218] border-2 border-amber-500/50 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-3 border-b border-emerald-900/60 pb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100">
                ✅ Reservation Successfully Received
              </h2>
              <p className="text-stone-300 text-sm max-w-lg mx-auto font-light">
                Thank you, <strong className="text-amber-200">{reservationConfirmed.name}</strong>. Your beef share reservation has been securely logged with our master butchering team.
              </p>
              <div className="inline-block bg-[#0c1a12] border border-amber-500/40 px-4 py-2 rounded-xl text-xs font-mono">
                <span className="text-stone-400">Order Number:</span>{' '}
                <span className="font-bold text-base text-amber-300">#{reservationConfirmed.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-light">
              <div className="bg-[#0c1a12] p-5 rounded-xl border border-emerald-800/60 space-y-3">
                <h3 className="font-serif text-sm font-bold text-amber-300 border-b border-emerald-900/60 pb-2 uppercase tracking-wider">
                  Reserved Share Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Customer Name:</span>
                    <span className="font-bold text-stone-100">{reservationConfirmed.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Beef Share Reserved:</span>
                    <span className="font-bold text-amber-200">{reservationConfirmed.shareSize} Share ({reservationConfirmed.finish})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Estimated Total:</span>
                    <span className="text-amber-400 font-bold font-mono">{reservationConfirmed.estimatedPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Refundable Deposit:</span>
                    <span className="text-emerald-400 font-mono font-bold">${reservationConfirmed.depositRequired}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0c1a12] p-5 rounded-xl border border-emerald-800/60 space-y-3">
                <h3 className="font-serif text-sm font-bold text-amber-300 border-b border-emerald-900/60 pb-2 uppercase tracking-wider">
                  Fulfillment & Batch Allocation
                </h3>
                <div className="space-y-2 text-stone-300">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Delivery/Pickup Method:</span>
                    <span className="text-white font-medium">Insulated Direct Delivery / Ranch Pickup</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Estimated Harvest Batch:</span>
                    <span className="text-amber-300 font-medium">{reservationConfirmed.preferredDeliveryDate}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block mb-0.5">Destination Address:</span>
                    <span className="text-stone-200">{reservationConfirmed.address}, {reservationConfirmed.city}, {reservationConfirmed.state} {reservationConfirmed.zip}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Confirmation Callout */}
            <div className="p-4 bg-[#0c1a12] border border-emerald-500/40 rounded-xl flex items-start gap-3 text-xs text-stone-200">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="font-light space-y-1">
                <strong className="block font-serif text-amber-300 text-sm font-bold">Confirmation Email Dispatched</strong>
                <p className="text-stone-300">
                  A detailed reservation summary and butcher consultation itinerary have been sent to <strong className="text-amber-200">{reservationConfirmed.email}</strong>. Our ranch concierge will reach out via email to finalize custom cut options.
                </p>
              </div>
            </div>

            {/* Two Action Buttons: Track My Order & Return to Home */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-emerald-900/60">
              <a
                href={`#track-order?num=${reservationConfirmed.id}&email=${encodeURIComponent(reservationConfirmed.email)}`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Track My Order</span>
              </a>
              <a
                href="#home"
                onClick={() => setReservationConfirmed(null)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#12241a] hover:bg-[#182e21] text-amber-200 font-serif font-bold text-xs uppercase tracking-wider transition-all border border-emerald-800/60 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </a>
            </div>
          </div>
        ) : (
          /* Multi-Step Reservation Form */
          <div className="bg-[#102218] border border-emerald-800/60 rounded-2xl p-6 sm:p-10 shadow-2xl relative">
            {/* Step Wizard Header */}
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-6 mb-8 text-xs font-serif">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-amber-400 font-bold' : 'text-stone-500'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono ${step >= 1 ? 'bg-amber-500 text-emerald-950 font-bold' : 'bg-[#0c1a12] text-stone-500'}`}>1</span>
                <span>1. Choose Share & Finish</span>
              </div>
              <div className="w-8 sm:w-16 h-0.5 bg-emerald-900/60" />
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-amber-400 font-bold' : 'text-stone-500'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono ${step >= 2 ? 'bg-amber-500 text-emerald-950 font-bold' : 'bg-[#0c1a12] text-stone-500'}`}>2</span>
                <span>2. Delivery Info</span>
              </div>
              <div className="w-8 sm:w-16 h-0.5 bg-emerald-900/60" />
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-amber-400 font-bold' : 'text-stone-500'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono ${step >= 3 ? 'bg-amber-500 text-emerald-950 font-bold' : 'bg-[#0c1a12] text-stone-500'}`}>3</span>
                <span>3. Review & Confirm</span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 bg-red-950/80 border border-red-500/50 rounded-lg text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: Share Size & Finish Selection */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-8">
                <div>
                  <h2 className="font-serif text-xl font-bold text-amber-200 mb-3">Step 1: Select Your Beef Share Size</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {shareTiers.map((tier) => {
                      const isSelected = shareSize === tier.id;
                      return (
                        <div
                          key={tier.id}
                          onClick={() => {
                            setShareSize(tier.id);
                            setFormData((prev) => ({ ...prev, shareSize: tier.id }));
                          }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#183223] border-amber-400 ring-2 ring-amber-400/40'
                              : 'bg-[#0c1a12] border-emerald-800/40 hover:border-emerald-700'
                          }`}
                        >
                          {tier.image && (
                            <div className="w-full h-32 overflow-hidden rounded-lg mb-3 border border-emerald-800/40">
                              <img
                                src={tier.image}
                                alt={`${tier.title} package`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-serif font-bold text-amber-100 text-base">{tier.title}</span>
                            {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                          </div>
                          <span className="text-amber-400 font-mono text-sm font-bold block">{tier.priceRange}</span>
                          <span className="text-[11px] text-stone-400 block mt-1 font-light">{tier.weightLbs}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 p-3 bg-[#0c1a12] border border-amber-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
                    <span className="text-stone-300 font-light text-center sm:text-left">
                      Looking for custom bundles or portions smaller than an Eighth Share (&lt; 50 lbs)?
                    </span>
                    <a
                      href="#contact"
                      className="text-amber-400 font-serif font-bold hover:underline shrink-0 bg-[#14281d] px-3 py-1.5 rounded-lg border border-amber-500/30"
                    >
                      Contact for Pricing →
                    </a>
                  </div>
                </div>

                {/* Finishing Option */}
                <div>
                  <h3 className="font-serif text-lg font-bold text-amber-200 mb-3">Finishing Preference</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'Grain-finished', title: 'Grain-Finished', desc: 'Finished on local barley & alfalfa for heavy, buttery steakhouse marbling.' },
                      { id: 'Grass-fed', title: '100% Grass-Fed', desc: 'Pasture-raised for life. Leaner, mineral-rich, herbal flavor profile high in Omega-3s.' },
                      { id: 'Mixed', title: 'Mixed Finishing Split', desc: 'Available for Full & Half shares. Split 50% grass-finished and 50% grain-finished cuts.' },
                    ].map((opt) => {
                      const isSel = finish === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            setFinish(opt.id as FinishOption);
                            setFormData((prev) => ({ ...prev, finish: opt.id as FinishOption }));
                          }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            isSel
                              ? 'bg-[#183223] border-amber-400'
                              : 'bg-[#0c1a12] border-emerald-800/40 hover:border-emerald-700'
                          }`}
                        >
                          <span className="font-serif font-bold text-amber-200 text-sm block mb-1">{opt.title}</span>
                          <p className="text-stone-300 text-xs leading-relaxed font-light">{opt.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Live Selected Summary */}
                <div className="p-4 bg-[#0c1a12] border border-emerald-800/60 rounded-xl flex flex-wrap items-center justify-between text-xs gap-4">
                  <div>
                    <span className="text-stone-400 block font-light">Selected Configuration:</span>
                    <strong className="text-amber-300 font-serif text-sm">
                      {selectedTier.title} ({finish})
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-400 block font-light">Refundable Deposit Required:</span>
                    <strong className="text-emerald-400 font-mono text-base">${selectedTier.depositAmount}</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-serif font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Continue to Customer & Delivery Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 2: Customer & Delivery Details */}
            {step === 2 && (
              <form onSubmit={handleNextStep} className="space-y-6 text-xs">
                <h2 className="font-serif text-xl font-bold text-amber-200">Step 2: Customer & Delivery Address</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-stone-300 font-serif block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#0c1a12] border border-emerald-800/60 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-white placeholder-stone-400 focus:outline-none font-light"
                    />
                  </div>
                  <div>
                    <label className="text-stone-300 font-serif block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. eleanor@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#0c1a12] border border-emerald-800/60 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-white placeholder-stone-400 focus:outline-none font-light"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-stone-300 font-serif block mb-1">Preferred Harvest Batch *</label>
                  <select
                    value={formData.preferredDeliveryDate}
                    onChange={(e) => setFormData({ ...formData, preferredDeliveryDate: e.target.value })}
                    className="w-full bg-[#0c1a12] border border-emerald-800/60 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-white focus:outline-none font-light"
                  >
                    {activeBatches.map((batch) => (
                      <option key={batch.id} value={batch.name}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-stone-300 font-serif block mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1154 E Fillmore St"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#0c1a12] border border-emerald-800/60 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-white placeholder-stone-400 focus:outline-none font-light"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-stone-300 font-serif block mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Phoenix"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-[#0c1a12] border border-emerald-800/60 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-white placeholder-stone-400 focus:outline-none font-light"
                    />
                  </div>
                  <div>
                    <label className="text-stone-300 font-serif block mb-1">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AZ"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-[#0c1a12] border border-emerald-800/60 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-white placeholder-stone-400 focus:outline-none font-light"
                    />
                  </div>
                  <div>
                    <label className="text-stone-300 font-serif block mb-1">ZIP Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 85006"
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      className="w-full bg-[#0c1a12] border border-emerald-800/60 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-white placeholder-stone-400 focus:outline-none font-light"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 bg-[#12241a] hover:bg-[#182e21] text-stone-300 font-serif text-xs rounded-xl flex items-center justify-center gap-1 border border-emerald-800/60"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-serif font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Review & Custom Notes */}
            {step === 3 && (
              <div className="space-y-6 text-xs">
                <h2 className="font-serif text-xl font-bold text-amber-200">Step 3: Custom Butcher Notes & Final Review</h2>

                <div className="bg-[#0c1a12] p-5 rounded-xl border border-emerald-800/60 space-y-3 font-light">
                  <h3 className="font-serif text-sm font-bold text-amber-300 border-b border-emerald-900/60 pb-2">
                    Reservation Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-300">
                    <div>
                      <p><strong>Share Size:</strong> {selectedTier.title}</p>
                      <p><strong>Finish:</strong> {finish}</p>
                      <p><strong>Price Range:</strong> {selectedTier.priceRange}</p>
                      <p><strong>Deposit Required:</strong> <span className="text-emerald-400 font-mono font-bold">${selectedTier.depositAmount}</span></p>
                    </div>
                    <div>
                      <p><strong>Customer:</strong> {formData.name}</p>
                      <p><strong>Contact Email:</strong> {formData.email}</p>
                      <p><strong>Address:</strong> {formData.address}, {formData.city}, {formData.state} {formData.zip}</p>
                      <p><strong>Harvest Batch:</strong> {formData.preferredDeliveryDate}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-stone-300 font-serif block mb-1 font-light">
                    Special Butcher Notes or Custom Cutting Requests (Optional)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g. Extra thick 1.5 inch ribeyes, double ground beef 1lb chubs, reserve soup marrow bones..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-[#0c1a12] border border-emerald-800/60 focus:border-amber-400 rounded-lg p-3.5 text-white placeholder-stone-400 focus:outline-none resize-none font-light"
                  />
                </div>

                <div className="p-4 bg-[#0c1a12] border border-amber-500/30 rounded-xl flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                  <p className="text-stone-300 text-[11px] font-light">
                    By submitting this reservation, your animal share allocation is locked. No payment is charged right now — our concierge will email you at {formData.email || 'your email'} to coordinate your ${selectedTier.depositAmount} deposit.
                  </p>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-1/3 py-3.5 bg-[#12241a] hover:bg-[#182e21] text-stone-300 font-serif text-xs rounded-xl flex items-center justify-center gap-1 border border-emerald-800/60"
                  >
                    <ArrowLeft className="w-4 h-4" /> Edit Info
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSubmitReservation}
                    className="w-2/3 py-3.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-serif font-bold text-xs uppercase tracking-widest rounded-xl shadow-xl flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Processing Reservation...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-950" />
                        <span>Confirm & Submit Reservation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

