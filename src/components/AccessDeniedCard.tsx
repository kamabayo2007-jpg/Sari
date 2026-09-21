import React from 'react';
import { ShieldAlert, LogIn, ArrowRight } from 'lucide-react';
import { Role } from '../types';
import { useApp } from '../context/AppContext';

interface AccessDeniedCardProps {
  requiredRole: Role;
  userRole?: Role;
  roleTitle?: string;
  description?: string;
  onOpenAuth?: () => void;
  onSwitchToRole?: () => void;
}

export const AccessDeniedCard: React.FC<AccessDeniedCardProps> = ({
  requiredRole,
  roleTitle,
  description,
  onOpenAuth,
  onSwitchToRole,
}) => {
  const { currentUser, switchRole } = useApp();

  const defaultRoleTitle =
    roleTitle ||
    (requiredRole === 'ADMIN'
      ? 'Administrateur'
      : requiredRole === 'REVENDEUR'
      ? 'Revendeur'
      : requiredRole === 'LIVREUR'
      ? 'Livreur'
      : requiredRole === 'FOURNISSEUR'
      ? 'Fournisseur'
      : 'Client');

  const defaultDescription =
    description ||
    `Conformément aux règles de sécurité et de confidentialité de MaliResell, seul un compte habilité avec le rôle ${defaultRoleTitle} peut consulter et gérer cet espace.`;

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl border border-stone-200 shadow-sm text-center space-y-5 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
          Sécurité & Cloisonnement Actif
        </span>
        <h3 className="text-xl font-extrabold text-stone-900">
          Accès Restreint : {defaultRoleTitle}
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
          {defaultDescription}
        </p>
      </div>

      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 max-w-md mx-auto">
        <span>Votre session actuelle : </span>
        <strong className="text-stone-900 font-bold">
          {currentUser.prenom} {currentUser.nom}
        </strong>{' '}
        <span className="text-stone-500 font-mono">({currentUser.role})</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={() => {
            if (onOpenAuth) {
              onOpenAuth();
            } else if (onSwitchToRole) {
              onSwitchToRole();
            } else {
              switchRole(requiredRole);
            }
          }}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Connexion Téléphone ({defaultRoleTitle})</span>
        </button>

        <button
          onClick={() => {
            if (onSwitchToRole) {
              onSwitchToRole();
            } else {
              switchRole(requiredRole);
            }
          }}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition flex items-center justify-center gap-1.5"
        >
          <span>Tester avec le profil démo {defaultRoleTitle}</span>
          <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
        </button>
      </div>
    </div>
  );
};
