import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ClientShop } from './components/ClientShop';
import { ResellerPortal } from './components/ResellerPortal';
import { AdminPortal } from './components/AdminPortal';
import { DeliveryPortal } from './components/DeliveryPortal';
import { SupplierPortal } from './components/SupplierPortal';
import { CartDrawer } from './components/CartDrawer';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { ToastContainer } from './components/ToastContainer';
import { FaqSection } from './components/FaqSection';
import { OfflineIndicatorBanner } from './components/OfflineIndicatorBanner';
import { WhatsAppChatModal } from './components/WhatsAppChatModal';
import { AuthModal } from './components/AuthModal';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import { AccessDeniedCard } from './components/AccessDeniedCard';
import {
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  Truck,
  Building2,
  MapPin,
  Phone,
  Clock,
  Wifi,
  WifiOff,
  MessageCircle,
  Globe,
  Key,
  Smartphone,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    users,
    cart,
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    pendingOfflineCount,
    openWhatsApp,
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    isDeploymentGuideOpen,
    closeDeploymentGuide,
    openDeploymentGuide,
    openAuthModal,
  } = useApp();
  const [activeTab, setActiveTab] = useState<string>('client');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [activeTrackingRef, setActiveTrackingRef] = useState<string>('');

  const handleOrderCreated = (orderRef: string) => {
    setActiveTrackingRef(orderRef);
    setIsTrackingOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-emerald-800 selection:text-white">
      {/* Bannière Mode Hors Ligne (si hors ligne réel ou simulé) */}
      <OfflineIndicatorBanner />

      {/* Barre de navigation principale */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
        }}
        openCart={() => setIsCartOpen(true)}
        openTracking={() => setIsTrackingOpen(true)}
      />

      {/* Sélecteur Rapide de Rôles Cloisonnés */}
      <div className="bg-stone-900 text-stone-200 border-b border-stone-800 py-2.5 px-4 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold text-stone-300">
              Espace actif : <strong className="text-white">{currentUser.prenom} {currentUser.nom}</strong> ({currentUser.role})
            </span>
            {currentUser.firebaseUid && (
              <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-700 font-mono">
                Auth Firebase
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
            <span className="text-stone-400 text-[11px] hidden md:inline mr-1">Rôles tests :</span>

            <button
              onClick={() => {
                const u = users.find((x) => x.role === 'CLIENT');
                if (u) setCurrentUser(u);
                setActiveTab('client');
              }}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                currentUser.role === 'CLIENT' && activeTab === 'client'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Boutique Client
            </button>

            <button
              onClick={() => {
                const u = users.find((x) => x.role === 'REVENDEUR');
                if (u) setCurrentUser(u);
                setActiveTab('revendeur');
              }}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                currentUser.role === 'REVENDEUR' && activeTab === 'revendeur'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Revendeur (Gains)
            </button>

            <button
              onClick={() => {
                const u = users.find((x) => x.role === 'LIVREUR');
                if (u) setCurrentUser(u);
                setActiveTab('livreur');
              }}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                currentUser.role === 'LIVREUR' && activeTab === 'livreur'
                  ? 'bg-teal-600 text-white shadow'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Livreur Bamako
            </button>

            <button
              onClick={() => {
                const u = users.find((x) => x.role === 'ADMIN');
                if (u) setCurrentUser(u);
                setActiveTab('admin');
              }}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                currentUser.role === 'ADMIN' && activeTab === 'admin'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Hub
            </button>

            <button
              onClick={() => {
                const u = users.find((x) => x.role === 'FOURNISSEUR');
                if (u) setCurrentUser(u);
                setActiveTab('fournisseur');
              }}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                currentUser.role === 'FOURNISSEUR' && activeTab === 'fournisseur'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Fournisseur
            </button>

            {/* Bouton Connexion Téléphone Malien */}
            <button
              onClick={() => openAuthModal('login')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ml-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow"
              title="Se connecter avec votre numéro malien (+223) et votre mot de passe"
            >
              <Smartphone className="w-3 h-3 text-white" />
              <span>Connexion Téléphone</span>
            </button>

            {/* Bouton Guide Déploiement */}
            <button
              onClick={openDeploymentGuide}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ml-2 bg-emerald-800/70 hover:bg-emerald-700 text-emerald-200 border border-emerald-600/50"
              title="Comment déployer publiquement sur Cloud Run avec nom de domaine et sécurité"
            >
              <Globe className="w-3 h-3 text-emerald-300" />
              <span className="hidden sm:inline">Déploiement Public</span>
            </button>

            {/* Bouton de test / bascule Mode Hors Ligne */}
            <button
              onClick={toggleSimulatedOffline}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ml-1 border ${
                isSimulatedOffline
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md animate-pulse'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
              }`}
              title="Tester le comportement de l application en cas de coupure de connexion Internet à Bamako"
            >
              {isSimulatedOffline ? (
                <WifiOff className="w-3 h-3 text-amber-200" />
              ) : (
                <Wifi className="w-3 h-3 text-emerald-400" />
              )}
              <span>{isSimulatedOffline ? 'Hors Ligne Actif' : 'Test Hors Ligne'}</span>
              {pendingOfflineCount > 0 && (
                <span className="bg-amber-900 text-amber-200 text-[10px] px-1 rounded-full font-mono">
                  {pendingOfflineCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Conteneur Principal avec Cloisonnement de Sécurité RBAC */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'client' && (
          <ClientShop
            onOpenCart={() => setIsCartOpen(true)}
            onOpenTracking={(ref) => {
              if (ref) setActiveTrackingRef(ref);
              setIsTrackingOpen(true);
            }}
          />
        )}

        {activeTab === 'revendeur' &&
          (currentUser.role === 'REVENDEUR' || currentUser.role === 'ADMIN' ? (
            <ResellerPortal onOpenCart={() => setIsCartOpen(true)} />
          ) : (
            <AccessDeniedCard
              requiredRole="REVENDEUR"
              userRole={currentUser.role}
              onSwitchToRole={() => {
                const u = users.find((x) => x.role === 'REVENDEUR');
                if (u) setCurrentUser(u);
              }}
              onOpenAuth={() => openAuthModal('register')}
            />
          ))}

        {activeTab === 'admin' &&
          (currentUser.role === 'ADMIN' ? (
            <AdminPortal />
          ) : (
            <AccessDeniedCard
              requiredRole="ADMIN"
              userRole={currentUser.role}
              onSwitchToRole={() => {
                const u = users.find((x) => x.role === 'ADMIN');
                if (u) setCurrentUser(u);
              }}
              onOpenAuth={() => openAuthModal('login')}
            />
          ))}

        {activeTab === 'livreur' &&
          (currentUser.role === 'LIVREUR' || currentUser.role === 'ADMIN' ? (
            <DeliveryPortal />
          ) : (
            <AccessDeniedCard
              requiredRole="LIVREUR"
              userRole={currentUser.role}
              onSwitchToRole={() => {
                const u = users.find((x) => x.role === 'LIVREUR');
                if (u) setCurrentUser(u);
              }}
              onOpenAuth={() => openAuthModal('login')}
            />
          ))}

        {activeTab === 'fournisseur' &&
          (currentUser.role === 'FOURNISSEUR' || currentUser.role === 'ADMIN' ? (
            <SupplierPortal />
          ) : (
            <AccessDeniedCard
              requiredRole="FOURNISSEUR"
              userRole={currentUser.role}
              onSwitchToRole={() => {
                const u = users.find((x) => x.role === 'FOURNISSEUR');
                if (u) setCurrentUser(u);
              }}
              onOpenAuth={() => openAuthModal('login')}
            />
          ))}
      </main>

      {/* Section Questions Fréquentes (Firestore) */}
      <FaqSection />

      {/* Pied de page Malien */}
      <footer className="bg-stone-900 text-stone-400 text-xs border-t border-stone-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center font-black text-white text-base">
                M
              </span>
              <span className="text-base font-black tracking-tight text-white">
                Mali<span className="text-emerald-400">Resell</span>
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed text-xs">
              La plateforme e-commerce et réseau de revendeurs conçue pour l écosystème commercial malien. Vendez sans capital, livrez en toute confiance à Bamako et dans les régions.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">Modes de Règlement</h4>
            <ul className="space-y-1 text-stone-400">
              <li>• Espèces à la livraison (Cash On Delivery)</li>
              <li>• Orange Money Mali (*144#)</li>
              <li>• Moov Money (*166# Flooz)</li>
              <li>• Wave Mali sans frais</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">Hub Central & Contact</h4>
            <div className="space-y-1.5 text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Hamdallaye ACI 2000, Rue 314, Bamako, Mali</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Service Client : +223 70 00 00 00</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">Sécurité & Cloisonnement</h4>
            <p className="text-stone-400 text-xs">
              Données protégées par Firebase Security Rules. Les revendeurs, livreurs et clients n ont accès qu à leurs propres informations.
            </p>
            <button
              onClick={openDeploymentGuide}
              className="text-emerald-400 hover:text-emerald-300 underline text-xs font-semibold flex items-center gap-1 mt-1"
            >
              <Globe className="w-3.5 h-3.5" /> Guide de mise en production grand public
            </button>
          </div>
        </div>

        <div className="border-t border-stone-800 py-4 px-4 text-center text-[11px] text-stone-500 flex flex-wrap justify-between items-center max-w-7xl mx-auto">
          <span>© {new Date().getFullYear()} MaliResell Technologies SARL. République du Mali.</span>
          <span className="text-stone-400">Contrôle d Accès RBAC Actif • Firestore Chiffré</span>
        </div>
      </footer>

      {/* Tiroir Panier & Modal Commande */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderCreated={handleOrderCreated}
      />

      {/* Modal Suivi de Colis */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialRef={activeTrackingRef}
      />

      {/* Modal Authentification Sécurisée (Google & Email) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />

      {/* Guide de Déploiement Public & Sécurité */}
      <DeploymentGuideModal
        isOpen={isDeploymentGuideOpen}
        onClose={closeDeploymentGuide}
      />

      {/* Notifications Toast */}
      <ToastContainer />

      {/* Canal d'Assistance & Coordination WhatsApp Bamako */}
      <WhatsAppChatModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
