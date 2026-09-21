import React, { useState } from 'react';
import {
  X,
  Globe,
  ShieldCheck,
  Smartphone,
  Server,
  Key,
  CheckCircle2,
  Copy,
  ExternalLink,
  Layers,
  Users,
  Lock,
  Wifi,
  CloudCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addToast } = useApp();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    addToast(`${label} copié dans le presse-papier`, 'success');
    setTimeout(() => setCopiedText(null), 2500);
  };

  const steps = [
    {
      id: 1,
      title: '1. Publication & Accès Grand Public',
      icon: Globe,
    },
    {
      id: 2,
      title: '2. Configuration Firebase Auth',
      icon: Key,
    },
    {
      id: 3,
      title: '3. Sécurité & Cloisonnement RBAC',
      icon: ShieldCheck,
    },
    {
      id: 4,
      title: '4. Installation Mobile PWA (Bamako)',
      icon: Smartphone,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* En-tête */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                Guide de Déploiement Propre & Sécurité Grand Public
              </h3>
              <p className="text-xs text-stone-400">
                Procédure complète pour rendre MaliResell accessible à tout le Mali en toute sécurité
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barre de navigation des étapes */}
        <div className="flex border-b border-stone-200 bg-stone-50 overflow-x-auto no-scrollbar">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                  isActive
                    ? 'border-emerald-700 text-emerald-800 bg-white'
                    : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`} />
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Corps de l'étape sélectionnée */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-800 text-xs sm:text-sm">
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-emerald-700" />
                  Rendre l'application accessible mondialement
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  L'application MaliResell est déjà conçue comme une Single Page Application (SPA) haute performance prête pour Cloud Run et les réseaux télécoms maliens (Orange Mali, Malitel, Telecel).
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-stone-900">Étapes de partage & mise en ligne :</h5>
                <ol className="space-y-3 pl-4 list-decimal text-stone-600">
                  <li className="leading-relaxed">
                    <strong>Bouton "Share" (Partager) dans AI Studio</strong> : Cliquez sur le bouton <em>Share</em> en haut à droite de l'interface Google AI Studio pour générer une URL publique accessible sans compte développeur.
                  </li>
                  <li className="leading-relaxed">
                    <strong>Déploiement Cloud Run permanent</strong> : Dans le menu paramètres de Google AI Studio, choisissez <em>Deploy to Cloud Run</em>. Votre application sera déployée sur un conteneur sécurisé avec certificat SSL HTTPS automatique.
                  </li>
                  <li className="leading-relaxed">
                    <strong>Nom de domaine personnalisé (Optionnel)</strong> : Vous pouvez associer votre domaine propre (ex: <code>maliresell.ml</code> ou <code>maliresell.com</code>) dans la console Google Cloud via Cloud Run &gt; Custom Domains.
                  </li>
                </ol>
              </div>

              <div className="p-3.5 bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-stone-500 font-bold block uppercase">URL Partagée Actuelle</span>
                  <code className="text-xs font-mono text-stone-800 select-all">
                    https://ais-pre-mbbd3liee2uron3wx7aal3-351179611348.europe-west2.run.app
                  </code>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'https://ais-pre-mbbd3liee2uron3wx7aal3-351179611348.europe-west2.run.app',
                      'URL Partagée'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedText === 'URL Partagée' ? 'Copié !' : 'Copier'}
                </button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2 mb-1">
                  <Key className="w-4 h-4 text-amber-700" />
                  Configuration des Méthodes de Connexion dans Firebase
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Pour que vos utilisateurs maliens puissent se connecter avec Google ou créer un compte par email sans erreur :
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
                  <span className="font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs">1</span>
                    Autoriser les domaines dans la console Firebase
                  </span>
                  <p className="text-xs text-stone-600 pl-7">
                    Rendez-vous dans la <strong>Console Firebase</strong> &gt; <strong>Authentication</strong> &gt; <strong>Settings</strong> &gt; <strong>Authorized domains</strong>.
                    Ajoutez les domaines suivants :
                  </p>
                  <div className="pl-7 space-y-1.5">
                    <div className="flex items-center justify-between p-2 bg-stone-50 rounded-lg border border-stone-200 font-mono text-xs">
                      <span>run.app</span>
                      <button
                        onClick={() => copyToClipboard('run.app', 'run.app')}
                        className="text-emerald-700 font-sans text-xs font-bold hover:underline"
                      >
                        Copier
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-stone-50 rounded-lg border border-stone-200 font-mono text-xs">
                      <span>ais-pre-mbbd3liee2uron3wx7aal3-351179611348.europe-west2.run.app</span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            'ais-pre-mbbd3liee2uron3wx7aal3-351179611348.europe-west2.run.app',
                            'Domaine complet'
                          )
                        }
                        className="text-emerald-700 font-sans text-xs font-bold hover:underline"
                      >
                        Copier
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
                  <span className="font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs">2</span>
                    Activer les fournisseurs dans Firebase
                  </span>
                  <p className="text-xs text-stone-600 pl-7">
                    Dans <strong>Authentication</strong> &gt; <strong>Sign-in method</strong> :
                  </p>
                  <ul className="pl-11 list-disc text-xs text-stone-600 space-y-1">
                    <li><strong>Google</strong> : Cliquez sur "Activer", choisissez l'email du support et sauvegardez.</li>
                    <li><strong>Adresse e-mail / mot de passe</strong> : Cliquez sur "Activer" pour permettre l'inscription manuelle.</li>
                    <li><strong>Numéro de téléphone</strong> (Optionnel) : Activez pour l'envoi de codes SMS au Mali (+223).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Cloisonnement Strict des Données (Zero-Trust ABAC)
                </h4>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Grâce aux règles de sécurité déployées dans <code>firestore.rules</code> et aux filtres applicatifs, chaque profil ne peut accéder qu'aux données strictement nécessaires à son activité.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 text-xs flex items-center gap-1.5 text-emerald-700 mb-1">
                    <Lock className="w-3.5 h-3.5" /> Espace Clients
                  </h5>
                  <p className="text-[11px] text-stone-600">
                    Les clients ne voient <strong>JAMAIS</strong> les prix d'achat grossistes (P_F), les marges des revendeurs, ni les adresses et commandes des autres acheteurs.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 text-xs flex items-center gap-1.5 text-amber-700 mb-1">
                    <Lock className="w-3.5 h-3.5" /> Espace Revendeurs
                  </h5>
                  <p className="text-[11px] text-stone-600">
                    Chaque revendeur ne voit <strong>QUE SES PROPRES VENTES</strong> et son portefeuille personnel. Aucun accès aux commandes ou aux gains des autres revendeurs.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 text-xs flex items-center gap-1.5 text-blue-700 mb-1">
                    <Lock className="w-3.5 h-3.5" /> Espace Fournisseurs
                  </h5>
                  <p className="text-[11px] text-stone-600">
                    Chaque fournisseur ne voit que <strong>SES ARTICLES FOURNIS</strong> et ses propres réassorts. Zéro visibilité sur les coordonnées privées des clients finaux.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 text-xs flex items-center gap-1.5 text-teal-700 mb-1">
                    <Lock className="w-3.5 h-3.5" /> Espace Livreurs
                  </h5>
                  <p className="text-[11px] text-stone-600">
                    Les livreurs ont accès uniquement aux informations logistiques (adresse, repère, contact du client et montant en espèces à collecter).
                  </p>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                <span>
                  <strong>Règles Firestore vérifiées et déployées :</strong> Les requêtes directes à la base de données sont rejetées si l'utilisateur tente de lire les données d'un tiers.
                </span>
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                <h4 className="font-bold text-teal-950 text-sm flex items-center gap-2 mb-1">
                  <Smartphone className="w-4 h-4 text-teal-700" />
                  Application Mobile PWA (Sans téléchargement Play Store)
                </h4>
                <p className="text-xs text-teal-900 leading-relaxed">
                  L'application s'installe directement sur les smartphones Android et iPhone des revendeurs, livreurs et clients de Bamako en 2 clics.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 text-xs mb-1">Sur Téléphone Android (Google Chrome) :</h5>
                  <p className="text-xs text-stone-600">
                    Ouvrez le lien dans Chrome &gt; Cliquez sur les 3 points en haut à droite &gt; Choisissez <strong>"Ajouter à l'écran d'accueil"</strong> ou <strong>"Installer l'application"</strong>. Une icône MaliResell apparaît directement sur le bureau du téléphone.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 text-xs mb-1">Sur iPhone (Safari) :</h5>
                  <p className="text-xs text-stone-600">
                    Ouvrez le lien dans Safari &gt; Cliquez sur l'icône de partage (carré avec flèche vers le haut) &gt; Choisissez <strong>"Sur l'écran d'accueil"</strong>.
                  </p>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2 text-amber-900 text-xs">
                  <Wifi className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Résistance aux coupures Internet :</strong> Même en cas de perturbation réseau à Bamako, l'application reste réactive, enregistre les commandes localement et les synchronise automatiquement dès le retour du réseau.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pied de page avec bouton d'action */}
        <div className="bg-stone-50 p-4 border-t border-stone-200 flex items-center justify-between">
          <span className="text-stone-500 text-xs font-medium">
            Plateforme MaliResell • Conforme au marché malien
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-sm"
          >
            Fermer le guide
          </button>
        </div>
      </div>
    </div>
  );
};
