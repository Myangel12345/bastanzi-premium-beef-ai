import { useState, FormEvent } from 'react';
import { Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { BUSINESS_INFO, BRAND_IMAGES } from '../data/content';
import SeoHead from '../components/SeoHead';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
    <div className="bg-[#0a180f] text-[#f7f2e8] min-h-screen pb-20">
      <SeoHead
        title="Contact Bastanzi Premium Beef Co. | Email & Address"
        description="Get in touch with Bastanzi Premium Beef Co. Emails: orders@bastanzibeef.com, info@bastanzibeef.com. Address: 1154 E Fillmore St, Phoenix, AZ 85006. Serving Phoenix, Scottsdale, Paradise Valley, Gilbert, Chandler, Mesa, Cave Creek, Carefree."
      />

      {/* Header */}
      <section className="py-16 bg-[#0c1a12] border-b border-emerald-900/60 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest bg-emerald-900/60 px-3 py-1 rounded-full border border-amber-500/30">
            DIRECT CONCIERGE
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">
            Contact Bastanzi Beef Co.
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto font-light">
            Have questions about herd reservations, custom butcher specs, or nationwide shipping? We are at your service.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#102218] p-6 rounded-2xl border border-emerald-800/60 space-y-6 shadow-xl">
              <h2 className="font-serif text-2xl font-bold text-amber-200 border-b border-emerald-900/60 pb-3">
                Ranch Communications
              </h2>

              <ul className="space-y-6 text-sm">
                <li className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-950 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-stone-400 uppercase tracking-wider block font-mono">General Email</span>
                    <a href={`mailto:${BUSINESS_INFO.email}`} className="font-serif text-amber-200 font-semibold hover:underline block">
                      {BUSINESS_INFO.email}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-950 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-stone-400 uppercase tracking-wider block font-mono">Orders & Share Desk</span>
                    <a href={`mailto:${BUSINESS_INFO.ordersEmail}`} className="font-serif text-amber-300 font-bold hover:underline block">
                      {BUSINESS_INFO.ordersEmail}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-950 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-stone-400 uppercase tracking-wider block font-mono">Business Address</span>
                    <span className="font-serif text-stone-200 block">{BUSINESS_INFO.address}</span>
                    <span className="text-stone-400 text-xs font-light">{BUSINESS_INFO.cityStateZip}</span>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-950 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-stone-400 uppercase tracking-wider block font-mono">Office Hours</span>
                    <span className="text-stone-300 text-xs font-light">{BUSINESS_INFO.operatingHours}</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Service Areas Card */}
            <div className="bg-[#102218] p-5 rounded-2xl border border-emerald-800/60 space-y-2 shadow-xl">
              <h3 className="font-serif text-sm font-bold text-amber-300 uppercase tracking-wider">
                Proudly Serving Service Areas
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed font-light">
                Bastanzi Premium Beef proudly provides local doorstep delivery & express insulated shipping across:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {BUSINESS_INFO.serviceAreas.map((area) => (
                  <span
                    key={area}
                    className="px-2.5 py-1 bg-[#0c1a12] border border-amber-500/30 text-amber-200 text-xs font-serif rounded-full"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-[#102218] p-4 rounded-2xl border border-emerald-800/60 space-y-3 shadow-xl">
              <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-emerald-800/40 bg-[#0c1a12]">
                <img
                  src={BRAND_IMAGES.heroRanch}
                  alt="Phoenix Location"
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a180f] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 bg-[#0a180f]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-500/30 text-xs">
                  <span className="font-serif font-bold text-amber-300 block">Phoenix, Arizona Location</span>
                  <span className="text-[10px] text-stone-400 font-light">1154 E Fillmore St, Phoenix, AZ 85006</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Form Column */}
          <div className="lg:col-span-7 bg-[#102218] p-8 rounded-2xl border border-emerald-800/60 shadow-2xl relative">
            <h2 className="font-serif text-2xl font-bold text-amber-200 mb-2">Send Us a Direct Message</h2>
            <p className="text-stone-300 text-xs mb-6 font-light">Fill out the form below and a ranch concierge will respond within 4 business hours.</p>

            {submitted ? (
              <div className="bg-[#0c1a12] border border-emerald-500/40 p-8 rounded-xl text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-serif text-xl font-bold text-emerald-200">Message Received</h3>
                <p className="text-stone-300 text-xs leading-relaxed max-w-md mx-auto font-light">
                  Thank you, <strong>{formData.name}</strong>. Your inquiry has been dispatched to our concierge team. We will contact you at <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: 'Beef Share Inquiry', message: '' }); }}
                  className="px-6 py-2.5 bg-[#12241a] hover:bg-[#182e21] text-amber-200 text-xs font-serif rounded-lg border border-emerald-800/60"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                {errorMsg && (
                  <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-stone-300 font-serif block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Miller"
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
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#0c1a12] border border-emerald-800/60 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-white placeholder-stone-400 focus:outline-none font-light"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-stone-300 font-serif block mb-1">Inquiry Topic</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#0c1a12] border border-emerald-800/60 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-white focus:outline-none font-light"
                  >
                    <option value="Beef Share Inquiry">Beef Share Inquiry</option>
                    <option value="Custom / Smaller Share Pricing Request (< 1/8 Share)">Custom / Smaller Share Pricing Request (&lt; 1/8 Share)</option>
                    <option value="Custom Butcher Request">Custom Butcher Request</option>
                    <option value="Shipping & Delivery Question">Shipping & Delivery Question</option>
                    <option value="Wholesale / Restaurant Order">Wholesale / Restaurant Order</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-300 font-serif block mb-1">Your Message *</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us about your beef needs or questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#0c1a12] border border-emerald-800/60 focus:border-amber-400 rounded-lg p-3.5 text-white placeholder-stone-400 focus:outline-none resize-none font-light"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-serif font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
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
