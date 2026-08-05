import { useState, useEffect, FormEvent } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  ShieldCheck,
  AlertCircle,
  FileText,
  Building2,
  Calendar,
  Weight,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { fetchOrderForTracking } from '../lib/supabase';
import { Order } from '../types';
import { BRAND_IMAGES } from '../data/content';

interface TrackOrderPageProps {
  onNavigateToReservation?: () => void;
}

export default function TrackOrderPage({ onNavigateToReservation }: TrackOrderPageProps) {
  const [orderNumberInput, setOrderNumberInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  // Auto load query params if provided e.g. #track-order?num=BST-2026-000001&email=...
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const queryStr = hash.split('?')[1];
      const params = new URLSearchParams(queryStr);
      const num = params.get('num') || params.get('order');
      const email = params.get('email');
      if (num && email) {
        setOrderNumberInput(num);
        setEmailInput(email);
        performLookup(num, email);
      }
    }
  }, []);

  const performLookup = async (numToSearch: string, emailToSearch: string) => {
    setLoading(true);
    setErrorMessage('');
    setTrackedOrder(null);

    try {
      const result = await fetchOrderForTracking(numToSearch, emailToSearch);
      if (result.success && result.order) {
        setTrackedOrder(result.order);
      } else {
        setErrorMessage(
          result.message ||
            'No matching order found. Please ensure both your Order Number and Email Address match your reservation receipt exactly.'
        );
      }
    } catch {
      setErrorMessage('An unexpected error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    performLookup(orderNumberInput, emailInput);
  };

  // Quick fill demo buttons for testing preview
  const handleQuickDemo = (num: string, email: string) => {
    setOrderNumberInput(num);
    setEmailInput(email);
    performLookup(num, email);
  };

  // Define tracking timeline steps based on fulfillment method
  const isDelivery = trackedOrder?.fulfillment_method?.toLowerCase() === 'delivery';

  const TRACKING_STEPS = [
    { id: 'Order Received', label: 'Order Received', icon: FileText, desc: 'Reservation logged & cutting card queued' },
    { id: 'Reservation Confirmed', label: 'Reservation Confirmed', icon: ShieldCheck, desc: 'Herd allocation assigned by butcher' },
    { id: 'Payment Confirmed', label: 'Payment Confirmed', icon: DollarSign, desc: 'Deposit / payment verified' },
    { id: 'Preparing Beef Share', label: 'Preparing Beef Share', icon: Clock, desc: '21-day dry aging in climate-controlled vault' },
    { id: 'Quality Inspection', label: 'Quality Inspection', icon: ShieldCheck, desc: 'USDA inspector & butcher marbling audit' },
    { id: 'Packaged', label: 'Packaged', icon: PackageCheck, desc: 'Vacuum sealed in 4mil bags & insulated box' },
    {
      id: isDelivery ? 'Out for Delivery' : 'Ready for Pickup',
      label: isDelivery ? 'Out for Delivery' : 'Ready for Pickup',
      icon: Truck,
      desc: isDelivery ? 'In temperature-controlled transit to address' : 'Stored in walk-in freezer ready for pickup',
    },
    { id: 'Delivered', label: isDelivery ? 'Delivered' : 'Picked Up', icon: CheckCircle2, desc: 'Order fulfilled & enjoyed' },
  ];

  // Helper to get step index
  const getStepIndex = (statusStr: string) => {
    const statusMap: Record<string, number> = {
      'order received': 0,
      'reservation confirmed': 1,
      'payment confirmed': 2,
      'preparing beef share': 3,
      'quality inspection': 4,
      packaged: 5,
      'ready for pickup': 6,
      'out for delivery': 6,
      delivered: 7,
      'picked up': 7,
    };
    return statusMap[statusStr.toLowerCase()] ?? 0;
  };

  const currentStepIdx = trackedOrder ? getStepIndex(trackedOrder.current_status) : 0;

  return (
    <div className="min-h-screen bg-[#07110a] text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs uppercase tracking-widest font-mono">
            <Lock className="w-3.5 h-3.5 text-amber-400" /> Secure Customer Portal
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-amber-100 uppercase tracking-wide">
            Track My Order
          </h1>
          <p className="text-stone-400 max-w-xl mx-auto text-sm sm:text-base font-sans">
            Track your pasture-raised, dry-aged beef share status in real time from butcher queue to pickup or delivery.
          </p>
        </div>

        {/* Order Lookup Form */}
        <div className="bg-[#0f2217] border border-emerald-800/60 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-0 sm:flex sm:gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label htmlFor="order_number_input" className="block text-xs font-serif uppercase tracking-wider text-amber-200">
                Order Number
              </label>
              <div className="relative">
                <input
                  id="order_number_input"
                  type="text"
                  placeholder="e.g. BST-2026-000001"
                  value={orderNumberInput}
                  onChange={(e) => setOrderNumberInput(e.target.value)}
                  required
                  className="w-full bg-[#07110a] border border-emerald-700/60 rounded-xl px-4 py-3 text-stone-100 placeholder-stone-500 font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <label htmlFor="email_address_input" className="block text-xs font-serif uppercase tracking-wider text-amber-200">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email_address_input"
                  type="email"
                  placeholder="e.g. customer@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="w-full bg-[#07110a] border border-emerald-700/60 rounded-xl px-4 py-3 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                />
              </div>
            </div>

            <button
              id="submit_track_order_btn"
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-emerald-950 font-serif font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Order</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill helper */}
          <div className="pt-2 border-t border-emerald-900/60 flex flex-wrap items-center gap-2 text-xs text-stone-400">
            <span className="text-stone-500">Demo Order Shortcuts:</span>
            <button
              type="button"
              onClick={() => handleQuickDemo('BST-2026-000001', 'arthur.pendleton@example.com')}
              className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-amber-300 font-mono text-[11px] border border-emerald-800 transition-colors"
            >
              BST-2026-000001 (Preparing)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('BST-2026-000002', 'eleanor@example.com')}
              className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-amber-300 font-mono text-[11px] border border-emerald-800 transition-colors"
            >
              BST-2026-000002 (Ready for Pickup)
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-950/80 border border-red-500/50 rounded-2xl p-5 text-red-200 text-sm flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Order Verification Failed</p>
              <p className="mt-1 text-red-200/90">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Tracked Order Details */}
        {trackedOrder && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Top Overview Banner */}
            <div className="bg-[#0b1b11] border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-emerald-800/60">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold block">
                    Order Confirmation #{trackedOrder.order_number}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100">
                    {trackedOrder.beef_share}
                  </h2>
                  <p className="text-stone-300 text-sm">
                    Customer:{' '}
                    <span className="font-semibold text-stone-100">
                      {trackedOrder.customer
                        ? `${trackedOrder.customer.first_name} ${trackedOrder.customer.last_name}`
                        : 'Valued Customer'}
                    </span>{' '}
                    ({trackedOrder.customer?.email})
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400/10 border border-amber-400/40 text-amber-300 font-serif font-bold text-sm tracking-wide">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Status: {trackedOrder.current_status}</span>
                  </div>
                  <span className="text-xs text-stone-400 font-mono">
                    Placed on: {new Date(trackedOrder.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Detail Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                <div className="bg-[#07110a] p-4 rounded-xl border border-emerald-800/40 space-y-1">
                  <span className="text-[11px] font-serif uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <Weight className="w-3.5 h-3.5 text-amber-400" /> Estimated Weight
                  </span>
                  <p className="text-stone-100 font-medium text-base">
                    {trackedOrder.estimated_weight || '200-450 lbs'}
                  </p>
                </div>

                <div className="bg-[#07110a] p-4 rounded-xl border border-emerald-800/40 space-y-1">
                  <span className="text-[11px] font-serif uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-400" /> Fulfillment
                  </span>
                  <p className="text-stone-100 font-medium text-base capitalize">
                    {trackedOrder.fulfillment_method || 'Pickup'}
                  </p>
                </div>

                <div className="bg-[#07110a] p-4 rounded-xl border border-emerald-800/40 space-y-1">
                  <span className="text-[11px] font-serif uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> Target Date
                  </span>
                  <p className="text-stone-100 font-medium text-base">
                    {trackedOrder.pickup_date || trackedOrder.delivery_date || 'Fall 2026 Batch'}
                  </p>
                </div>

                <div className="bg-[#07110a] p-4 rounded-xl border border-emerald-800/40 space-y-1">
                  <span className="text-[11px] font-serif uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Payment
                  </span>
                  <p className="text-stone-100 font-medium text-base">
                    <span className="px-2 py-0.5 rounded text-xs bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {trackedOrder.payment_status || 'Deposit Paid'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Progress Tracker Pipeline */}
            <div className="bg-[#0b1b11] border border-emerald-800/60 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <h3 className="text-xl font-serif font-bold text-amber-100 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
                Order Fulfillment Progress
              </h3>

              {/* Progress Steps Horizontal / Vertical Timeline */}
              <div className="relative py-4">
                <div className="hidden lg:grid lg:grid-cols-8 gap-2 relative">
                  {/* Connecting Line behind icons */}
                  <div className="absolute top-5 left-6 right-6 h-1 bg-emerald-950 -z-0 rounded-full" />
                  <div
                    className="absolute top-5 left-6 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 -z-0 rounded-full transition-all duration-500"
                    style={{
                      width: `${(currentStepIdx / (TRACKING_STEPS.length - 1)) * 92}%`,
                    }}
                  />

                  {TRACKING_STEPS.map((step, idx) => {
                    const isPassed = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const IconComp = step.icon;

                    return (
                      <div key={step.id} className="relative flex flex-col items-center text-center space-y-2 group">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 ${
                            isCurrent
                              ? 'bg-amber-400 text-black ring-4 ring-amber-400/30 scale-110 shadow-lg shadow-amber-400/20'
                              : isPassed
                              ? 'bg-emerald-800 text-amber-300'
                              : 'bg-[#07110a] text-stone-600 border border-emerald-900'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-5 h-5 text-amber-300" /> : <IconComp className="w-5 h-5" />}
                        </div>

                        <span
                          className={`text-xs font-serif font-medium leading-tight ${
                            isCurrent
                              ? 'text-amber-300 font-bold'
                              : isPassed
                              ? 'text-stone-200'
                              : 'text-stone-600'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile / Vertical Progress Steps */}
                <div className="lg:hidden space-y-4">
                  {TRACKING_STEPS.map((step, idx) => {
                    const isPassed = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const IconComp = step.icon;

                    return (
                      <div key={step.id} className="flex items-start gap-4">
                        <div
                          className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center ${
                            isCurrent
                              ? 'bg-amber-400 text-black ring-4 ring-amber-400/30 font-bold'
                              : isPassed
                              ? 'bg-emerald-800 text-amber-300'
                              : 'bg-[#07110a] text-stone-600 border border-emerald-900'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-4 h-4 text-amber-300" /> : <IconComp className="w-4 h-4" />}
                        </div>

                        <div className="pt-1">
                          <p
                            className={`text-sm font-serif font-bold ${
                              isCurrent ? 'text-amber-300' : isPassed ? 'text-stone-200' : 'text-stone-500'
                            }`}
                          >
                            {step.label}
                            {isCurrent && (
                              <span className="ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                Active Step
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-stone-400 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Butcher Notes & Detailed History Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Butcher Notes */}
              <div className="md:col-span-1 bg-[#0b1b11] border border-emerald-800/60 rounded-2xl p-6 space-y-3 shadow-xl">
                <h4 className="text-sm font-serif uppercase tracking-wider text-amber-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" /> Special Butcher Notes
                </h4>
                <p className="text-sm text-stone-300 bg-[#07110a] p-4 rounded-xl border border-emerald-900 leading-relaxed font-sans">
                  {trackedOrder.notes || 'Standard custom cutting card applied. No special instructions recorded.'}
                </p>
              </div>

              {/* Order History Event Audit */}
              <div className="md:col-span-2 bg-[#0b1b11] border border-emerald-800/60 rounded-2xl p-6 space-y-4 shadow-xl">
                <h4 className="text-sm font-serif uppercase tracking-wider text-amber-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" /> Order History Audit Log
                </h4>

                <div className="space-y-3">
                  {trackedOrder.history && trackedOrder.history.length > 0 ? (
                    trackedOrder.history.map((histItem) => (
                      <div
                        key={histItem.id}
                        className="bg-[#07110a] p-4 rounded-xl border border-emerald-900/80 flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-serif font-bold text-amber-300 block uppercase">
                            {histItem.status}
                          </span>
                          <p className="text-xs text-stone-300">{histItem.notes}</p>
                          <span className="text-[10px] text-stone-500 font-mono block">
                            Logged by: {histItem.created_by}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400 font-mono shrink-0">
                          {new Date(histItem.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone-500 font-sans italic">
                      No additional history entries recorded yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Need Assistance Callout */}
            <div className="bg-[#0f2217] border border-amber-500/20 rounded-2xl p-6 text-center space-y-3">
              <h4 className="font-serif font-bold text-amber-100 text-lg">Have Questions About Your Cutting Instructions?</h4>
              <p className="text-stone-300 text-sm max-w-xl mx-auto">
                Our master butchers and ranch concierges are on standby to modify your custom dry-aging or packaging options.
              </p>
              <div className="pt-2 flex justify-center gap-4">
                <a
                  href="tel:18005552333"
                  className="px-5 py-2 rounded-full bg-emerald-950 hover:bg-emerald-900 text-amber-300 text-xs font-serif uppercase tracking-wider border border-emerald-800 transition-colors"
                >
                  Call Ranch Concierge
                </a>
                {onNavigateToReservation && (
                  <button
                    onClick={onNavigateToReservation}
                    className="px-5 py-2 rounded-full bg-amber-400 text-emerald-950 hover:brightness-110 text-xs font-serif font-bold uppercase tracking-wider transition-colors"
                  >
                    Reserve Another Share
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
