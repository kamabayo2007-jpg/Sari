import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HelpCircle,
  ChevronDown,
  Truck,
  CreditCard,
  ShieldCheck,
  RefreshCw,
  PhoneCall,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export const FaqSection: React.FC = () => {
  const { faqs, isCloudConnected } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'TOUS' | 'LIVRAISON' | 'PAIEMENT' | 'REVENDEUR'>('TOUS');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const filteredFaqs = faqs.filter((item) => {
    if (selectedCategory === 'TOUS') return true;
    return item.categorie === selectedCategory;
  });

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'LIVRAISON':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <Truck className="w-3 h-3 text-emerald-700" />
            Livraison Mali
          </span>
        );
      case 'PAIEMENT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <CreditCard className="w-3 h-3 text-amber-700" />
            Paiement & Espèces
          </span>
        );
      case 'REVENDEUR':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3 text-blue-700" />
            Revendeurs & Commissions
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section id="faq-section" className="border-t border-stone-800 bg-stone-900/95 text-stone-200 pt-10 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Entête de la FAQ */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <HelpCircle className="w-5 h-5" />
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Questions Fréquentes • Livraisons & Paiements au Mali
              </h3>
            </div>
            <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
              Toutes les réponses indispensables pour commander en toute tranquillité à Bamako et dans les régions du Mali (espèces, Orange Money, Wave et suivi des colis).
            </p>
          </div>

          {/* Filtres par thématique */}
          <div className="flex items-center gap-1.5 bg-stone-800/90 p-1 rounded-xl border border-stone-700 text-xs self-start sm:self-auto">
            <button
              id="faq-filter-all"
              onClick={() => setSelectedCategory('TOUS')}
              className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                selectedCategory === 'TOUS'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
            >
              Toutes
            </button>
            <button
              id="faq-filter-livraison"
              onClick={() => setSelectedCategory('LIVRAISON')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                selectedCategory === 'LIVRAISON'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Livraisons
            </button>
            <button
              id="faq-filter-paiement"
              onClick={() => setSelectedCategory('PAIEMENT')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                selectedCategory === 'PAIEMENT'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Paiements
            </button>
            <button
              id="faq-filter-revendeur"
              onClick={() => setSelectedCategory('REVENDEUR')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                selectedCategory === 'REVENDEUR'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Revendeurs
            </button>
          </div>
        </div>

        {/* Liste accordéon des questions-réponses connectée à Firestore */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                id={`faq-card-${faq.id}`}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-stone-800/80 border-emerald-500/40 shadow-sm'
                    : 'bg-stone-800/40 border-stone-700/60 hover:border-stone-600 hover:bg-stone-800/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left p-4 flex items-start justify-between gap-3"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1.5 pr-2">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(faq.categorie)}
                    </div>
                    <h4 className="text-sm font-bold text-stone-100 leading-snug">
                      {faq.question}
                    </h4>
                  </div>
                  <span
                    className={`p-1.5 rounded-lg bg-stone-700/60 text-stone-300 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-400 bg-emerald-500/20' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-stone-300 leading-relaxed border-t border-stone-700/40 space-y-2">
                    <p>{faq.reponse}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Règle validée pour l écosystème commercial malien</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pied de FAQ : contact direct pour cas particulier */}
        <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-stone-300">
            <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Une question spécifique sur votre quartier ou votre colis ? Appelez notre assistance à Bamako :{' '}
              <strong className="text-white font-mono">+223 70 00 00 00</strong> (ou par WhatsApp).
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-stone-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Données Firestore synchronisées en direct</span>
          </div>
        </div>
      </div>
    </section>
  );
};
