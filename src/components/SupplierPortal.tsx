import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Package,
  Plus,
  Clock,
  CheckCircle,
  Truck,
  DollarSign,
  AlertTriangle,
  AlertOctagon,
  MessageCircle,
  Zap,
  Wifi,
  WifiOff,
  Filter,
  CheckCircle2,
  ExternalLink,
  ArrowDownCircle,
  Layers,
} from 'lucide-react';
import { Product } from '../types';

export const SupplierPortal: React.FC = () => {
  const {
    currentUser,
    products,
    restocks,
    requestRestock,
    receiveRestock,
    formatFCFA,
    isOnline,
    isSimulatedOffline,
    openWhatsApp,
  } = useApp();

  const isOffline = !isOnline || isSimulatedOffline;

  // Filtrer les produits du fournisseur connecté ou afficher tous pour l'ADMIN
  const myProducts = products.filter(
    (p) => p.fournisseurId === currentUser.id || currentUser.role === 'ADMIN'
  );

  // Détection des produits avec niveau de stock critique
  // stockDisponible = stockPhysique - stockReserve
  // Critique si stockDisponible <= seuilAlerte
  const criticalProducts = myProducts.filter((p) => {
    const dispo = p.stockPhysique - p.stockReserve;
    return dispo <= p.seuilAlerte;
  });

  const [selectedProdId, setSelectedProdId] = useState<number>(
    criticalProducts[0]?.id || myProducts[0]?.id || 1
  );
  const [restockQty, setRestockQty] = useState<number>(25);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'CONFORT'>('ALL');
  const [highlightForm, setHighlightForm] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  // Total en cours de réassort
  const pendingRestocks = restocks.filter(
    (r) =>
      r.statut === 'EN_TRANSIT' &&
      (r.fournisseurId === currentUser.id || currentUser.role === 'ADMIN')
  );

  // Valeur totale stock P_F
  const totalStockPF = myProducts.reduce(
    (acc, p) => acc + p.stockPhysique * p.prixAchatFournisseur,
    0
  );

  const handleSendRestock = (e: React.FormEvent) => {
    e.preventDefault();
    requestRestock(selectedProdId, restockQty);
  };

  // Action rapide : Pré-remplir le réassort express pour un produit critique
  const handleQuickRestock = (prod: Product) => {
    setSelectedProdId(prod.id);
    const suggested = Math.max(prod.seuilAlerte * 3, 20);
    setRestockQty(suggested);
    setHighlightForm(true);
    setTimeout(() => setHighlightForm(false), 2000);

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Alerter la logistique Bamako sur WhatsApp pour un produit en rupture/seuil critique
  const handleWhatsAppAlert = (prod: Product) => {
    const dispo = prod.stockPhysique - prod.stockReserve;
    const isRupture = dispo <= 0;
    const msg = isRupture
      ? `🚨 ALERTE RUPTURE STOCK HUB BAMAKO !\nBonjour Logistique MaliResell, je suis le fournisseur ${currentUser.nomEntreprise || currentUser.nom}.\nL article ${prod.nom} (SKU: ${prod.sku}) est en rupture totale (0 disponible au Hub, seuil d alerte: ${prod.seuilAlerte}).\nJe prépare une expédition urgente de réassort.`
      : `⚠️ ALERTE STOCK CRITIQUE HUB BAMAKO !\nBonjour Logistique MaliResell, je suis le fournisseur ${currentUser.nomEntreprise || currentUser.nom}.\nL article ${prod.nom} (SKU: ${prod.sku}) a atteint son niveau critique : il ne reste que ${dispo} unité(s) disponibles au Hub (seuil minimum d alerte : ${prod.seuilAlerte}).\nMerci de me confirmer la disponibilité d un quai de déchargement à Hamdallaye ACI 2000.`;
    openWhatsApp(msg);
  };

  // Produits filtrés selon l'onglet actif
  const displayedProducts = myProducts.filter((p) => {
    const dispo = p.stockPhysique - p.stockReserve;
    if (activeFilter === 'CRITICAL') return dispo <= p.seuilAlerte;
    if (activeFilter === 'CONFORT') return dispo > p.seuilAlerte;
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Entête Espace Fournisseur & Statut Connexion */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-sky-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-blue-800/60 relative overflow-hidden">
        {/* Motif décoratif en arrière-plan */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-300">
              <span className="flex items-center gap-1.5 bg-blue-900/60 px-2.5 py-1 rounded-full border border-blue-700/50">
                <Building2 className="w-3.5 h-3.5" />
                Portail Grossiste & Fournisseur Agréé
              </span>

              {/* Indicateur Mode Hors Ligne / En Ligne */}
              {isOffline ? (
                <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/40 text-[11px] font-bold animate-pulse">
                  <WifiOff className="w-3.5 h-3.5" />
                  Mode Hors Ligne (Sauvegarde locale active)
                </span>
              ) : (
                <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/40 text-[11px] font-medium">
                  <Wifi className="w-3.5 h-3.5" />
                  Connecté au Hub Bamako (Firestore Sync)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {currentUser.nomEntreprise || `${currentUser.prenom} ${currentUser.nom}`}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Supervisez les stocks en direct à l entrepôt d ACI 2000 Bamako, recevez les alertes automatiques dès qu une référence atteint son seuil de sécurité, et déclarez vos expéditions de réapprovisionnement.
            </p>
          </div>

          {/* Bouton d'assistance WhatsApp Logistique */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() =>
                openWhatsApp(
                  `Bonjour Hub Logistique MaliResell (Bamako), je suis le grossiste ${currentUser.nomEntreprise || currentUser.nom}. Je souhaite faire le point sur mes approvisionnements et réassorts.`
                )
              }
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              WhatsApp Logistique Hub (+223 70 00 00 00)
            </button>
          </div>
        </div>
      </div>

      {/* Cartes Métriques Clés Fournisseur */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Références */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Références Actives</p>
            <h3 className="text-2xl font-black text-stone-900 mt-1">{myProducts.length}</h3>
            <p className="text-[11px] text-stone-400 mt-0.5">Sous contrat Hub Bamako</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* PASTILLE ROUGE : Alertes Stocks Critiques */}
        <div
          onClick={() => setActiveFilter('CRITICAL')}
          className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition ${
            criticalProducts.length > 0
              ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/20 hover:bg-rose-100/60'
              : 'bg-white border-stone-200'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                Stocks Critiques
              </p>
              {criticalProducts.length > 0 && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-rose-700 mt-1 flex items-center gap-2">
              {criticalProducts.length}
              {criticalProducts.length > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                  Alerte Active
                </span>
              )}
            </h3>
            <p className="text-[11px] text-rose-600/90 mt-0.5">
              {criticalProducts.length > 0
                ? 'Réassort urgent conseillé'
                : 'Tous les stocks sont au-dessus du seuil'}
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              criticalProducts.length > 0 ? 'bg-rose-600 text-white animate-pulse' : 'bg-stone-100 text-stone-400'
            }`}
          >
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        {/* Expéditions en Transit */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Réassorts en Transit</p>
            <h3 className="text-2xl font-black text-stone-900 mt-1">{pendingRestocks.length}</h3>
            <p className="text-[11px] text-stone-400 mt-0.5">En cours d acheminement</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* Valeur Stock P_F */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Valeur Stock Hub (P_F)</p>
            <h3 className="text-lg sm:text-xl font-black text-blue-900 mt-1 font-mono">
              {formatFCFA(totalStockPF)}
            </h3>
            <p className="text-[11px] text-stone-400 mt-0.5">Capital grossiste stocké</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* BANNIÈRE D'ALERTE ROUGE SI PRODUITS CRITIQUES */}
      {criticalProducts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white p-5 rounded-2xl shadow-lg border border-rose-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white/20 shrink-0 mt-0.5">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                Alerte de Réapprovisionnement Immédiat ({criticalProducts.length} référence{criticalProducts.length > 1 ? 's' : ''} concernée{criticalProducts.length > 1 ? 's' : ''})
              </h3>
              <p className="text-xs text-rose-100 mt-0.5 leading-relaxed max-w-2xl">
                Le stock disponible au Hub de Bamako est inférieur ou égal au seuil de sécurité minimum. Pour éviter d interrompre les ventes des revendeurs, veuillez initier un réassort express ou avertir le coordinateur logistique.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => setActiveFilter('CRITICAL')}
              className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-white text-rose-900 font-bold text-xs hover:bg-rose-50 transition shadow-sm"
            >
              Afficher les {criticalProducts.length} articles en alerte
            </button>
            <button
              onClick={() => {
                const names = criticalProducts.map((p) => `${p.nom} (SKU: ${p.sku})`).join(', ');
                openWhatsApp(
                  `Bonjour Hub Logistique Bamako, je suis ${currentUser.nomEntreprise || currentUser.nom}. Je constate un seuil de stock critique sur : ${names}. Je prépare le réassort.`
                );
              }}
              className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              Alerter sur WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Formulaire de Déclaration d'Expédition / Réassort */}
      <section
        ref={formRef}
        className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-300 shadow-sm space-y-4 ${
          highlightForm
            ? 'border-rose-500 ring-4 ring-rose-500/20 bg-rose-50/20'
            : 'border-stone-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Déclarer un Avis d Expédition / Réassort vers le Hub Central Bamako
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Notifiez l entrepôt d ACI 2000 dès que votre véhicule de livraison quitte votre entrepôt ou arrive par gare routière (Sogoniko, Djicoroni).
            </p>
          </div>

          {/* Badge Mode Hors Ligne */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-amber-800">Sauvegarde locale active (Hors ligne)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-800">Directement synchronisé Firestore</span>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSendRestock} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">Article à réapprovisionner *</label>
            <select
              value={selectedProdId}
              onChange={(e) => setSelectedProdId(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {myProducts.map((p) => {
                const dispo = p.stockPhysique - p.stockReserve;
                const isCrit = dispo <= p.seuilAlerte;
                return (
                  <option key={p.id} value={p.id}>
                    {isCrit ? '🔴 ' : '🟢 '} {p.nom} (Dispo: {dispo} | P_F: {formatFCFA(p.prixAchatFournisseur)})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1.5">Quantité expédiée (unités) *</label>
            <input
              type="number"
              min="1"
              required
              value={restockQty}
              onChange={(e) => setRestockQty(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-stone-300 font-black text-stone-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Valider l Avis d Expédition
            </button>
          </div>
        </form>
      </section>

      {/* Tableau des Références Fournies avec Système d'Alertes Visuelles (Pastilles Rouges) */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-700" />
              Catalogue Sous Contrat d Approvisionnement ({myProducts.length} référence{myProducts.length > 1 ? 's' : ''})
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Suivi précis des niveaux physiques, du stock bloqué par les commandes en cours et des seuils d alerte critique.
            </p>
          </div>

          {/* Sélecteur de Filtres (Tous / Stock Critique / Confortable) */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 self-start md:self-auto text-xs">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeFilter === 'ALL'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Toutes ({myProducts.length})
            </button>

            <button
              onClick={() => setActiveFilter('CRITICAL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'CRITICAL'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              {criticalProducts.length > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
              🔴 Stock Critique ({criticalProducts.length})
            </button>

            <button
              onClick={() => setActiveFilter('CONFORT')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeFilter === 'CONFORT'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🟢 Confortable ({myProducts.length - criticalProducts.length})
            </button>
          </div>
        </div>

        {/* Tableau Responsive */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                <th className="p-3.5 font-bold">Article & SKU</th>
                <th className="p-3.5 font-bold">Prix d Achat (P_F)</th>
                <th className="p-3.5 font-bold">Prix Revendeur (P_R)</th>
                <th className="p-3.5 font-bold">Physique au Hub</th>
                <th className="p-3.5 font-bold">Réservé Commandes</th>
                <th className="p-3.5 font-bold">Stock Net Disponible</th>
                <th className="p-3.5 font-bold text-center">Niveau d Alerte</th>
                <th className="p-3.5 font-bold text-right">Actions Réappro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-stone-500">
                    Aucune référence ne correspond au filtre sélectionné.
                  </td>
                </tr>
              ) : (
                displayedProducts.map((p) => {
                  const dispo = p.stockPhysique - p.stockReserve;
                  const isRupture = dispo <= 0;
                  const isCritical = dispo <= p.seuilAlerte;

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isRupture
                          ? 'bg-rose-100/60 border-l-4 border-l-rose-700 hover:bg-rose-100/90'
                          : isCritical
                          ? 'bg-rose-50/50 border-l-4 border-l-rose-500 hover:bg-rose-100/50'
                          : 'hover:bg-stone-50/80'
                      }`}
                    >
                      {/* SKU & Désignation */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.nom}
                            className="w-10 h-10 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                              {/* Pastille rouge clignotante à côté du titre */}
                              {isCritical && (
                                <span className="relative flex h-2.5 w-2.5 shrink-0" title="Stock critique !">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                                </span>
                              )}
                              <span>{p.nom}</span>
                            </div>
                            <div className="font-mono text-[10px] text-stone-400">{p.sku}</div>
                          </div>
                        </div>
                      </td>

                      {/* Prix Achat Fournisseur */}
                      <td className="p-3.5 font-bold text-blue-900 font-mono">
                        {formatFCFA(p.prixAchatFournisseur)}
                      </td>

                      {/* Prix Revendeur */}
                      <td className="p-3.5 text-stone-600 font-mono">
                        {formatFCFA(p.prixRevendeur)}
                      </td>

                      {/* Stock Physique */}
                      <td className="p-3.5 font-black text-stone-900">
                        {p.stockPhysique} unité{p.stockPhysique > 1 ? 's' : ''}
                      </td>

                      {/* Stock Réservé */}
                      <td className="p-3.5 text-amber-700 font-bold">
                        {p.stockReserve} unité{p.stockReserve > 1 ? 's' : ''}
                      </td>

                      {/* Stock Net Disponible */}
                      <td className="p-3.5">
                        <span
                          className={`font-black font-mono text-xs px-2 py-0.5 rounded ${
                            isRupture
                              ? 'bg-rose-600 text-white'
                              : isCritical
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {dispo} dispo
                        </span>
                      </td>

                      {/* Niveau d'Alerte Visuelle (Pastille Rouge) */}
                      <td className="p-3.5 text-center">
                        {isRupture ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-600 text-white shadow-sm animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-white"></span>
                            Rupture Immédiate (0 restant)
                          </div>
                        ) : isCritical ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            {/* Pastille rouge clignotante */}
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                            </span>
                            Stock Critique (Seuil: {p.seuilAlerte})
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Stock Confortable
                          </div>
                        )}
                      </td>

                      {/* Actions d'Urgence : Réassort Express & WhatsApp */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isCritical && (
                            <button
                              onClick={() => handleQuickRestock(p)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] transition shadow-sm flex items-center gap-1"
                              title="Pré-remplir le formulaire de réassort d'urgence"
                            >
                              <Zap className="w-3 h-3" />
                              Réassort Express
                            </button>
                          )}

                          <button
                            onClick={() => handleWhatsAppAlert(p)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] transition flex items-center gap-1"
                            title="Alerter la logistique sur WhatsApp pour cet article"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            WhatsApp Hub
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Suivi des Avis de Réassort Déclarés */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-lg font-black text-stone-900">
              Suivi des Avis d Expédition & Historique des Réceptions ({restocks.length})
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Historique des flux de marchandises envoyés à l entrepôt de Bamako.
            </p>
          </div>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          {restocks.length === 0 ? (
            <p className="py-6 text-center text-stone-500">Aucun avis de réassort déclaré pour le moment.</p>
          ) : (
            restocks.map((r) => (
              <div
                key={r.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                    <span>{r.quantite}x {r.produitNom}</span>
                    <span className="font-mono text-xs text-blue-900 font-bold">
                      ({formatFCFA(r.quantite * r.prixAchatUnitaire)})
                    </span>
                  </div>
                  <div className="text-stone-500 text-[11px] mt-0.5 flex flex-wrap items-center gap-2">
                    <span>Grossiste : {r.fournisseurNom}</span>
                    <span>•</span>
                    <span>Déclaré le {new Date(r.dateDeclaration).toLocaleDateString('fr-FR')}</span>
                    {isOffline && (
                      <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Sauvegardé en mémoire locale
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      r.statut === 'RECEPTIONNE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
                    }`}
                  >
                    {r.statut === 'RECEPTIONNE' ? '✓ Réceptionné au Hub' : '🚚 En transit vers Bamako'}
                  </span>

                  {r.statut === 'EN_TRANSIT' && (
                    <button
                      onClick={() => receiveRestock(r.id)}
                      className="px-3 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow"
                    >
                      Valider Réception Hub
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
