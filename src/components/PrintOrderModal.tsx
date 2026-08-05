import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle, MapPin, Phone, Mail, Building2 } from 'lucide-react';
import { Order } from '../types';
import { BRAND_IMAGES, BUSINESS_INFO } from '../data/content';

interface PrintOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function PrintOrderModal({ isOpen, onClose, order }: PrintOrderModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-stone-900 border border-amber-500/30 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 text-stone-100 max-h-[90vh] overflow-y-auto">
        {/* Modal Controls (Hidden in Print Mode) */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800 print:hidden">
          <h3 className="font-serif font-bold text-lg text-amber-200">
            Printable Order Manifest & Invoice
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-serif font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="bg-white text-stone-900 p-8 rounded-xl shadow-inner space-y-8 print:p-0 print:bg-white print:text-black">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-stone-200">
            <div className="flex items-center gap-4">
              <img
                src={BRAND_IMAGES.logo}
                alt="Bastanzi Emblem"
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-600 p-0.5"
              />
              <div>
                <h1 className="font-serif text-2xl font-bold tracking-wider text-amber-950 uppercase">
                  BASTANZI PREMIUM BEEF CO.
                </h1>
                <p className="text-xs uppercase tracking-widest text-stone-600 font-sans">
                  Pasture Raised • 21-Day Dry Aged • USDA Inspected
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  100 Ranch Road, Suite 400 • Austin, TX 78701 • Tel: {BUSINESS_INFO.phoneFormatted}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold text-sm rounded">
                #{order.order_number}
              </span>
              <p className="text-xs text-stone-500 mt-1">
                <strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-stone-500">
                <strong>Print Date:</strong> {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Grid */}
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div className="space-y-1 bg-stone-50 p-4 rounded-lg border border-stone-200">
              <p className="text-xs font-serif uppercase tracking-wider font-bold text-stone-500">
                Customer Information
              </p>
              <p className="font-bold text-stone-900 text-base">
                {order.customer
                  ? `${order.customer.first_name} ${order.customer.last_name}`
                  : 'Customer Record'}
              </p>
              <p className="text-stone-700 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-stone-400" /> {order.customer?.email}
              </p>
              <p className="text-stone-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-stone-400" /> {order.customer?.phone || 'N/A'}
              </p>
            </div>

            <div className="space-y-1 bg-stone-50 p-4 rounded-lg border border-stone-200">
              <p className="text-xs font-serif uppercase tracking-wider font-bold text-stone-500">
                Fulfillment & Destination
              </p>
              <p className="font-bold text-stone-900 text-base capitalize">
                Method: {order.fulfillment_method || 'Pickup'}
              </p>
              <p className="text-stone-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />{' '}
                {order.customer?.address ? `${order.customer.address}, ${order.customer.city}, ${order.customer.state} ${order.customer.zip_code}` : 'Ranch Pickup Location'}
              </p>
              <p className="text-stone-700">
                <strong>Scheduled Date:</strong> {order.pickup_date || order.delivery_date || 'Fall 2026 Batch'}
              </p>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="space-y-2">
            <table className="w-full text-left border-collapse border border-stone-200 text-sm">
              <thead>
                <tr className="bg-stone-100 font-serif uppercase text-xs text-stone-700 border-b border-stone-200">
                  <th className="p-3 border-r border-stone-200">Item Description</th>
                  <th className="p-3 border-r border-stone-200">Est. Weight</th>
                  <th className="p-3 border-r border-stone-200">Status</th>
                  <th className="p-3 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-stone-200">
                  <td className="p-3 font-semibold text-stone-900 border-r border-stone-200">
                    {order.beef_share}
                    <span className="block text-xs font-normal text-stone-500 mt-0.5">
                      Includes custom cutting card, 21-day dry aging, vacuum packaging, flash freezing
                    </span>
                  </td>
                  <td className="p-3 border-r border-stone-200 text-stone-700">
                    {order.estimated_weight || '200-450 lbs'}
                  </td>
                  <td className="p-3 border-r border-stone-200 text-stone-700 font-medium">
                    {order.current_status}
                  </td>
                  <td className="p-3 text-right font-bold text-stone-900">
                    ${Number(order.total_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Special Butcher Instructions */}
          {order.notes && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg space-y-1">
              <p className="text-xs font-serif uppercase tracking-wider font-bold text-amber-900">
                Custom Butcher & Cutting Notes:
              </p>
              <p className="text-xs text-amber-950 font-medium leading-relaxed">{order.notes}</p>
            </div>
          )}

          {/* Footer Signature Block */}
          <div className="pt-8 border-t border-stone-200 grid grid-cols-2 gap-8 text-xs text-stone-600">
            <div>
              <p className="font-semibold uppercase text-stone-800">Master Butcher Verification</p>
              <div className="mt-6 border-b border-stone-400 w-48" />
              <p className="text-[10px] text-stone-500 mt-1">Signature & Date</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-stone-900">Bastanzi Premium Beef Co.</p>
              <p className="text-stone-500">Thank you for supporting Texas ranching excellence.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
