import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import {
  loginWithPhone,
  registerWithPhone,
  normalizeMaliPhone,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  resetPassword,
} from '../services/authService';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Building,
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  Truck,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  Smartphone,
  MapPin,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  defaultRole?: Role;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  defaultRole = 'CLIENT',
}) => {
  const { setCurrentUser, users, addToast } = useApp();

  // Mode principal : 'phone' (standard Mali), 'register_phone', 'google_email', 'demo'
  const [authMethod, setAuthMethod] = useState<'phone' | 'register_phone' | 'google_email' | 'demo'>(
    initialMode === 'register' ? 'register_phone' : 'phone'
  );

  // Champs Téléphone & Mot de passe
  const [phoneDigits, setPhoneDigits] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Inscription
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [role, setRole] = useState<Role>(defaultRole);
  const [nomEntreprise, setNomEntreprise] = useState('');
  const [commune, setCommune] = useState('Commune IV');
  const [quartier, setQuartier] = useState('Hamdallaye ACI 2000');

  // Alternative Email / Google
  const [email, setEmail] = useState('');
  const [emailAuthMode, setEmailAuthMode] = useState<'login' | 'register' | 'forgot'>('login');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialMode === 'register') {
      setAuthMethod('register_phone');
    } else {
      setAuthMethod('phone');
    }
    setErrorMessage(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const phoneInfo = normalizeMaliPhone(phoneDigits);

  // Soumission Connexion Téléphone + Mot de passe
  const handlePhoneLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (!phoneInfo.isValid) {
        setErrorMessage('Veuillez entrer un numéro de téléphone malien valide à 8 chiffres (ex: 76 00 11 22).');
        setLoading(false);
        return;
      }
      if (!password) {
        setErrorMessage('Veuillez renseigner votre mot de passe.');
        setLoading(false);
        return;
      }

      const { appUser } = await loginWithPhone(phoneDigits, password);
      setCurrentUser(appUser);
      addToast(`Bienvenue ${appUser.prenom} ! Connexion réussie (${appUser.role}).`, 'success');
      onClose();
    } catch (err: any) {
      console.error(err);
      if (
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential' ||
        err.message?.includes('invalid-credential')
      ) {
        setErrorMessage('Mot de passe ou numéro de téléphone incorrect.');
      } else {
        setErrorMessage(err.message || 'Échec de la connexion. Vérifiez vos identifiants.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Soumission Inscription Téléphone
  const handlePhoneRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (!phoneInfo.isValid) {
        setErrorMessage('Veuillez entrer un numéro malien valide à 8 chiffres.');
        setLoading(false);
        return;
      }
      if (!nom || !prenom) {
        setErrorMessage('Veuillez renseigner votre nom et prénom.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Le mot de passe doit comporter au moins 6 caractères.');
        setLoading(false);
        return;
      }

      const { appUser } = await registerWithPhone({
        telephone: phoneDigits,
        pass: password,
        nom,
        prenom,
        role,
        ville: 'Bamako',
        commune,
        quartier,
        nomEntreprise: role === 'FOURNISSEUR' ? nomEntreprise : undefined,
      });

      setCurrentUser(appUser);
      addToast(`Compte créé avec succès ! Bienvenue sur MaliResell.`, 'success');
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use' || err.message?.includes('already-in-use')) {
        setErrorMessage('Ce numéro de téléphone est déjà associé à un compte. Connectez-vous.');
      } else {
        setErrorMessage(err.message || 'Erreur lors de l’inscription.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Remplissage rapide d'un compte de test avec téléphone et mot de passe
  const prefillTestAccount = (phone: string, pass: string, roleName: string) => {
    setPhoneDigits(phone);
    setPassword(pass);
    setAuthMethod('phone');
    setErrorMessage(null);
    addToast(`Identifiants ${roleName} pré-remplis. Cliquez sur "Se Connecter".`, 'info');
  };

  // Connexion Google
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { appUser } = await loginWithGoogle();
      setCurrentUser(appUser);
      addToast(`Bienvenue, ${appUser.prenom} ! Connexion réussie via Google.`, 'success');
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('La fenêtre Google a été fermée.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage('Domaine non autorisé dans Firebase. Utilisez la connexion par numéro de téléphone.');
      } else {
        setErrorMessage(err.message || 'Échec de la connexion Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Connexion / Inscription Email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (emailAuthMode === 'login') {
        const { appUser } = await loginWithEmail(email, password);
        setCurrentUser(appUser);
        addToast(`Heureux de vous revoir, ${appUser.prenom} !`, 'success');
        onClose();
      } else if (emailAuthMode === 'register') {
        const { appUser } = await registerWithEmail({
          email,
          pass: password,
          nom,
          prenom,
          telephone: phoneInfo.displayPhone,
          role,
          ville: 'Bamako',
          commune,
          quartier,
          nomEntreprise: role === 'FOURNISSEUR' ? nomEntreprise : undefined,
        });
        setCurrentUser(appUser);
        addToast('Compte créé avec succès !', 'success');
        onClose();
      } else if (emailAuthMode === 'forgot') {
        await resetPassword(email);
        addToast('Email de réinitialisation envoyé.', 'info');
        setEmailAuthMode('login');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* En-tête Modal */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-amber-600 flex items-center justify-center text-white font-black text-xl shadow-md border border-white/20">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base tracking-tight">MaliResell Sécurité</h3>
                <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase">
                  Mali 🇲🇱
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Connexion directe par Numéro de Téléphone (+223) & Mot de passe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barre d'onglets ergonomiques */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-3 pt-2 gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              authMethod === 'phone'
                ? 'border-emerald-700 text-emerald-900 bg-white rounded-t-lg shadow-sm'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Connexion Téléphone</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('register_phone');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              authMethod === 'register_phone'
                ? 'border-emerald-700 text-emerald-900 bg-white rounded-t-lg shadow-sm'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>Créer un Compte</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('demo');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 text-xs font-bold border-b-2 text-center transition flex items-center justify-center gap-1 whitespace-nowrap ${
              authMethod === 'demo'
                ? 'border-amber-600 text-amber-900 bg-white rounded-t-lg shadow-sm'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Comptes Tests</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('google_email');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 text-xs font-bold border-b-2 text-center transition flex items-center justify-center gap-1 whitespace-nowrap ${
              authMethod === 'google_email'
                ? 'border-stone-700 text-stone-900 bg-white rounded-t-lg shadow-sm'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-stone-500" />
            <span>Google / Email</span>
          </button>
        </div>

        {/* Corps défilable */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* 1. CONNEXION PRINCIPALE PAR TÉLÉPHONE */}
          {authMethod === 'phone' && (
            <form onSubmit={handlePhoneLoginSubmit} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-800">
                    Numéro de Téléphone Malien *
                  </label>
                  {phoneInfo.operator !== 'Inconnu' && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        phoneInfo.operator === 'Orange Mali'
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : phoneInfo.operator === 'Moov Africa Malitel'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {phoneInfo.operator}
                    </span>
                  )}
                </div>

                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-stone-700 flex items-center gap-1 bg-stone-100 px-2 py-1 rounded border border-stone-200">
                    <span>🇲🇱</span> +223
                  </span>
                  <input
                    type="tel"
                    required
                    autoFocus
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(e.target.value)}
                    placeholder="76 00 11 22"
                    className="w-full text-sm font-semibold pl-24 pr-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Compatible Orange Money (7X, 8X, 9X) et Moov Money (6X)
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-800">
                    Mot de Passe *
                  </label>
                  <span className="text-[10px] text-stone-500">Mdp démo : <strong>mali2026</strong></span>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm font-semibold pl-9 pr-10 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 text-stone-400 hover:text-stone-700 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Connexion en cours...</span>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>Se Connecter avec mon Numéro</span>
                  </>
                )}
              </button>

              {/* Raccourcis de pré-remplissage rapide des 5 rôles */}
              <div className="pt-2 border-t border-stone-200">
                <span className="text-[11px] font-bold text-stone-600 block mb-1.5">
                  Identifiants de test pré-configurés (1 clic) :
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => prefillTestAccount('76 00 11 22', 'mali2026', 'Admin')}
                    className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-left font-semibold transition"
                  >
                    👑 Admin : 76 00 11 22
                  </button>
                  <button
                    type="button"
                    onClick={() => prefillTestAccount('65 44 33 22', 'mali2026', 'Revendeur')}
                    className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-left font-semibold transition"
                  >
                    💼 Revendeur : 65 44 33 22
                  </button>
                  <button
                    type="button"
                    onClick={() => prefillTestAccount('73 55 66 77', 'mali2026', 'Livreur')}
                    className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-left font-semibold transition"
                  >
                    🛵 Livreur : 73 55 66 77
                  </button>
                  <button
                    type="button"
                    onClick={() => prefillTestAccount('66 88 99 00', 'mali2026', 'Fournisseur')}
                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-left font-semibold transition"
                  >
                    🏭 Grossiste : 66 88 99 00
                  </button>
                  <button
                    type="button"
                    onClick={() => prefillTestAccount('79 11 22 33', 'mali2026', 'Client')}
                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-left font-semibold transition"
                  >
                    🛍️ Client : 79 11 22 33
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* 2. CRÉATION DE COMPTE PAR TÉLÉPHONE */}
          {authMethod === 'register_phone' && (
            <form onSubmit={handlePhoneRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Ex: Ousmane"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Nom de famille *
                  </label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Ex: Diarra"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Rôle / Espace souhaité *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-stone-50 font-bold text-stone-900"
                >
                  <option value="CLIENT">🛍️ Client Acheteur (Commandes & suivi colis)</option>
                  <option value="REVENDEUR">💼 Revendeur Affilié (Vente sans stock, gains et retraits)</option>
                  <option value="LIVREUR">🛵 Livreur Moto (Feuille de route Bamako & COD)</option>
                  <option value="FOURNISSEUR">🏭 Fournisseur Grossiste (Gestion stocks & approvisionnement)</option>
                </select>
              </div>

              {role === 'FOURNISSEUR' && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Nom de votre Entreprise / Boutique *
                  </label>
                  <input
                    type="text"
                    required
                    value={nomEntreprise}
                    onChange={(e) => setNomEntreprise(e.target.value)}
                    placeholder="Ex: Import-Export Bamako SARL"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-300"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Numéro de Téléphone Malien *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-xs font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                    🇲🇱 +223
                  </span>
                  <input
                    type="tel"
                    required
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(e.target.value)}
                    placeholder="76 12 34 56"
                    className="w-full text-xs font-semibold pl-20 pr-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Commune de Bamako
                  </label>
                  <select
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300"
                  >
                    <option value="Commune I">Commune I</option>
                    <option value="Commune II">Commune II</option>
                    <option value="Commune III">Commune III</option>
                    <option value="Commune IV">Commune IV (ACI 2000)</option>
                    <option value="Commune V">Commune V (Badalabougou)</option>
                    <option value="Commune VI">Commune VI (Yirimadio)</option>
                    <option value="Kati / Périphérie">Kati / Périphérie</option>
                    <option value="Régions">Régions du Mali</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Quartier
                  </label>
                  <input
                    type="text"
                    value={quartier}
                    onChange={(e) => setQuartier(e.target.value)}
                    placeholder="Ex: Hamdallaye"
                    className="w-full text-xs p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Définir un Mot de passe (min. 6 caractères) *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Création en cours...' : 'Valider mon Inscription'}
              </button>
            </form>
          )}

          {/* 3. COMPTES TESTS DÉMO IMMÉDIATS */}
          {authMethod === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600 leading-relaxed">
                Les 5 profils de démonstration ci-dessous vous permettent de vérifier le <strong>cloisonnement strict des données</strong> (les clients ne voient pas les marges ni les fournisseurs, les revendeurs ont leur portefeuille isolé).
              </p>

              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 rounded-xl border border-stone-200 hover:border-emerald-500 bg-stone-50 hover:bg-white transition flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">
                          {u.prenom} {u.nom}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'REVENDEUR'
                              ? 'bg-amber-100 text-amber-800'
                              : u.role === 'LIVREUR'
                              ? 'bg-teal-100 text-teal-800'
                              : u.role === 'FOURNISSEUR'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{u.telephone}</span>
                        <span>•</span>
                        <span>{u.commune || u.ville}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentUser(u);
                        addToast(`Session active : ${u.prenom} (${u.role})`, 'info');
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
                    >
                      <span>Activer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. GOOGLE & EMAIL CLASSIQUE */}
          {authMethod === 'google_email' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs flex items-center justify-center gap-3 shadow-sm transition hover:shadow disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuer avec Google</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-stone-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] text-stone-400 font-medium absolute">
                  ou par Email
                </span>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Adresse Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@maliresell.ml"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow transition disabled:opacity-50"
                >
                  {loading ? 'Connexion...' : 'Se connecter par Email'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Pied de page Sécurité */}
        <div className="bg-stone-50 p-3.5 border-t border-stone-200 text-stone-600 text-[11px] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sécurité ABAC & Chiffrement Firestore Actifs</span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">Hub Bamako ACI 2000</span>
        </div>
      </div>
    </div>
  );
};
