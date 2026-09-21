export type Role = 'ADMIN' | 'REVENDEUR' | 'CLIENT' | 'LIVREUR' | 'FOURNISSEUR';

export type OrderStatus =
  | 'EN_ATTENTE'
  | 'CONFIRMEE'
  | 'EN_PREPARATION'
  | 'EXPEDIEE'
  | 'LIVREE'
  | 'ANNULEE'
  | 'ECHOUEE';

export type PaymentMethod =
  | 'ESPECES_LIVRAISON'
  | 'ORANGE_MONEY'
  | 'MOOV_MONEY'
  | 'WAVE';

export type PaymentStatus =
  | 'EN_ATTENTE'
  | 'PAYE'
  | 'ECHOUE'
  | 'REMBOURSE';

export type DeliveryFailureReason =
  | 'CLIENT_INJOIGNABLE'
  | 'CLIENT_ABSENT'
  | 'REFUS_CLIENT'
  | 'ADRESSE_INACCESSIBLE'
  | 'COLIS_ENDOMMAGE'
  | 'AUTRE';

export type MobileMoneyOperator = 'ORANGE_MONEY' | 'MOOV_MONEY' | 'WAVE';

export interface User {
  id: number;
  firebaseUid?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  telephoneSecondaire?: string;
  role: Role;
  ville: string;
  commune?: string;
  quartier?: string;
  actif: boolean;
  soldeWallet?: number; // Pour les revendeurs
  nomEntreprise?: string; // Pour les fournisseurs
  photoURL?: string;
  authProvider?: 'google' | 'password' | 'phone' | 'demo';
  createdAt?: string;
}

export interface Category {
  id: number;
  nom: string;
  slug: string;
  description: string;
  icone?: string;
}

export interface Product {
  id: number;
  sku: string;
  nom: string;
  description: string;
  categorieId: number;
  fournisseurId: number;
  prixAchatFournisseur: number; // P_F (ex: 5000 FCFA)
  prixRevendeur: number;        // P_R (ex: 6000 FCFA)
  prixConseilleClient: number;  // P_C suggéré (ex: 10000 FCFA)
  stockPhysique: number;
  stockReserve: number;
  seuilAlerte: number;
  imageUrl: string;
  disponible: boolean;
}

export interface OrderItem {
  id: number;
  produitId: number;
  produitNom: string;
  produitSku: string;
  quantite: number;
  prixFournisseurUnitaire: number; // P_F
  prixRevendeurUnitaire: number;   // P_R
  prixVenteUnitaire: number;       // P_C fixé par le revendeur ou prix standard
  margeRevendeurUnitaire: number;  // P_C - P_R
  margePlateformeUnitaire: number; // P_R - P_F
  totalLigne: number;              // P_C * Quantité
}

export interface Order {
  id: number;
  reference: string; // Ex: MR-20260919-001
  dateCreation: string;
  clientId?: number;
  clientFirebaseUid?: string;
  clientNom: string;
  clientPrenom: string;
  clientTelephone: string;
  clientTelephone2?: string;
  ville: string;
  commune: string;
  quartier: string;
  repereVisuel: string; // Ex: En face de la pharmacie du rond-point
  revendeurId?: number;
  revendeurNom?: string;
  livreurId?: number;
  livreurNom?: string;
  statut: OrderStatus;
  modePaiement: PaymentMethod;
  statutPaiement: PaymentStatus;
  fraisLivraison: number;
  montantArticles: number;
  montantTotal: number;
  totalMargeRevendeur: number;
  totalMargePlateforme: number;
  motifEchec?: DeliveryFailureReason;
  commentaireEchec?: string;
  items: OrderItem[];
  historiqueStatuts: {
    statut: OrderStatus;
    date: string;
    note?: string;
  }[];
}

export interface WalletTransaction {
  id: number;
  revendeurId: number;
  type: 'CREDIT_COMMISSION' | 'RETRAIT_MOBILE_MONEY' | 'ANNULATION_COMMISSION';
  montant: number;
  date: string;
  referenceCommande?: string;
  statut: 'VALIDE' | 'EN_ATTENTE' | 'REJETE';
  operateurMobileMoney?: MobileMoneyOperator;
  numeroTelephoneMobileMoney?: string;
  motif?: string;
}

export interface RestockRequest {
  id: number;
  fournisseurId: number;
  fournisseurNom: string;
  produitId: number;
  produitNom: string;
  quantite: number;
  prixAchatUnitaire: number;
  dateDeclaration: string;
  statut: 'EN_TRANSIT' | 'RECEPTIONNE' | 'ANNULE';
}

export interface FaqItem {
  id: string;
  question: string;
  reponse: string;
  categorie: 'LIVRAISON' | 'PAIEMENT' | 'REVENDEUR' | 'GENERAL';
  ordre: number;
}
