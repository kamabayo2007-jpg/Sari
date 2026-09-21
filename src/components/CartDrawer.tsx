import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import { BAMAKO_COMMUNES, MALI_VILLES } from '../data/initialData';
import {
  X,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  MapPin,
  Phone,
  Banknote,
  Smartphone,
  ShieldAlert,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: (orderRef: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onOrderCreated }) => {
  const {
    cart,
    updateCartQuantity,
    updateCartPriceClient,
    removeFromCart,
    clearCart,
    createOrder,
    currentUser,
    formatFCFA,
  } = useApp();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [clientNom, setClientNom] = useState('Diarra');
  const [clientPrenom, setClientPrenom] = useState('Salif');
  const [clientTelephone, setClientTelephone] = useState('+223 76 12 34 56');
  const [clientTelephone2, setClientTelephone2] = useState('+223 65 99 88 77');
  const [ville, setVille] = useState('Bamako');
  const [commune, setCommune] = useState('Commune IV (Hamdallaye ACI 2000, Lafiabougou, Sebénikoro...)');
  const [quartier, setQuartier] = useState('Hamdallaye ACI 2000');
  const [repereVisuel, setRepereVisuel] = useState('À 50m après la Pharmacie de la Paix, grand portail marron');
  const [modePaiement, setModePaiement] = useState<PaymentMethod>('ESPECES_LIVRAISON');
  const [createdOrderRef, setCreatedOrderRef] = useState<string | null>(null);

  if (!isOpen) return null;

  const isRevendeur = currentUser.role === 'REVENDEUR';

  const subtotal = cart.reduce((sum, item) => {
    const price = isRevendeur && item.customPriceClient ? item.customPriceClient : item.product.prixConseilleClient;
    return sum + price * item.quantity;
  }, 0);

  const totalRevendeurCost = cart.reduce((sum, item) => sum + item.product.prixRevendeur * item.quantity, 0);
  const estimatedRevendeurMargin = Math.max(0, subtotal - totalRevendeurCost);

  const deliveryFee = ville.toLowerCase().includes('bamako') ? 1500 : 3000;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repereVisuel.trim()) {
      alert('Le point de repère visuel est obligatoire pour la livraison au Mali.');
      return;
    }

    const order = createOrder({
      clientNom,
      clientPrenom,
      clientTelephone,
      clientTelephone2,
      ville,
      commune,
      quartier,
      repereVisuel,
      modePaiement,
      isRevendeurSale: isRevendeur,
    });

    if (order) {
      setCreatedOrderRef(order.reference);
      if (onOrderCreated) onOrderCreated(order.reference);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Entête */}
        <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              {isCheckingOut ? 'Finaliser la Commande' : 'Mon Panier'}
              {isRevendeur && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  Mode Revendeur
                </span>
              )}
            </h2>
            <p className="text-xs text-stone-500">
              {cart.length} article(s) sélectionné(s)
            </p>
          </div>
          <button
            id="close-cart-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {createdOrderRef ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">
                Commande Confirmée avec Succès !
              </h3>
              <div className="bg-stone-100 p-4 rounded-xl border border-stone-300 text-center font-mono">
                <span className="text-xs text-stone-500 block">Référence unique :</span>
                <span className="text-lg font-black text-emerald-800 tracking-wider">
                  {createdOrderRef}
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed px-4">
                La commande a été transmise à l entrepôt central de Bamako. Un livreur prendra contact au numéro{' '}
                <strong>{clientTelephone}</strong> pour convenir du créneau de remise.
              </p>
              {isRevendeur && estimatedRevendeurMargin > 0 && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 font-medium">
                  💰 Marge estimée : <strong>+{formatFCFA(estimatedRevendeurMargin)}</strong> (créditée sur votre Wallet dès que la commande sera livrée).
                </div>
              )}
              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setCreatedOrderRef(null);
                    setIsCheckingOut(false);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-16 text-stone-400 space-y-3">
              <div className="text-4xl">🛒</div>
              <p className="text-sm font-medium text-stone-600">Votre panier est actuellement vide.</p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition"
              >
                Découvrir les produits
              </button>
            </div>
          ) : isCheckingOut ? (
            /* FORMULAIRE DE CHECKOUT ADAPTÉ AU MALI */
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Adressage Bamako & Régions :</strong> Précisez impérativement un point de repère visuel (mosquée, station, pharmacie, boutique).
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Nom du client *</label>
                  <input
                    type="text"
                    required
                    value={clientNom}
                    onChange={(e) => setClientNom(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={clientPrenom}
                    onChange={(e) => setClientPrenom(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Téléphone 1 (Appel/WhatsApp) *</label>
                  <input
                    type="text"
                    required
                    value={clientTelephone}
                    onChange={(e) => setClientTelephone(e.target.value)}
                    placeholder="+223 ..."
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Téléphone 2 (Secours)</label>
                  <input
                    type="text"
                    value={clientTelephone2}
                    onChange={(e) => setClientTelephone2(e.target.value)}
                    placeholder="+223 ..."
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Ville *</label>
                  <select
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    {MALI_VILLES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Commune *</label>
                  <select
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    {BAMAKO_COMMUNES.map((c) => (
                      <option key={c} value={c}>
                        {c.split('(')[0].trim()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Quartier *</label>
                <input
                  type="text"
                  required
                  value={quartier}
                  onChange={(e) => setQuartier(e.target.value)}
                  placeholder="Ex: Lafiabougou, Baco-Djicoroni, Faladié..."
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Point de repère visuel précis (Obligatoire) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={repereVisuel}
                  onChange={(e) => setRepereVisuel(e.target.value)}
                  placeholder="Ex: Face à la mosquée, porte verte en fer, après le goudron..."
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Mode de règlement */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Mode de Paiement</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModePaiement('ESPECES_LIVRAISON')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition ${
                      modePaiement === 'ESPECES_LIVRAISON'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-600'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    <div>
                      <div className="text-xs font-bold">Espèces (COD)</div>
                      <div className="text-[10px] text-stone-500">À la remise du colis</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModePaiement('ORANGE_MONEY')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition ${
                      modePaiement === 'ORANGE_MONEY'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-600'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-orange-600" />
                    <div>
                      <div className="text-xs font-bold">Orange Money</div>
                      <div className="text-[10px] text-stone-500">*144# Mali</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModePaiement('WAVE')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition ${
                      modePaiement === 'WAVE'
                        ? 'border-cyan-600 bg-cyan-50 text-cyan-950 font-bold ring-1 ring-cyan-600'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-cyan-500 text-white font-black text-[10px] flex items-center justify-center">W</span>
                    <div>
                      <div className="text-xs font-bold">Wave Mali</div>
                      <div className="text-[10px] text-stone-500">Paiement instantané</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModePaiement('MOOV_MONEY')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition ${
                      modePaiement === 'MOOV_MONEY'
                        ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold ring-1 ring-blue-600'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs font-bold">Moov Money</div>
                      <div className="text-[10px] text-stone-500">*166# Flooz</div>
                    </div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* LISTE DES ARTICLES DANS LE PANIER */
            <div className="space-y-3">
              {cart.map((item) => {
                const p = item.product;
                const clientPrice = isRevendeur && item.customPriceClient ? item.customPriceClient : p.prixConseilleClient;
                const lineTotal = clientPrice * item.quantity;
                const unitMargin = isRevendeur ? clientPrice - p.prixRevendeur : 0;

                return (
                  <div
                    key={p.id}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col gap-2"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={p.imageUrl}
                        alt={p.nom}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover bg-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate">{p.nom}</h4>
                        <div className="text-[10px] text-stone-500 font-mono">SKU: {p.sku}</div>

                        {/* Si mode revendeur : affichage prix revendeur et fixation prix client */}
                        {isRevendeur ? (
                          <div className="mt-1 space-y-1">
                            <div className="text-[11px] text-stone-600">
                              Prix grossiste : <span className="font-semibold text-stone-900">{formatFCFA(p.prixRevendeur)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <label className="text-[10px] font-bold text-amber-800">
                                Prix client :
                              </label>
                              <input
                                type="number"
                                min={p.prixRevendeur}
                                step="500"
                                value={clientPrice}
                                onChange={(e) => updateCartPriceClient(p.id, Number(e.target.value))}
                                className="w-24 text-xs font-bold py-0.5 px-1.5 rounded border border-amber-400 bg-amber-50 focus:ring-1 focus:ring-amber-500"
                              />
                            </div>
                            {unitMargin > 0 && (
                              <div className="text-[10px] text-emerald-700 font-bold">
                                Marge : +{formatFCFA(unitMargin * item.quantity)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs font-bold text-emerald-800 mt-1">
                            {formatFCFA(clientPrice)}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(p.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Contrôles quantité */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(p.id, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-stone-200 hover:bg-stone-300 flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(p.id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-stone-200 hover:bg-stone-300 flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="font-bold text-stone-900">
                        Total : {formatFCFA(lineTotal)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pied de page avec total et boutons d'action */}
        {!createdOrderRef && cart.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-stone-200 bg-stone-50 space-y-3">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Sous-total articles :</span>
                <span className="font-semibold text-stone-900">{formatFCFA(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de livraison estimés :</span>
                <span className="font-semibold text-stone-900">{formatFCFA(deliveryFee)}</span>
              </div>

              {isRevendeur && (
                <div className="flex justify-between pt-1 border-t border-amber-200 text-amber-900 font-bold">
                  <span>Votre Marge Revendeur Totale :</span>
                  <span className="text-emerald-700">+{formatFCFA(estimatedRevendeurMargin)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm sm:text-base font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total à Payer :</span>
                <span className="text-emerald-800">{formatFCFA(grandTotal)}</span>
              </div>
            </div>

            {isCheckingOut ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-100 transition"
                >
                  Retour Panier
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  className="flex-[2] py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs sm:text-sm hover:bg-emerald-800 shadow-md transition flex items-center justify-center gap-2"
                >
                  Confirmer la Commande
                </button>
              </div>
            ) : (
              <button
                id="proceed-checkout-btn"
                onClick={() => setIsCheckingOut(true)}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                Passer la commande ({formatFCFA(grandTotal)})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
