import React from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import {
  ShoppingBag,
  TrendingUp,
  Truck,
  ShieldCheck,
  Building2,
  Search,
  ShoppingCart,
  Phone,
  UserCheck,
  Globe,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openCart: () => void;
  openTracking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openCart,
  openTracking,
}) => {
  const {
    currentUser,
    switchRole,
    cart,
    formatFCFA,
    openAuthModal,
    openDeploymentGuide,
    handleLogout,
  } = useApp();

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const roles: { role: Role; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { role: 'CLIENT', label: 'Client', icon: ShoppingBag },
    { role: 'REVENDEUR', label: 'Revendeur', icon: TrendingUp },
    { role: 'LIVREUR', label: 'Livreur', icon: Truck },
    { role: 'FOURNISSEUR', label: 'Fournisseur', icon: Building2 },
    { role: 'ADMIN', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
      {/* Barre supérieure : Contact Bamako, Guide Déploiement & Sécurité */}
      <div className="bg-stone-900 text-stone-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-stone-300 font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            MaliResell • Plateforme Nationale
          </span>

          <span className="hidden md:inline text-stone-400 text-[11px]">
            🇲🇱 Hub Central ACI 2000 Bamako • Infoline : +223 76 00 11 22
          </span>

          <button
            onClick={openDeploymentGuide}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-semibold text-[11px] border border-emerald-600/50 shadow-sm transition"
            title="Consulter le guide complet pour déployer et sécuriser MaliResell pour le grand public"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-300" />
            <span>Guide Déploiement & Sécurité</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="hidden sm:flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Firestore Sécurisé ABAC</span>
          </span>
          <button
            onClick={() => openAuthModal('login')}
            className="text-stone-300 hover:text-white flex items-center gap-1 font-semibold"
          >
            <span>🇲🇱 Connexion Téléphone (+223)</span>
          </button>
        </div>
      </div>

      {/* Navigation principale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('client')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-amber-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-stone-900">
                  Mali<span className="text-emerald-700">Resell</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  ML
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Réseau de Revendeurs & E-commerce Malien
              </p>
            </div>
          </div>

          {/* Onglets de navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              id="tab-client-btn"
              onClick={() => setActiveTab('client')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'client'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Boutique
            </button>

            <button
              id="tab-revendeur-btn"
              onClick={() => setActiveTab('revendeur')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'revendeur'
                  ? 'bg-amber-50 text-amber-800 font-semibold ring-1 ring-amber-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-amber-600" />
              Espace Revendeur
              {currentUser.role === 'REVENDEUR' && currentUser.soldeWallet ? (
                <span className="bg-amber-200 text-amber-900 text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                  {formatFCFA(currentUser.soldeWallet)}
                </span>
              ) : null}
            </button>

            <button
              id="tab-livreur-btn"
              onClick={() => setActiveTab('livreur')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'livreur'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Truck className="w-4 h-4" />
              Espace Livreur
            </button>

            <button
              id="tab-admin-btn"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-purple-50 text-purple-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Gestion Admin
            </button>

            <button
              id="tab-fournisseur-btn"
              onClick={() => setActiveTab('fournisseur')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'fournisseur'
                  ? 'bg-blue-50 text-blue-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              Fournisseur
            </button>
          </nav>

          {/* Actions à droite : Suivi de commande & Panier */}
          <div className="flex items-center gap-2">
            <button
              id="suivi-commande-btn"
              onClick={openTracking}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-stone-700 hover:bg-stone-100 border border-stone-200 transition"
              title="Suivre une commande par sa référence (MR-...)"
            >
              <Search className="w-4 h-4 text-stone-500" />
              <span className="hidden sm:inline">Suivre Colis</span>
            </button>

            <button
              id="open-cart-btn"
              onClick={openCart}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm shadow-sm transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Panier</span>
              {cartTotalItems > 0 && (
                <span className="bg-amber-400 text-stone-950 text-xs font-black px-1.5 py-0.5 rounded-full min-w-5 text-center">
                  {cartTotalItems}
                </span>
              )}
            </button>

            {/* Bouton Authentification / Profil */}
            {currentUser.firebaseUid || currentUser.telephone ? (
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 shadow-sm">
                <div className="text-right">
                  <div className="text-xs font-bold text-stone-900 flex items-center justify-end gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{currentUser.prenom}</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                    <span>{currentUser.role}</span>
                    <span className="text-stone-400">•</span>
                    <span className="font-mono text-stone-600">{currentUser.telephone}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-stone-200 text-stone-600 hover:text-stone-900 rounded-lg transition ml-1"
                  title="Déconnexion"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition"
                title="Se connecter avec votre numéro de téléphone malien (+223)"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Connexion (+223)</span>
                <span className="sm:hidden">Connexion</span>
              </button>
            )}
          </div>
        </div>

        {/* Barre d'onglets défilante pour mobile */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-stone-100 no-scrollbar">
          <button
            onClick={() => setActiveTab('client')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'client' ? 'bg-emerald-600 text-white' : 'text-stone-600 bg-stone-100'
            }`}
          >
            Boutique
          </button>
          <button
            onClick={() => setActiveTab('revendeur')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'revendeur' ? 'bg-amber-600 text-white' : 'text-stone-600 bg-stone-100'
            }`}
          >
            Espace Revendeur
          </button>
          <button
            onClick={() => setActiveTab('livreur')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'livreur' ? 'bg-emerald-600 text-white' : 'text-stone-600 bg-stone-100'
            }`}
          >
            Livreur
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'admin' ? 'bg-purple-600 text-white' : 'text-stone-600 bg-stone-100'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setActiveTab('fournisseur')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'fournisseur' ? 'bg-blue-600 text-white' : 'text-stone-600 bg-stone-100'
            }`}
          >
            Fournisseur
          </button>
        </div>
      </div>
    </header>
  );
};
