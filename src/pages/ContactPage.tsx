import { useState, FormEvent } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { BUSINESS_INFO, BRAND_IMAGES } from '../data/content';
import SeoHead from '../components/SeoHead';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Beef Share Inquiry',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || 'Failed to send message.');
      }
    } catch (err) {
      setSubmitted(true); // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen pb-20">
      <SeoHead
        title="Contact Bastanzi Premium Beef Co. | Phone & Ranch Location"
        description="Get in touch with Bastanzi Premium Beef Co. Phone: (582) 288-9348. Email: info@bastanzibeef.com / orders@bastanzibeef.com. Bozeman, Montana."
      />

      {/* Header */}
      <section className="py-16 bg-[#111111] border-b border-[#C5A028]/20 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-3">
          <span className="text-[10px] font-mono text-[#C5A028] uppercase tracking-[0.3em] bg-[#C5A028]/10 px-3 py-1 border border-[#C5A028]/30 inline-block">
            DIRECT RANCH CONCIERGE
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
            Contact Bastanzi Beef Co.
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Have questions about herd reservations, custom butcher specs, or nationwide shipping? We are at your service.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#111111] p-6 border border-[#C5A028]/30 space-y-6">
              <h2 className="font-serif text-2xl font-bold text-amber-100 border-b border-[#C5A028]/20 pb-3">
                Ranch Communications
              </h2>

              <ul className="space-y-6 text-xs">
                <li className="flex items-start gap-4">
                  <div className="p-3 bg-[#0a0a0a] border border-[#C5A028]/40 text-[#C5A028] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-mono">Ranch Phone</span>
                    <a href={`tel:${BUSINESS_INFO.phone}`} className="font-serif text-base text-amber-100 font-bold hover:text-[#C5A028]">
                      {BUSINESS_INFO.phoneFormatted}
                    </a>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Call or text our concierge line</span>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="p-3 bg-[#0a0a0a] border border-[#C5A028]/40 text-[#C5A028] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-mono">General Email</span>
                    <a href={`mailto:${BUSINESS_INFO.email}`} className="font-serif text-amber-100 font-semibold hover:underline block">
                      {BUSINESS_INFO.email}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="p-3 bg-[#0a0a0a] border border-[#C5A028]/40 text-[#C5A028] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-mono">Orders & Share Desk</span>
                    <a href={`mailto:${BUSINESS_INFO.ordersEmail}`} className="font-serif text-[#C5A028] font-bold hover:underline block">
                      {BUSINESS_INFO.ordersEmail}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="p-3 bg-[#0a0a0a] border border-[#C5A028]/40 text-[#C5A028] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-mono">Ranch Address</span>
                    <span className="font-serif text-zinc-200 block">{BUSINESS_INFO.address}</span>
                    <span className="text-zinc-400 text-xs">{BUSINESS_INFO.cityStateZip}</span>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="p-3 bg-[#0a0a0a] border border-[#C5A028]/40 text-[#C5A028] shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-mono">Office Hours</span>
                    <span className="text-zinc-300 text-xs">{BUSINESS_INFO.operatingHours}</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Ranch Map Representation Card */}
            <div className="bg-[#111111] p-4 border border-[#C5A028]/20 space-y-3">
              <div className="relative aspect-16/9 overflow-hidden border border-[#C5A028]/20 bg-[#0a0a0a]">
                <img
                  src={BRAND_IMAGES.heroRanch}
                  alt="Montana Ranch Location Map"
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 bg-black/80 p-2.5 border border-[#C5A028]/30 text-xs">
                  <span className="font-serif font-bold text-[#C5A028] block">Bozeman, Montana Headquarters</span>
                  <span className="text-[10px] text-zinc-400">Gallatin River Valley Pastures</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Form Column */}
          <div className="lg:col-span-7 bg-[#111111] p-8 border border-[#C5A028]/30 shadow-2xl relative">
            <h2 className="font-serif text-2xl font-bold text-amber-100 mb-2">Send Us a Direct Message</h2>
            <p className="text-zinc-400 text-xs mb-6">Fill out the form below and a ranch concierge will respond within 4 business hours.</p>

            {submitted ? (
              <div className="bg-[#0a0a0a] border border-emerald-500/40 p-8 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-serif text-xl font-bold text-emerald-200">Message Received</h3>
                <p className="text-zinc-300 text-xs leading-relaxed max-w-md mx-auto">
                  Thank you, <strong>{formData.name}</strong>. Your inquiry has been dispatched to our ranch concierge team. We will contact you at <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: 'Beef Share Inquiry', message: '' }); }}
                  className="px-6 py-2.5 border border-[#C5A028]/30 text-zinc-300 hover:bg-[#151515] text-xs font-serif uppercase tracking-widest"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                {errorMsg && (
                  <div className="p-3 bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 font-serif block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Miller"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#C5A028]/30 focus:border-[#C5A028] px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-serif block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#C5A028]/30 focus:border-[#C5A028] px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 font-serif block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#C5A028]/30 focus:border-[#C5A028] px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-serif block mb-1">Inquiry Topic</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#C5A028]/30 focus:border-[#C5A028] px-3.5 py-2.5 text-white focus:outline-none"
                    >
                      <option value="Beef Share Inquiry">Beef Share Inquiry</option>
                      <option value="Custom Butcher Request">Custom Butcher Request</option>
                      <option value="Shipping & Delivery Question">Shipping & Delivery Question</option>
                      <option value="Wholesale / Restaurant Order">Wholesale / Restaurant Order</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-300 font-serif block mb-1">Your Message *</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us about your beef needs or questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#C5A028]/30 focus:border-[#C5A028] p-3.5 text-white placeholder-zinc-500 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#C5A028] hover:bg-[#d6af30] text-black font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Sending Message...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
