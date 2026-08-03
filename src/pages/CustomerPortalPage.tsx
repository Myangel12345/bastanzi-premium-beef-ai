import React, { useState } from 'react';
import { User, Search, Package, Printer, Clock, FileText, CheckCircle2, MapPin, Truck } from 'lucide-react';

export default function CustomerPortalPage() {
  const [lookupEmailOrPhone, setLookupEmailOrPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupEmailOrPhone.trim()) return;

    setLoading(true);
    setError('');
    setOrders([]);
    setSearched(true);

    try {
      const res = await fetch(`/api/track?id=${encodeURIComponent(lookupEmailOrPhone.trim())}`);
      const data = await res.json();

      if (res.ok && data.found && data.shipment) {
        setOrders([data.shipment]);
      } else {
        setError('No orders or reservations found matching this email, phone, or reservation ID.');
      }
    } catch {
      setError('Unable to fetch order history at this time.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/60 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-widest">
            <User className="w-3.5 h-3.5" />
            <span>Bastanzi Customer Account Portal</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100">
            Order History & Customer Account Lookup
          </h1>
          <p className="text-stone-300 text-sm font-light">
            Enter your email address, phone number, or reservation ID to access your order receipts, invoices, and live tracking status.
          </p>
        </div>

        {/* Lookup Box */}
        <form onSubmit={handleLookup} className="max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-amber-400 absolute left-4" />
            <input
              type="text"
              value={lookupEmailOrPhone}
              onChange={(e) => setLookupEmailOrPhone(e.target.value)}
              placeholder="Enter Email, Phone, or Reservation ID..."
              className="w-full pl-12 pr-32 py-4 bg-[#0d1711] border-2 border-emerald-800 focus:border-amber-400 rounded-2xl text-sm text-white placeholder-stone-500 focus:outline-none font-mono"
            />
            <button
              type="submit"
              disabled={loading || !lookupEmailOrPhone.trim()}
              className="absolute right-2 px-6 py-2.5 bg-amber-500 text-black font-serif font-bold text-xs uppercase rounded-xl hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Lookup'}
            </button>
          </div>
        </form>

        {error && (
          <div className="max-w-xl mx-auto p-4 bg-red-950/60 border border-red-500/50 rounded-2xl text-red-200 text-xs text-center font-mono">
            {error}
          </div>
        )}

        {/* Initial Prompt State */}
        {!searched && !loading && (
          <div className="bg-[#0b140f] border border-emerald-900 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-3">
            <Package className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-amber-100">View Your Beef Share Orders</h3>
            <p className="text-stone-400 text-xs font-mono">
              Access official tax invoices, download PDF receipts, and follow cold chain delivery stages.
            </p>
          </div>
        )}

        {/* Orders Results List */}
        {orders.length > 0 && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-amber-200">Your Beef Share Reservations ({orders.length})</h3>
            {orders.map((order) => (
              <div key={order.id} className="bg-[#0b140f] border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-800">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">RESERVATION ID</span>
                    <h2 className="font-serif text-2xl font-bold text-white">{order.id}</h2>
                    <p className="text-xs font-mono text-stone-400 mt-0.5">Tracking Waybill: {order.trackingNumber}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-mono font-bold">
                      {order.status}
                    </span>
                    <button
                      onClick={() => setSelectedInvoice(order)}
                      className="px-4 py-2 bg-[#162a1e] hover:bg-[#1f3c2b] text-amber-300 border border-emerald-700 rounded-xl text-xs font-mono flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Invoice</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="bg-[#0f2117] p-3.5 rounded-xl border border-emerald-800">
                    <span className="text-amber-400 text-[10px] block">CUSTOMER DETAILS</span>
                    <p className="font-bold text-white">{order.customerName}</p>
                    <p className="text-stone-400">{order.email}</p>
                  </div>
                  <div className="bg-[#0f2117] p-3.5 rounded-xl border border-emerald-800">
                    <span className="text-amber-400 text-[10px] block">SHARE SIZE & FINISH</span>
                    <p className="font-bold text-white">{order.shareSize} Share</p>
                    <p className="text-stone-400">{order.finish}</p>
                  </div>
                  <div className="bg-[#0f2117] p-3.5 rounded-xl border border-emerald-800">
                    <span className="text-amber-400 text-[10px] block">ESTIMATED DELIVERY</span>
                    <p className="font-bold text-white">{order.estimatedDelivery}</p>
                    <p className="text-stone-400">Carrier: {order.carrier}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Printable Invoice Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white text-black rounded-3xl p-8 max-w-xl w-full shadow-2xl font-sans">
              <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-4">
                <div>
                  <h2 className="font-serif text-2xl font-black">BASTANZI PREMIUM BEEF CO.</h2>
                  <p className="text-xs uppercase font-bold text-gray-600">Official Order Invoice & Receipt</p>
                </div>
                <div className="text-right font-mono">
                  <p className="font-bold text-lg">#{selectedInvoice.id}</p>
                  <p className="text-xs text-gray-500">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-4 text-xs mb-6 font-mono">
                <div className="bg-gray-100 p-3 rounded-xl border">
                  <p><strong>Customer:</strong> {selectedInvoice.customerName}</p>
                  <p><strong>Email:</strong> {selectedInvoice.email}</p>
                  <p><strong>Shipping Address:</strong> {selectedInvoice.destination}</p>
                </div>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black text-gray-700">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-2">
                        {selectedInvoice.shareSize} Beef Share
                        <span className="block text-[10px] text-gray-500">{selectedInvoice.finish}</span>
                      </td>
                      <td className="py-2 text-right font-bold">$1,150.00</td>
                    </tr>
                    <tr>
                      <td className="py-2">OGFCARGO Cold Chain Express Shipping</td>
                      <td className="py-2 text-right font-bold">$0.00 (Included)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-300 font-serif">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black text-xs font-bold rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
