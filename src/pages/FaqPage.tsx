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
    <div className="bg-[#0a0a0a] text-white min-h-screen pb-20">
      <SeoHead
        title="Frequently Asked Questions (FAQ) | Bastanzi Beef Co."
        description="Get answers about ordering Bastanzi Beef Shares, freezer space requirements, 21-day dry aging, grass-fed vs grain-finished, and insulated home shipping."
      />

      {/* Header */}
      <section className="py-16 bg-[#111111] border-b border-[#C5A028]/20 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-4">
          <span className="text-[10px] font-mono text-[#C5A028] uppercase tracking-[0.3em] bg-[#C5A028]/10 px-3 py-1 border border-[#C5A028]/30 inline-block">
            KNOWLEDGE BASE
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about reserving, storing, and enjoying your Montana pasture-raised Beef Share.
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-xl mx-auto relative">
            <Search className="w-4 h-4 text-[#C5A028] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions (e.g. freezer space, shipping, dry aging)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#C5A028]/30 px-4 py-3 pl-11 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C5A028]"
            />
          </div>
        </div>
      </section>

      {/* FAQ Main Area */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12 space-y-8">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition-all ${
                selectedCategory === cat
                  ? 'bg-[#C5A028] text-black font-bold'
                  : 'bg-[#111111] text-zinc-400 hover:text-white border border-[#C5A028]/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordions List */}
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-[#111111] border border-[#C5A028]/20 space-y-3">
              <HelpCircle className="w-10 h-10 text-[#C5A028]/60 mx-auto" />
              <p className="text-zinc-400 text-xs">No matching questions found for "{searchQuery}".</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="text-[#C5A028] text-xs uppercase tracking-widest font-serif underline"
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
                  className="bg-[#111111] border border-[#C5A028]/20 hover:border-[#C5A028]/50 transition-all"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? '' : faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif font-semibold text-sm text-amber-100 hover:text-[#C5A028] transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#C5A028] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-zinc-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-zinc-300 text-xs sm:text-sm leading-relaxed border-t border-[#C5A028]/20 bg-[#0a0a0a]">
                      <p>{faq.answer}</p>
                      <div className="mt-3 pt-2 flex items-center gap-2 text-[10px] text-[#C5A028] font-mono uppercase tracking-wider">
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
        <div className="bg-[#111111] p-6 border border-[#C5A028]/30 text-center space-y-3">
          <h3 className="font-serif text-lg font-bold text-amber-100">Have a specific custom cutting or delivery question?</h3>
          <p className="text-zinc-400 text-xs">
            Our Montana ranch concierge is standing by to assist with your order details.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4 text-xs">
            <a href={`tel:${BUSINESS_INFO.phone}`} className="px-4 py-2.5 bg-[#C5A028] hover:bg-[#d6af30] text-black font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              <span>Call {BUSINESS_INFO.phoneFormatted}</span>
            </a>
            <button
              onClick={() => setActiveTab('contact')}
              className="px-4 py-2.5 border border-[#C5A028]/30 text-zinc-300 hover:bg-[#151515] uppercase tracking-widest flex items-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#C5A028]" />
              <span>Send Us a Message</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
