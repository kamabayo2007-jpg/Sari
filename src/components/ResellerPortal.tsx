import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, MobileMoneyOperator } from '../types';
import {
  TrendingUp,
  Wallet,
  ArrowUpRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Share2,
  Copy,
  DollarSign,
  Package,
} from 'lucide-react';

interface ResellerPortalProps {
  onOpenCart: () => void;
}

export const ResellerPortal: React.FC<ResellerPortalProps> = ({ onOpenCart }) => {
  const {
    currentUser,
    products,
    orders,
    transactions,
    addToCart,
    requestWithdrawal,
    formatFCFA,
    addToast,
  } = useApp();

  const [simulatorProduct, setSimulatorProduct] = useState<Product>(products[0] || null);
  const [simulatorClientPrice, setSimulatorClientPrice] = useState<number>(
    products[0] ? products[0].prixConseilleClient : 10000
  );
  const [simulatorQuantity, setSimulatorQuantity] = useState<number>(1);

  // Formulaire de retrait
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(5000);
  const [withdrawOperator, setWithdrawOperator] = useState<MobileMoneyOperator>('ORANGE_MONEY');
  const [withdrawPhone, setWithdrawPhone] = useState(currentUser.telephone || '+223 76 00 00 00');

  // Commandes de ce revendeur
  const myOrders = orders.filter((o) => o.revendeurId === currentUser.id);

  // Calcul du solde en attente (commandes non encore LIVREES)
  const pendingMargin = myOrders
    .filter((o) => o.statut !== 'LIVREE' && o.statut !== 'ANNULEE' && o.statut !== 'ECHOUEE')
    .reduce((sum, o) => sum + o.totalMargeRevendeur, 0);

  // Marge encaissée totale historique
  const totalEarnedHistorical = transactions
    .filter((t) => t.revendeurId === currentUser.id && t.type === 'CREDIT_COMMISSION' && t.statut === 'VALIDE')
    .reduce((sum, t) => sum + t.montant, 0);

  const availableBalance = currentUser.soldeWallet || 0;

  // Calcul marge simulateur
  const marginPerUnit = simulatorProduct ? Math.max(0, simulatorClientPrice - simulatorProduct.prixRevendeur) : 0;
  const totalSimulatedMargin = marginPerUnit * simulatorQuantity;

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = requestWithdrawal(withdrawAmount, withdrawOperator, withdrawPhone);
    if (ok) {
      setShowWithdrawModal(false);
    }
  };

  const copyProductPitch = (product: Product) => {
    const pitch = `🔥 NOUVEAU CHEZ MALI RESELL !
📦 ${product.nom}
💰 Prix promo : ${formatFCFA(product.prixConseilleClient)}
🚚 Livraison rapide à domicile partout à Bamako !
📞 Contactez-moi par WhatsApp pour réserver votre colis : ${currentUser.telephone}`;
    navigator.clipboard.writeText(pitch);
    addToast('Texte promotionnel copié ! Collez-le sur WhatsApp ou Facebook.', 'success');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Entête du Dashboard Revendeur */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-stone-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-amber-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <TrendingUp className="w-4 h-4" />
              Espace Revendeur Indépendant • {currentUser.prenom} {currentUser.nom}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Tableau de Bord des Commissions
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
              Vendez sans stock ni capital. Vous fixez votre prix de vente client, MaliResell s occupe de la logistique et de l encaissement, et vos marges sont versées directement sur votre Mobile Money.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-stone-950 text-xs sm:text-sm shadow-md transition flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Retirer mes Gains
            </button>
            <button
              onClick={onOpenCart}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs sm:text-sm shadow-md transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Saisir une Vente Client
            </button>
          </div>
        </div>

        {/* 3 Cartes Financières */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-amber-800/60">
          <div className="bg-stone-950/50 p-4 rounded-xl border border-amber-600/30">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span>Solde Disponible (Retirable)</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
              {formatFCFA(availableBalance)}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              Commandes livrées et paiements confirmés
            </div>
          </div>

          <div className="bg-stone-950/50 p-4 rounded-xl border border-amber-600/30">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span>Gains en Cours (En transit)</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
              {formatFCFA(pendingMargin)}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              Débloqués dès que le colis passe à <em>LIVREE</em>
            </div>
          </div>

          <div className="bg-stone-950/50 p-4 rounded-xl border border-amber-600/30">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span>Total Commissions Réalisées</span>
              <ArrowUpRight className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-100 mt-2">
              {formatFCFA(totalEarnedHistorical + pendingMargin)}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              Sur {myOrders.length} commande(s) enregistrée(s)
            </div>
          </div>
        </div>
      </div>

      {/* Simulateur de Marge & Prise de Commande Rapide */}
      <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              Simulateur de Marge en Direct (Règles RM-01 à RM-03)
            </h2>
            <p className="text-xs text-stone-500">
              Déterminez votre prix de vente client et visualisez immédiatement votre gain net.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Choisir le produit :</label>
            <select
              value={simulatorProduct?.id}
              onChange={(e) => {
                const prod = products.find((p) => p.id === Number(e.target.value));
                if (prod) {
                  setSimulatorProduct(prod);
                  setSimulatorClientPrice(prod.prixConseilleClient);
                }
              }}
              className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white font-medium"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} (P_R: {formatFCFA(p.prixRevendeur)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Prix de Vente Client Fixé (FCFA) :
            </label>
            <input
              type="number"
              min={simulatorProduct?.prixRevendeur || 0}
              step="500"
              value={simulatorClientPrice}
              onChange={(e) => setSimulatorClientPrice(Number(e.target.value))}
              className="w-full text-xs p-2 rounded-lg border border-amber-400 bg-amber-50/50 font-bold text-stone-900"
            />
            <span className="text-[10px] text-stone-500">
              Min imposé : {formatFCFA(simulatorProduct?.prixRevendeur || 0)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Quantité :</label>
            <input
              type="number"
              min="1"
              max={simulatorProduct ? simulatorProduct.stockPhysique - simulatorProduct.stockReserve : 10}
              value={simulatorQuantity}
              onChange={(e) => setSimulatorQuantity(Number(e.target.value))}
              className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white font-medium"
            />
            <span className="text-[10px] text-stone-500">
              Stock dispo : {simulatorProduct ? simulatorProduct.stockPhysique - simulatorProduct.stockReserve : 0}
            </span>
          </div>

          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                Votre Marge Nette
              </span>
              <span className="text-xl font-black text-emerald-700">
                +{formatFCFA(totalSimulatedMargin)}
              </span>
            </div>
            <button
              onClick={() => {
                if (simulatorProduct) {
                  addToCart(simulatorProduct, simulatorQuantity, simulatorClientPrice);
                  onOpenCart();
                }
              }}
              className="w-full mt-2 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition"
            >
              Créer la Vente Panier
            </button>
          </div>
        </div>
      </section>

      {/* Catalogue Spécial Revendeur avec Kit Marketing WhatsApp */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Catalogue Grossiste & Outils de Vente
            </h2>
            <p className="text-xs text-stone-500">
              Copiez les argumentaires marketing et démarrez vos publications WhatsApp, Facebook et TikTok.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const potentialMargin = p.prixConseilleClient - p.prixRevendeur;
            const stockRemaining = p.stockPhysique - p.stockReserve;

            return (
              <div
                key={p.id}
                className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={p.imageUrl}
                    alt={p.nom}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-lg object-cover bg-stone-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-stone-400">{p.sku}</span>
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-2">
                      {p.nom}
                    </h4>
                    <div className="mt-1 text-xs">
                      <span className="text-stone-500">Prix grossiste : </span>
                      <strong className="text-amber-900">{formatFCFA(p.prixRevendeur)}</strong>
                    </div>
                    <div className="text-xs">
                      <span className="text-stone-500">Gain conseillé : </span>
                      <strong className="text-emerald-700">+{formatFCFA(potentialMargin)}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-stone-500">
                    Stock : <strong>{stockRemaining} unités</strong>
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => copyProductPitch(p)}
                      className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold flex items-center gap-1 transition"
                      title="Copier le texte de vente pour WhatsApp"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Kit WhatsApp
                    </button>
                    <button
                      onClick={() => {
                        addToCart(p, 1, p.prixConseilleClient);
                        onOpenCart();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition"
                    >
                      Vendre
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tableau des Commandes Revendeur */}
      <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-stone-900">
          Suivi de mes Commandes Clients ({myOrders.length})
        </h2>

        {myOrders.length === 0 ? (
          <div className="text-center py-8 text-stone-500 text-xs">
            Aucune commande enregistrée pour l instant. Saisissez votre première vente client !
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                  <th className="p-2.5 font-bold">Réf. Commande</th>
                  <th className="p-2.5 font-bold">Date</th>
                  <th className="p-2.5 font-bold">Client & Commune</th>
                  <th className="p-2.5 font-bold">Articles</th>
                  <th className="p-2.5 font-bold">Total Encaissé</th>
                  <th className="p-2.5 font-bold">Ma Marge</th>
                  <th className="p-2.5 font-bold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {myOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50/60 transition">
                    <td className="p-2.5 font-mono font-bold text-emerald-800">{o.reference}</td>
                    <td className="p-2.5 text-stone-500">
                      {new Date(o.dateCreation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-2.5">
                      <div className="font-bold text-stone-900">{o.clientPrenom} {o.clientNom}</div>
                      <div className="text-[10px] text-stone-500">{o.commune || o.ville} • {o.clientTelephone}</div>
                    </td>
                    <td className="p-2.5">
                      {o.items.map((it) => (
                        <div key={it.id} className="text-[11px] truncate max-w-xs">
                          {it.quantite}x {it.produitNom}
                        </div>
                      ))}
                    </td>
                    <td className="p-2.5 font-semibold text-stone-900">{formatFCFA(o.montantTotal)}</td>
                    <td className="p-2.5 font-extrabold text-emerald-700">
                      +{formatFCFA(o.totalMargeRevendeur)}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.statut === 'LIVREE'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : o.statut === 'EXPEDIEE'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : o.statut === 'ECHOUEE' || o.statut === 'ANNULEE'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {o.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de Retrait Mobile Money (RM-14) */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-600" />
                Retrait de Commissions Mobile Money
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Solde disponible :</span>
                <span className="font-black text-emerald-700 text-sm">
                  {formatFCFA(availableBalance)}
                </span>
              </div>
              <div className="text-[10px] text-stone-400 mt-1">
                Seuil minimal : 2 000 FCFA (Règle RM-14). Virement sous 24h ouvrées.
              </div>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Montant à retirer (FCFA) *</label>
                <input
                  type="number"
                  min="2000"
                  max={availableBalance}
                  step="500"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-stone-300 font-bold text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Opérateur de versement *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ORANGE_MONEY', 'MOOV_MONEY', 'WAVE'] as MobileMoneyOperator[]).map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setWithdrawOperator(op)}
                      className={`p-2 rounded-lg border font-bold text-center transition ${
                        withdrawOperator === op
                          ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {op === 'ORANGE_MONEY' && 'Orange'}
                      {op === 'MOOV_MONEY' && 'Moov'}
                      {op === 'WAVE' && 'Wave'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Numéro de Téléphone Mobile Money (+223) *
                </label>
                <input
                  type="text"
                  required
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  placeholder="+223 ..."
                  className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 font-semibold text-stone-700 hover:bg-stone-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={availableBalance < 2000}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold transition shadow-md"
                >
                  Confirmer le Retrait
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
