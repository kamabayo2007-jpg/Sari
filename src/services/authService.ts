import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { User, Role } from '../types';
import { INITIAL_USERS } from '../data/initialData';

const USERS_COLLECTION = 'users';

// Helper de normalisation des numéros de téléphone au Mali (8 chiffres)
export interface MaliPhoneInfo {
  raw: string;
  digits8: string;
  displayPhone: string;
  isValid: boolean;
  operator: 'Orange Mali' | 'Moov Africa Malitel' | 'Telecel' | 'Inconnu';
  authAlias: string;
}

export function normalizeMaliPhone(input: string): MaliPhoneInfo {
  const raw = input || '';
  // Supprimer espaces, tirets, parenthèses, etc.
  let cleaned = raw.replace(/\D/g, '');

  // Supprimer l'indicatif 223 ou 00223 au début
  if (cleaned.startsWith('223')) {
    cleaned = cleaned.substring(3);
  }

  // Vérification de la longueur (exactement 8 chiffres au Mali)
  const isValid = cleaned.length === 8;
  const digits8 = isValid ? cleaned : cleaned.slice(0, 8);

  let operator: 'Orange Mali' | 'Moov Africa Malitel' | 'Telecel' | 'Inconnu' = 'Inconnu';
  if (digits8.length >= 2) {
    const firstDigit = digits8[0];
    if (['7', '8', '9'].includes(firstDigit)) {
      operator = 'Orange Mali';
    } else if (firstDigit === '6') {
      operator = 'Moov Africa Malitel';
    } else if (firstDigit === '5') {
      operator = 'Telecel';
    }
  }

  const formatted8 = digits8.length === 8
    ? `${digits8.slice(0, 2)} ${digits8.slice(2, 4)} ${digits8.slice(4, 6)} ${digits8.slice(6, 8)}`
    : digits8;

  const displayPhone = `+223 ${formatted8}`;
  const authAlias = `mali_${digits8}@auth.maliresell.ml`;

  return {
    raw,
    digits8,
    displayPhone,
    isValid,
    operator,
    authAlias,
  };
}

// Connexion par Numéro de Téléphone (+223) et Mot de Passe
export async function loginWithPhone(
  phoneInput: string,
  pass: string
): Promise<{ firebaseUser: FirebaseUser; appUser: User }> {
  const phoneInfo = normalizeMaliPhone(phoneInput);
  if (!phoneInfo.isValid) {
    throw new Error('Veuillez entrer un numéro de téléphone malien valide à 8 chiffres (ex: 76 00 11 22 ou +223 76001122).');
  }

  try {
    // 1. Tenter la connexion avec l'alias Firebase sécurisé
    const result = await signInWithEmailAndPassword(auth, phoneInfo.authAlias, pass);
    const fbUser = result.user;

    const userDocRef = doc(db, USERS_COLLECTION, fbUser.uid);
    const userSnap = await getDoc(userDocRef);

    let appUser: User;
    if (userSnap.exists()) {
      appUser = userSnap.data() as User;
    } else {
      // Profil lié
      appUser = {
        id: Math.floor(100000 + Math.random() * 900000),
        firebaseUid: fbUser.uid,
        nom: 'Utilisateur',
        prenom: 'Bamako',
        email: phoneInfo.authAlias,
        telephone: phoneInfo.displayPhone,
        role: 'CLIENT',
        ville: 'Bamako',
        commune: 'Commune IV',
        actif: true,
        authProvider: 'password',
        createdAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, appUser);
    }

    return { firebaseUser: fbUser, appUser };
  } catch (error: any) {
    // Si l'utilisateur n'existe pas encore dans Firebase Auth mais correspond à l'un des comptes démo
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      const matchInitial = INITIAL_USERS.find((u) => {
        const uPhone = normalizeMaliPhone(u.telephone);
        return uPhone.digits8 === phoneInfo.digits8;
      });

      if (matchInitial) {
        // Accepter le mot de passe standard ou initialiser dans Firebase Auth
        const allowedPasswords = ['mali2026', 'admin2026', 'bamako2026', pass];
        if (allowedPasswords.includes(pass) || pass.length >= 6) {
          try {
            const newFbUser = await createUserWithEmailAndPassword(auth, phoneInfo.authAlias, pass.length >= 6 ? pass : 'mali2026');
            await updateProfile(newFbUser.user, {
              displayName: `${matchInitial.prenom} ${matchInitial.nom}`,
            });

            const syncedUser: User = {
              ...matchInitial,
              firebaseUid: newFbUser.user.uid,
              telephone: phoneInfo.displayPhone,
              authProvider: 'password',
            };

            await setDoc(doc(db, USERS_COLLECTION, newFbUser.user.uid), syncedUser);
            return { firebaseUser: newFbUser.user, appUser: syncedUser };
          } catch (createErr) {
            // Si le compte existe déjà, ré-essayer
            console.warn('Auto-provisioning notice:', createErr);
          }
        }
      }
    }
    console.error('Erreur Phone Login:', error);
    throw error;
  }
}

// Inscription directe par Numéro de Téléphone et Mot de Passe
export async function registerWithPhone(params: {
  telephone: string;
  pass: string;
  nom: string;
  prenom: string;
  role: Role;
  ville?: string;
  commune?: string;
  quartier?: string;
  nomEntreprise?: string;
}): Promise<{ firebaseUser: FirebaseUser; appUser: User }> {
  const phoneInfo = normalizeMaliPhone(params.telephone);
  if (!phoneInfo.isValid) {
    throw new Error('Veuillez saisir un numéro malien valide à 8 chiffres (ex: 76 12 34 56).');
  }
  if (!params.pass || params.pass.length < 6) {
    throw new Error('Le mot de passe doit comporter au moins 6 caractères.');
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, phoneInfo.authAlias, params.pass);
    const fbUser = result.user;

    await updateProfile(fbUser, {
      displayName: `${params.prenom} ${params.nom}`,
    });

    const newAppUser: User = {
      id: Math.floor(100000 + Math.random() * 900000),
      firebaseUid: fbUser.uid,
      nom: params.nom.trim(),
      prenom: params.prenom.trim(),
      email: phoneInfo.authAlias,
      telephone: phoneInfo.displayPhone,
      role: params.role,
      ville: params.ville || 'Bamako',
      commune: params.commune || 'Commune IV',
      quartier: params.quartier || 'ACI 2000',
      nomEntreprise: params.nomEntreprise,
      soldeWallet: params.role === 'REVENDEUR' ? 0 : undefined,
      actif: true,
      authProvider: 'password',
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, USERS_COLLECTION, fbUser.uid), newAppUser);
    return { firebaseUser: fbUser, appUser: newAppUser };
  } catch (error: any) {
    console.error('Erreur Inscription Téléphone:', error);
    throw error;
  }
}

// Connexion Google Popup
export async function loginWithGoogle(): Promise<{ firebaseUser: FirebaseUser; appUser: User }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;

    // Vérifier si l'utilisateur existe déjà dans Firestore
    const userDocRef = doc(db, USERS_COLLECTION, fbUser.uid);
    const userSnap = await getDoc(userDocRef);

    let appUser: User;

    if (userSnap.exists()) {
      appUser = userSnap.data() as User;
    } else {
      // Déterminer le rôle : si l'email correspond à l'administrateur, attribuer ADMIN, sinon CLIENT par défaut
      const isAdminEmail =
        fbUser.email === 'kamabayo.2007@gmail.com' || fbUser.email === 'admin@maliresell.ml';

      const displayName = fbUser.displayName || 'Utilisateur Bamako';
      const nameParts = displayName.split(' ');
      const prenom = nameParts[0] || 'Utilisateur';
      const nom = nameParts.slice(1).join(' ') || 'MaliResell';

      appUser = {
        id: Math.floor(100000 + Math.random() * 900000),
        firebaseUid: fbUser.uid,
        nom,
        prenom,
        email: fbUser.email || '',
        telephone: fbUser.phoneNumber || '+223 ',
        role: isAdminEmail ? 'ADMIN' : 'CLIENT',
        ville: 'Bamako',
        commune: 'Commune IV',
        quartier: 'Hamdallaye ACI 2000',
        actif: true,
        photoURL: fbUser.photoURL || undefined,
        authProvider: 'google',
        createdAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, appUser);
    }

    return { firebaseUser: fbUser, appUser };
  } catch (error: any) {
    console.error('Erreur Google Login:', error);
    throw error;
  }
}

// Connexion par Email et Mot de Passe
export async function loginWithEmail(
  email: string,
  pass: string
): Promise<{ firebaseUser: FirebaseUser; appUser: User }> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const fbUser = result.user;

    // Charger les informations métier Firestore
    const userDocRef = doc(db, USERS_COLLECTION, fbUser.uid);
    const userSnap = await getDoc(userDocRef);

    let appUser: User;
    if (userSnap.exists()) {
      appUser = userSnap.data() as User;
    } else {
      // Profil de secours si le document n'existait pas encore
      appUser = {
        id: Math.floor(100000 + Math.random() * 900000),
        firebaseUid: fbUser.uid,
        nom: 'Utilisateur',
        prenom: fbUser.displayName || 'Membre',
        email: fbUser.email || email,
        telephone: '+223 ',
        role: 'CLIENT',
        ville: 'Bamako',
        actif: true,
        authProvider: 'password',
        createdAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, appUser);
    }

    return { firebaseUser: fbUser, appUser };
  } catch (error: any) {
    console.error('Erreur Email Login:', error);
    throw error;
  }
}

// Inscription par Email et Mot de passe avec sélection du profil métier
export async function registerWithEmail(params: {
  email: string;
  pass: string;
  nom: string;
  prenom: string;
  telephone: string;
  role: Role;
  ville: string;
  commune?: string;
  quartier?: string;
  nomEntreprise?: string;
}): Promise<{ firebaseUser: FirebaseUser; appUser: User }> {
  try {
    const result = await createUserWithEmailAndPassword(auth, params.email, params.pass);
    const fbUser = result.user;

    await updateProfile(fbUser, {
      displayName: `${params.prenom} ${params.nom}`,
    });

    const newAppUser: User = {
      id: Math.floor(100000 + Math.random() * 900000),
      firebaseUid: fbUser.uid,
      nom: params.nom.trim(),
      prenom: params.prenom.trim(),
      email: params.email.trim(),
      telephone: params.telephone.trim(),
      role: params.role,
      ville: params.ville || 'Bamako',
      commune: params.commune || 'Commune IV',
      quartier: params.quartier || 'ACI 2000',
      nomEntreprise: params.nomEntreprise,
      soldeWallet: params.role === 'REVENDEUR' ? 0 : undefined,
      actif: true,
      authProvider: 'password',
      createdAt: new Date().toISOString(),
    };

    // Sauvegarder dans Firestore
    await setDoc(doc(db, USERS_COLLECTION, fbUser.uid), newAppUser);

    return { firebaseUser: fbUser, appUser: newAppUser };
  } catch (error: any) {
    console.error('Erreur Inscription Email:', error);
    throw error;
  }
}

// Réinitialisation de mot de passe
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// Déconnexion
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Écouteur de l'état d'authentification
export function onAuthStateListener(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
