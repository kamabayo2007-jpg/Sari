import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { ClientOrdersTab } from './ClientOrdersTab';
import {
  Search,
  Check,
  ShieldAlert,
  Zap,
  Tag,
  Eye,
  ShoppingCart,
  Truck,
  RotateCcw,
  Sparkles,
  Package,
  ShoppingBag,
} from 'lucide-react';

interface ClientShopProps {
  onOpenCart: () => void;
  onOpenTracking: (ref?: string) => void;
}

export const ClientShop: React.FC<ClientShopProps> = ({ onOpenCart, onOpenTracking }) => {
  const { products, categories, addToCart, formatFCFA, currentUser, orders } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'CATALOGUE' | 'COMMANDES'>('CATALOGUE');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === null || p.categorieId === selectedCategory;
    const matchesSearch =
      p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Barre d'onglets principale de la vue Client : Catalogue vs Mes Commandes */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2 bg-stone-200/80 p-1 rounded-xl">
          <button
            id="tab-client-catalogue"
            onClick={() => setActiveSubTab('CATALOGUE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'CATALOGUE'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
            <span>Catalogue & Produits</span>
          </button>
          <button
            id="tab-client-commandes"
            onClick={() => setActiveSubTab('COMMANDES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'COMMANDES'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-700" />
            <span>Mes Commandes</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
              {orders.length}
            </span>
          </button>
        </div>

        <button
          onClick={onOpenCart}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Voir le Panier</span>
        </button>
      </div>

      {activeSubTab === 'COMMANDES' ? (
        <ClientOrdersTab
          onSelectTracking={(ref) => onOpenTracking(ref)}
          onGoToShop={() => setActiveSubTab('CATALOGUE')}
        />
      ) : (
        <>
          {/* Hero Banner Malien */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-stone-900 to-amber-950 text-white p-6 sm:p-10 shadow-xl border border-stone-800">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Vente directe & Réseau de revendeurs certifiés
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Achetez au meilleur prix à Bamako & au Mali
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Téléphonie, Bazin riche teinté, énergie solaire et cosmétiques naturels de San.
                Livraison rapide à domicile par nos livreurs dédiés avec paiement en espèces (Cash on Delivery) ou Mobile Money (Orange Money, Moov, Wave).
              </p>
              <div className="pt-2 flex flex-wrap gap-3 text-xs">
                <button
                  onClick={onOpenCart}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-md transition flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Commander maintenant
                </button>
                <button
                  onClick={() => setActiveSubTab('COMMANDES')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-white border border-white/20 transition flex items-center gap-2"
                >
                  <Package className="w-4 h-4 text-emerald-300" />
                  Voir mes commandes ({orders.length})
                </button>
                <button
                  onClick={() => onOpenTracking()}
                  className="px-4 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 font-medium text-stone-200 border border-stone-700 transition"
                >
                  Suivre un colis existant
                </button>
              </div>
            </div>

            {/* Badges de réassurance */}
            <div className="mt-8 pt-6 border-t border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Livraison Bamako sous 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Paiement Cash ou Mobile Money</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Prix direct fournisseur</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Garantie vérification au déballage</span>
              </div>
            </div>
          </section>

          {/* Barre de Recherche et Catégories */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un smartphone, bazin, ventilateur..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
                />
              </div>

              <div className="text-xs text-stone-500 font-medium">
                {filteredProducts.length} produit(s) disponible(s)
              </div>
            </div>

            {/* Pilules de catégories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === null
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Toutes les catégories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === c.id
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {c.nom}
                </button>
              ))}
            </div>
          </div>

      {/* Grille des Produits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p) => {
          const availableStock = p.stockPhysique - p.stockReserve;
          const isOutOfStock = availableStock <= 0;

          return (
            <div
              key={p.id}
              id={`product-card-${p.id}`}
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              {/* Image & Badges */}
              <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                <img
                  src={p.imageUrl}
                  alt={p.nom}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-stone-900/80 text-white backdrop-blur">
                    {categories.find((c) => c.id === p.categorieId)?.nom.split('&')[0]}
                  </span>
                  {availableStock <= p.seuilAlerte && availableStock > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-sm">
                      Plus que {availableStock} en stock
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-sm">
                      Rupture temporaire
                    </span>
                  )}
                </div>

                {/* Bouton aperçu rapide */}
                <button
                  onClick={() => setViewingProduct(p)}
                  className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-white text-stone-800 shadow-md backdrop-blur transition"
                  title="Aperçu détails"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Contenu */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[11px] font-mono text-stone-400">{p.sku}</div>
                  <h3 className="font-bold text-sm sm:text-base text-stone-900 line-clamp-2 mt-0.5">
                    {p.nom}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                {/* Tarification */}
                <div className="pt-2 border-t border-stone-100">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-stone-400 block">Prix public conseillé</span>
                      <span className="text-lg font-black text-emerald-800">
                        {formatFCFA(p.prixConseilleClient)}
                      </span>
                    </div>
                    {currentUser.role === 'REVENDEUR' && (
                      <div className="text-right">
                        <span className="text-[10px] text-amber-700 font-bold block">Prix Revendeur (P_R)</span>
                        <span className="text-xs font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                          {formatFCFA(p.prixRevendeur)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action ajout au panier */}
                  <div className="mt-3 flex gap-2">
                    <button
                      id={`add-to-cart-${p.id}`}
                      disabled={isOutOfStock}
                      onClick={() => addToCart(p, 1)}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
                        isOutOfStock
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {isOutOfStock ? 'Épuisé' : 'Ajouter au Panier'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
        </>
      )}

      {/* Modal Détail Produit */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="relative aspect-video bg-stone-100">
              <img
                src={viewingProduct.imageUrl}
                alt={viewingProduct.nom}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setViewingProduct(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-xs font-mono text-stone-400">SKU: {viewingProduct.sku}</span>
                <h3 className="text-lg font-bold text-stone-900">{viewingProduct.nom}</h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  {viewingProduct.description}
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Disponibilité immédiate :</span>
                  <span className="font-bold text-stone-900">
                    {viewingProduct.stockPhysique - viewingProduct.stockReserve} en stock au hub Bamako
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Prix client conseillé :</span>
                  <span className="font-extrabold text-emerald-800 text-sm">
                    {formatFCFA(viewingProduct.prixConseilleClient)}
                  </span>
                </div>
                {currentUser.role === 'REVENDEUR' && (
                  <div className="flex justify-between pt-1 border-t border-stone-200 text-amber-900 font-bold">
                    <span>Prix d achat revendeur (P_R) :</span>
                    <span>{formatFCFA(viewingProduct.prixRevendeur)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    addToCart(viewingProduct, 1);
                    setViewingProduct(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition"
                >
                  Ajouter au Panier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
