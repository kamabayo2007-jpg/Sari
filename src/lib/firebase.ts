import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialisation sécurisée de Firebase
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialisation de Firestore avec l'ID de base spécifique s'il est renseigné
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Authentification Firebase
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
