import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, Truck, Package, Clock, CheckCircle2, AlertCircle, Printer, MapPin, Calendar, FileText } from 'lucide-react';

export default function TrackingPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // Auto look up default example if query in URL hash
  useEffect(() => {
    const hashParams = window.location.hash.split('?');
    if (hashParams.length > 1) {
      const search = new URLSearchParams(hashParams[1]);
      const id = search.get('id');
      if (id) {
        setQuery(id);
        fetchTracking(id);
      }
    }
  }, []);

  const fetchTracking = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/track?id=${encodeURIComponent(idToSearch.trim())}`);
      const data = await res.json();
      if (res.ok && data.found) {
        setResult(data.shipment);
      } else {
        setError(data.error || 'No shipment found matching this tracking ID.');
      }
    } catch {
      setError('Unable to fetch tracking record at this time.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(query);
  };

  const handlePrintWaybill = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/60 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-widest mb-4">
            <Truck className="w-3.5 h-3.5" />
            <span>OGFCARGO Cold Chain Express Tracking</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100 tracking-tight mb-3">
            Track Your Premium Beef Share Shipment
          </h1>
          <p className="text-stone-300 text-sm font-light">
            Enter your reservation confirmation code (e.g., <code className="text-amber-300 font-mono">RES-882194A</code>) or waybill tracking number (<code className="text-amber-300 font-mono font-bold">OGF-882194A</code>) to track real-time temperature logs and transit milestones.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-amber-400 absolute left-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Tracking ID (e.g., RES-882194A or OGF-993021B)..."
              className="w-full pl-12 pr-32 py-4 bg-[#0d1711] border-2 border-emerald-800/80 focus:border-amber-400 rounded-2xl text-sm text-white placeholder-stone-500 focus:outline-none shadow-2xl transition-all font-mono"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-serif font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>

        {/* Sample Quick Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 text-xs font-mono">
          <span className="text-stone-500">Quick Test IDs:</span>
          {['RES-882194A', 'RES-993021B', 'RES-441203C'].map((sample) => (
            <button
              key={sample}
              onClick={() => {
                setQuery(sample);
                fetchTracking(sample);
              }}
              className="px-3 py-1 bg-[#12241a] hover:bg-[#1a3526] text-amber-300 border border-emerald-800/60 rounded-lg transition-colors"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="max-w-xl mx-auto p-4 bg-red-950/60 border border-red-500/50 rounded-2xl text-red-200 text-sm text-center flex items-center justify-center gap-2 mb-10">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Tracking Results Card */}
        {result && (
          <div className="bg-[#0b140f] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 animate-in fade-in duration-300">
            {/* Top Bar Info */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-emerald-800/60 gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                  <span>WAYBILL / TRACKING #</span>
                  <span className="font-bold text-amber-300 text-sm px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded">
                    {result.trackingNumber || result.id}
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-white">{result.customerName}</h2>
                <p className="text-xs text-stone-400 font-mono mt-1">
                  Share: {result.shareSize} • {result.finish}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest text-stone-400 font-mono block">Status</span>
                  <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {result.status}
                  </span>
                </div>
                <button
                  onClick={handlePrintWaybill}
                  className="p-3 bg-[#162a1e] hover:bg-[#1f3c2b] text-amber-300 border border-emerald-700/60 rounded-xl transition-colors flex items-center gap-2 text-xs font-mono"
                  title="Print Waybill / Shipping Invoice"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print Waybill</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0f2117] p-4 rounded-2xl border border-emerald-800/50">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono mb-1">
                  <MapPin className="w-3.5 h-3.5" /> Origin
                </div>
                <p className="text-xs font-bold text-white">{result.origin}</p>
              </div>
              <div className="bg-[#0f2117] p-4 rounded-2xl border border-emerald-800/50">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono mb-1">
                  <MapPin className="w-3.5 h-3.5" /> Destination
                </div>
                <p className="text-xs font-bold text-white">{result.destination}</p>
              </div>
              <div className="bg-[#0f2117] p-4 rounded-2xl border border-emerald-800/50">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono mb-1">
                  <Truck className="w-3.5 h-3.5" /> Carrier
                </div>
                <p className="text-xs font-bold text-white">{result.carrier}</p>
              </div>
              <div className="bg-[#0f2117] p-4 rounded-2xl border border-emerald-800/50">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono mb-1">
                  <Calendar className="w-3.5 h-3.5" /> Est. Delivery
                </div>
                <p className="text-xs font-bold text-white">{result.estimatedDelivery}</p>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div>
              <h3 className="font-serif text-lg font-bold text-amber-200 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" /> Cold Chain Transit Timeline
              </h3>

              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-800/80">
                {result.timeline?.map((step: any, idx: number) => {
                  const isDone = step.status === 'completed';
                  const isCurrent = step.status === 'current';
                  return (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div
                        className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isDone
                            ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/40'
                            : isCurrent
                            ? 'bg-emerald-500 text-black animate-pulse ring-4 ring-emerald-500/20'
                            : 'bg-stone-800 text-stone-500 border border-stone-700'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </div>

                      <div className="bg-[#12241a]/80 p-4 rounded-2xl border border-emerald-800/60 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <h4 className="font-serif font-bold text-sm text-white">{step.title}</h4>
                          <span className="text-[10px] font-mono text-amber-400">{step.date}</span>
                        </div>
                        <p className="text-xs text-stone-300 font-light">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Print-only Printable Waybill Sheet */}
            <div className="hidden print:block text-black bg-white p-8 font-sans">
              <div className="border-4 border-black p-6 space-y-4">
                <div className="flex justify-between items-center border-b-2 border-black pb-4">
                  <div>
                    <h1 className="text-2xl font-black">OGFCARGO LOGISTICS VENTURES</h1>
                    <p className="text-xs uppercase font-bold">Cold Chain Beef Delivery Waybill</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-mono font-bold">WAYBILL #: {result.trackingNumber}</p>
                    <p className="text-xs">ID: {result.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-bold uppercase text-gray-600">Shipper / Producer:</p>
                    <p className="font-bold">Bastanzi Premium Beef Co.</p>
                    <p>Sheridan Ranch Station, MT</p>
                  </div>
                  <div>
                    <p className="font-bold uppercase text-gray-600">Consignee / Destination:</p>
                    <p className="font-bold">{result.customerName}</p>
                    <p>{result.destination}</p>
                  </div>
                </div>
                <div className="border-t border-b border-black py-2 text-xs grid grid-cols-3 gap-2">
                  <p><strong>Package:</strong> {result.shareSize}</p>
                  <p><strong>Finishing:</strong> {result.finish}</p>
                  <p><strong>Temp Spec:</strong> Deep Frozen (-20°F)</p>
                </div>
                <p className="text-[10px] text-gray-500 font-mono text-center">
                  Verified by OGFCARGO Security & Bastanzi Ranch Inspector. Stamp: APPROVED.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
