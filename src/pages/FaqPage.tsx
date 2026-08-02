import { useState } from 'react';
import { FAQ_ITEMS, BUSINESS_INFO } from '../data/content';
import { Search, ChevronDown, ChevronUp, HelpCircle, Phone, Mail } from 'lucide-react';
import SeoHead from '../components/SeoHead';

interface FaqPageProps {
  setActiveTab: (tab: string) => void;
}

export default function FaqPage({ setActiveTab }: FaqPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openFaqId, setOpenFaqId] = useState<string>('faq-1');

  const categories = ['All', 'Ordering & Shares', 'Beef Quality & Finishing', 'Delivery & Shipping', 'Freezer & Storage'];

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#0a180f] text-[#f7f2e8] min-h-screen pb-20">
      <SeoHead
        title="Frequently Asked Questions (FAQ) | Bastanzi Beef Co."
        description="Get answers about ordering Bastanzi Beef Shares, freezer space requirements, 21-day dry aging, grass-fed vs grain-finished, and insulated home shipping."
      />

      {/* Header */}
      <section className="py-16 bg-[#0c1a12] border-b border-emerald-900/60 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest bg-emerald-900/60 px-3 py-1 rounded-full border border-amber-500/30">
            KNOWLEDGE BASE
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">
            Frequently Asked Questions
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto font-light">
            Everything you need to know about reserving, storing, and enjoying your pasture-raised Beef Share.
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-xl mx-auto relative">
            <Search className="w-5 h-5 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions (e.g. freezer space, shipping, dry aging)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#102218] border border-emerald-800/60 rounded-full pl-12 pr-4 py-3 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-light"
            />
          </div>
        </div>
      </section>

      {/* FAQ Main Area */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-serif transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-emerald-950 font-bold shadow-md'
                  : 'bg-[#102218] text-stone-300 hover:text-white border border-emerald-800/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordions List */}
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-[#102218] rounded-2xl border border-emerald-800/60 space-y-3">
              <HelpCircle className="w-10 h-10 text-amber-400/60 mx-auto" />
              <p className="text-stone-300 text-sm font-light">No matching questions found for "{searchQuery}".</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="text-amber-400 text-xs font-serif underline"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-[#102218] border border-emerald-800/60 hover:border-amber-500/30 rounded-xl overflow-hidden transition-all shadow-md"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? '' : faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif font-semibold text-sm sm:text-base text-amber-100 hover:text-amber-300 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-amber-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-stone-300 text-xs sm:text-sm leading-relaxed border-t border-emerald-900/60 bg-[#0c1a12] font-light">
                      <p>{faq.answer}</p>
                      <div className="mt-3 pt-2 flex items-center gap-2 text-[10px] text-amber-400/80 font-mono">
                        <span>Category: {faq.category}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact Help Banner */}
        <div className="bg-gradient-to-r from-[#07110a] via-[#102218] to-[#07110a] p-6 rounded-2xl border border-emerald-800/60 text-center space-y-3 shadow-xl">
          <h3 className="font-serif text-lg font-bold text-amber-200">Have a specific custom cutting or delivery question?</h3>
          <p className="text-stone-300 text-xs font-light">
            Our concierge team is standing by to assist with your order details.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4 text-xs font-serif">
            <a href={`tel:${BUSINESS_INFO.phone}`} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold rounded-lg flex items-center gap-1.5 shadow">
              <Phone className="w-3.5 h-3.5" />
              <span>Call {BUSINESS_INFO.phoneFormatted}</span>
            </a>
            <button
              onClick={() => setActiveTab('contact')}
              className="px-4 py-2 bg-[#12241a] hover:bg-[#182e21] text-amber-200 rounded-lg border border-emerald-800/60 flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Send Us a Message</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
