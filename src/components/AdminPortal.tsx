import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, OrderStatus } from '../types';
import {
  ShieldCheck,
  Package,
  ShoppingCart,
  Users,
  Check,
  X,
  AlertCircle,
  Plus,
  ArrowRight,
  Truck,
  TrendingUp,
  DollarSign,
  Smartphone,
  Eye,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    products,
    categories,
    orders,
    users,
    transactions,
    updateOrderStatus,
    assignOrderToDelivery,
    approveWithdrawal,
    rejectWithdrawal,
    addProduct,
    updateProduct,
    formatFCFA,
    addToast,
  } = useApp();

  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'kpi' | 'orders' | 'products' | 'withdrawals' | 'users'>('kpi');

  // Modal Ajout Produit
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdNom, setNewProdNom] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdCatId, setNewProdCatId] = useState(1);
  const [newProdPF, setNewProdPF] = useState(10000);
  const [newProdPR, setNewProdPR] = useState(13000);
  const [newProdPC, setNewProdPC] = useState(20000);
  const [newProdStock, setNewProdStock] = useState(20);
  const [newProdSeuil, setNewProdSeuil] = useState(5);
  const [newProdImg, setNewProdImg] = useState('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80');

  // Livreur selection for assignment
  const livreurs = users.filter((u) => u.role === 'LIVREUR');

  // KPIs
  const totalGMV = orders
    .filter((o) => o.statut !== 'ANNULEE' && o.statut !== 'ECHOUEE')
    .reduce((sum, o) => sum + o.montantTotal, 0);

  const totalPlatformMargin = orders
    .filter((o) => o.statut === 'LIVREE')
    .reduce((sum, o) => sum + o.totalMargePlateforme, 0);

  const totalResellerCommissions = orders
    .filter((o) => o.statut === 'LIVREE')
    .reduce((sum, o) => sum + o.totalMargeRevendeur, 0);

  const pendingWithdrawals = transactions.filter((t) => t.type === 'RETRAIT_MOBILE_MONEY' && t.statut === 'EN_ATTENTE');

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProdPF >= newProdPR || newProdPR > newProdPC) {
      addToast('La règle RM-01 doit être respectée : P_F < P_R <= P_C !', 'error');
      return;
    }

    addProduct({
      nom: newProdNom,
      sku: newProdSku.toUpperCase(),
      description: newProdDesc,
      categorieId: newProdCatId,
      fournisseurId: 5,
      prixAchatFournisseur: newProdPF,
      prixRevendeur: newProdPR,
      prixConseilleClient: newProdPC,
      stockPhysique: newProdStock,
      stockReserve: 0,
      seuilAlerte: newProdSeuil,
      imageUrl: newProdImg,
      disponible: true,
    });

    setShowAddProductModal(false);
    setNewProdNom('');
    setNewProdSku('');
    setNewProdDesc('');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Entête Admin */}
      <div className="bg-gradient-to-r from-purple-950 via-stone-900 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-purple-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Panneau d Administration Centrale • Bamako Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Supervision MaliResell
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
              Superviser les flux d affaires, attribuer les livraisons aux coursiers urbains, contrôler les stocks centraux et valider les décaissements de commissions vers les comptes Mobile Money.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white text-xs sm:text-sm shadow-md transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau Produit
            </button>
          </div>
        </div>

        {/* 4 KPIs Globaux */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-purple-800/60">
          <div className="bg-stone-950/60 p-4 rounded-xl border border-purple-600/30">
            <span className="text-xs text-stone-400 block">Volume d Affaires Global (GMV)</span>
            <span className="text-xl sm:text-2xl font-black text-white block mt-1">
              {formatFCFA(totalGMV)}
            </span>
            <span className="text-[10px] text-stone-400">Total commandes actives</span>
          </div>

          <div className="bg-stone-950/60 p-4 rounded-xl border border-purple-600/30">
            <span className="text-xs text-stone-400 block">Marge Nette Plateforme</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 block mt-1">
              {formatFCFA(totalPlatformMargin)}
            </span>
            <span className="text-[10px] text-stone-400">P_R - P_F sur commandes livrées</span>
          </div>

          <div className="bg-stone-950/60 p-4 rounded-xl border border-purple-600/30">
            <span className="text-xs text-stone-400 block">Commissions Revendeurs</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 block mt-1">
              {formatFCFA(totalResellerCommissions)}
            </span>
            <span className="text-[10px] text-stone-400">P_C - P_R versés ou crédités</span>
          </div>

          <div className="bg-stone-950/60 p-4 rounded-xl border border-purple-600/30">
            <span className="text-xs text-stone-400 block">Commandes en Cours</span>
            <span className="text-xl sm:text-2xl font-black text-cyan-400 block mt-1">
              {orders.filter((o) => o.statut !== 'LIVREE' && o.statut !== 'ANNULEE' && o.statut !== 'ECHOUEE').length}
            </span>
            <span className="text-[10px] text-stone-400">Sur {orders.length} au total</span>
          </div>
        </div>
      </div>

      {/* Sous-onglets Admin */}
      <div className="flex border-b border-stone-200 overflow-x-auto gap-2 no-scrollbar">
        <button
          onClick={() => setActiveAdminSubTab('kpi')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeAdminSubTab === 'kpi'
              ? 'border-purple-600 text-purple-900 bg-purple-50/50'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Vue d Ensemble & Alertes Stock
        </button>

        <button
          onClick={() => setActiveAdminSubTab('orders')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminSubTab === 'orders'
              ? 'border-purple-600 text-purple-900 bg-purple-50/50'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Gestion des Commandes ({orders.length})
        </button>

        <button
          onClick={() => setActiveAdminSubTab('products')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeAdminSubTab === 'products'
              ? 'border-purple-600 text-purple-900 bg-purple-50/50'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Articles & Tarifs B2B ({products.length})
        </button>

        <button
          onClick={() => setActiveAdminSubTab('withdrawals')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminSubTab === 'withdrawals'
              ? 'border-purple-600 text-purple-900 bg-purple-50/50'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Retraits Mobile Money
          {pendingWithdrawals.length > 0 && (
            <span className="bg-amber-500 text-stone-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
              {pendingWithdrawals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminSubTab('users')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeAdminSubTab === 'users'
              ? 'border-purple-600 text-purple-900 bg-purple-50/50'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Comptes & Acteurs ({users.length})
        </button>
      </div>

      {/* CONTENU : SOUS-ONGLET 1 - VUE GLOBALE & ALERTES */}
      {activeAdminSubTab === 'kpi' && (
        <div className="space-y-6">
          {/* Alertes de Stock Critique */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Surveillance des Seuils de Stock Critique
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => {
                const dispo = p.stockPhysique - p.stockReserve;
                const isCritique = dispo <= p.seuilAlerte;

                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                      isCritique ? 'bg-amber-50/70 border-amber-300' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.imageUrl}
                        alt={p.nom}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover bg-stone-200 shrink-0"
                      />
                      <div>
                        <div className="font-mono text-[10px] text-stone-400">{p.sku}</div>
                        <div className="font-bold text-stone-900 line-clamp-1">{p.nom}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Physique: <strong>{p.stockPhysique}</strong> | Réservé: <strong>{p.stockReserve}</strong> | Seuil: {p.seuilAlerte}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCritique ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {dispo} dispo
                      </span>
                      <div className="mt-1 flex items-center gap-1">
                        <button
                          onClick={() => updateProduct(p.id, { stockPhysique: p.stockPhysique + 10 })}
                          className="text-[10px] px-2 py-0.5 rounded bg-stone-200 hover:bg-stone-300 font-bold"
                        >
                          +10 réassort
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CONTENU : SOUS-ONGLET 2 - GESTION DES COMMANDES */}
      {activeAdminSubTab === 'orders' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-stone-900">
            Toutes les Commandes Plateforme ({orders.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                  <th className="p-3 font-bold">Réf & Date</th>
                  <th className="p-3 font-bold">Client & Repère</th>
                  <th className="p-3 font-bold">Revendeur</th>
                  <th className="p-3 font-bold">Livreur Assigné</th>
                  <th className="p-3 font-bold">Total Client</th>
                  <th className="p-3 font-bold">Statut Actuel</th>
                  <th className="p-3 font-bold">Action / Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/60 transition">
                    <td className="p-3">
                      <div className="font-mono font-bold text-emerald-800">{order.reference}</div>
                      <div className="text-[10px] text-stone-400">
                        {new Date(order.dateCreation).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-stone-900">{order.clientPrenom} {order.clientNom}</div>
                      <div className="text-[10px] text-stone-500 font-medium">
                        {order.commune || order.ville} • {order.clientTelephone}
                      </div>
                      <div className="text-[10px] text-amber-800 italic truncate max-w-xs mt-0.5">
                        📍 {order.repereVisuel}
                      </div>
                    </td>
                    <td className="p-3 text-stone-600">
                      {order.revendeurNom || <span className="text-stone-400">Direct Client</span>}
                      {order.totalMargeRevendeur > 0 && (
                        <div className="text-[10px] text-emerald-700 font-bold">
                          Marge: +{formatFCFA(order.totalMargeRevendeur)}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {order.livreurNom ? (
                        <span className="font-semibold text-stone-900">{order.livreurNom}</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <select
                            onChange={(e) => assignOrderToDelivery(order.id, Number(e.target.value))}
                            className="text-[11px] p-1 rounded border border-stone-300 bg-white"
                            defaultValue=""
                          >
                            <option value="" disabled>Assigner livreur...</option>
                            {livreurs.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.prenom} {l.nom} ({l.commune})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-bold text-stone-900">
                      {formatFCFA(order.montantTotal)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.statut === 'LIVREE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.statut === 'EXPEDIEE'
                            ? 'bg-blue-100 text-blue-800'
                            : order.statut === 'ECHOUEE' || order.statut === 'ANNULEE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.statut}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {order.statut === 'EN_ATTENTE' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'CONFIRMEE', 'Validée par l administration')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                          >
                            Confirmer
                          </button>
                        )}
                        {order.statut === 'CONFIRMEE' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'EN_PREPARATION', 'Emballage au hub central')}
                            className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold"
                          >
                            Préparer
                          </button>
                        )}
                        {order.statut === 'EN_PREPARATION' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'EXPEDIEE', 'Expédiée avec livreur')}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold"
                          >
                            Expédier
                          </button>
                        )}
                        {order.statut === 'EXPEDIEE' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'LIVREE', 'Livraison clôturée')}
                            className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold"
                          >
                            Livrée
                          </button>
                        )}
                        {(order.statut === 'EN_ATTENTE' || order.statut === 'CONFIRMEE') && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'ANNULEE', 'Annulée par l admin')}
                            className="px-2 py-1 border border-rose-300 text-rose-600 hover:bg-rose-50 rounded text-[10px] font-bold"
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENU : SOUS-ONGLET 3 - ARTICLES & TARIFS B2B */}
      {activeAdminSubTab === 'products' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900">
              Grille Tarifaire et Stocks (P_F, P_R, P_C)
            </h3>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs"
            >
              + Ajouter un article
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                  <th className="p-3 font-bold">SKU & Libellé</th>
                  <th className="p-3 font-bold">Prix Fournisseur (P_F)</th>
                  <th className="p-3 font-bold">Prix Revendeur (P_R)</th>
                  <th className="p-3 font-bold">Prix Conseillé Client (P_C)</th>
                  <th className="p-3 font-bold">Marge Plateforme</th>
                  <th className="p-3 font-bold">Stock Physique</th>
                  <th className="p-3 font-bold">Stock Réservé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/60 transition">
                    <td className="p-3">
                      <div className="font-bold text-stone-900">{p.nom}</div>
                      <div className="font-mono text-[10px] text-stone-400">{p.sku}</div>
                    </td>
                    <td className="p-3 text-stone-600 font-mono">{formatFCFA(p.prixAchatFournisseur)}</td>
                    <td className="p-3 font-bold text-amber-900 font-mono">{formatFCFA(p.prixRevendeur)}</td>
                    <td className="p-3 font-bold text-emerald-900 font-mono">{formatFCFA(p.prixConseilleClient)}</td>
                    <td className="p-3 font-extrabold text-purple-700 font-mono">
                      +{formatFCFA(p.prixRevendeur - p.prixAchatFournisseur)}
                    </td>
                    <td className="p-3 font-semibold text-stone-900">{p.stockPhysique}</td>
                    <td className="p-3 font-semibold text-amber-700">{p.stockReserve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENU : SOUS-ONGLET 4 - RETRAITS MOBILE MONEY */}
      {activeAdminSubTab === 'withdrawals' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-stone-900">
            Demandes de Retraits de Commissions Revendeurs
          </h3>

          {transactions.filter((t) => t.type === 'RETRAIT_MOBILE_MONEY').length === 0 ? (
            <div className="text-xs text-stone-500 py-6 text-center">
              Aucune demande de retrait pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-stone-100 text-xs">
              {transactions
                .filter((t) => t.type === 'RETRAIT_MOBILE_MONEY')
                .map((tx) => {
                  const revendeur = users.find((u) => u.id === tx.revendeurId);

                  return (
                    <div key={tx.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">
                            {formatFCFA(tx.montant)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                            {tx.operateurMobileMoney}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.statut === 'VALIDE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.statut === 'REJETE'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-stone-200 text-stone-800'
                            }`}
                          >
                            {tx.statut}
                          </span>
                        </div>
                        <div className="text-stone-600 mt-1">
                          Revendeur : <strong>{revendeur?.prenom} {revendeur?.nom}</strong> ({revendeur?.telephone})
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                          Vers numéro : {tx.numeroTelephoneMobileMoney} • Date : {new Date(tx.date).toLocaleString('fr-FR')}
                        </div>
                      </div>

                      {tx.statut === 'EN_ATTENTE' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveWithdrawal(tx.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approuver & Verser
                          </button>
                          <button
                            onClick={() => rejectWithdrawal(tx.id, 'Numéro erroné ou vérification échouée')}
                            className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center gap-1 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                            Rejeter
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* CONTENU : SOUS-ONGLET 5 - ACTEURS */}
      {activeAdminSubTab === 'users' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-stone-900">
            Comptes Utilisateurs Enregistrés ({users.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u) => (
              <div key={u.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm">
                    {u.prenom} {u.nom}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-800">
                    {u.role}
                  </span>
                </div>
                <div className="text-stone-600 font-mono">{u.telephone}</div>
                <div className="text-stone-500">{u.email}</div>
                <div className="text-stone-600 font-medium">
                  {u.commune ? `${u.commune} (${u.quartier})` : u.ville}
                </div>
                {u.soldeWallet !== undefined && (
                  <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-amber-900">
                    <span>Solde Wallet :</span>
                    <span>{formatFCFA(u.soldeWallet)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Ajout Produit */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Ajouter une Référence Produit
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nom du produit *</label>
                <input
                  type="text"
                  required
                  value={newProdNom}
                  onChange={(e) => setNewProdNom(e.target.value)}
                  placeholder="Ex: Smartphone Tecno Camon 30"
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Code SKU *</label>
                  <input
                    type="text"
                    required
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    placeholder="Ex: TEC-CAMON-30"
                    className="w-full p-2 rounded-lg border border-stone-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Catégorie *</label>
                  <select
                    value={newProdCatId}
                    onChange={(e) => setNewProdCatId(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Caractéristiques détaillées, garantie..."
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              {/* RÈGLE RM-01 : P_F < P_R <= P_C */}
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                <span className="font-bold text-purple-900 block">
                  Configuration Tarifaire Merise (Règle RM-01 : P_F &lt; P_R &le; P_C)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700">Prix Fournisseur (P_F)</label>
                    <input
                      type="number"
                      step="500"
                      required
                      value={newProdPF}
                      onChange={(e) => setNewProdPF(Number(e.target.value))}
                      className="w-full p-1.5 rounded border border-stone-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700">Prix Revendeur (P_R)</label>
                    <input
                      type="number"
                      step="500"
                      required
                      value={newProdPR}
                      onChange={(e) => setNewProdPR(Number(e.target.value))}
                      className="w-full p-1.5 rounded border border-amber-400 bg-amber-50 font-bold text-amber-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700">Prix Client (P_C)</label>
                    <input
                      type="number"
                      step="500"
                      required
                      value={newProdPC}
                      onChange={(e) => setNewProdPC(Number(e.target.value))}
                      className="w-full p-1.5 rounded border border-emerald-400 bg-emerald-50 font-bold text-emerald-950"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Stock Physique Initial</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Seuil Alerte Réappro</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProdSeuil}
                    onChange={(e) => setNewProdSeuil(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">URL Image Produit</label>
                <input
                  type="url"
                  value={newProdImg}
                  onChange={(e) => setNewProdImg(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 font-semibold text-stone-700 hover:bg-stone-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition shadow"
                >
                  Enregistrer l Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
