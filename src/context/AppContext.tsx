import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Role,
  Product,
  Category,
  Order,
  OrderStatus,
  OrderItem,
  PaymentMethod,
  DeliveryFailureReason,
  WalletTransaction,
  RestockRequest,
  MobileMoneyOperator,
  FaqItem,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS,
  INITIAL_RESTOCKS,
  INITIAL_FAQS,
} from '../data/initialData';
import {
  seedFirestoreIfEmpty,
  subscribeToFirestore,
  syncSaveOrder,
  syncUpdateOrder,
  syncSaveProduct,
  syncUpdateProduct,
  syncSaveTransaction,
  syncUpdateTransaction,
  syncUpdateUser,
  syncSaveRestock,
  syncUpdateRestock,
} from '../services/firestoreService';
import { onAuthStateListener, logoutUser } from '../services/authService';

interface CartItem {
  product: Product;
  quantity: number;
  customPriceClient?: number; // pour revendeur fixant son prix
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: Role) => void;
  users: User[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  transactions: WalletTransaction[];
  restocks: RestockRequest[];
  faqs: FaqItem[];
  cart: CartItem[];
  toasts: ToastMessage[];
  isCloudConnected: boolean;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Panier
  addToCart: (product: Product, quantity?: number, customPriceClient?: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  updateCartPriceClient: (productId: number, price: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;

  // Commandes & Logistique
  createOrder: (orderData: {
    clientNom: string;
    clientPrenom: string;
    clientTelephone: string;
    clientTelephone2?: string;
    ville: string;
    commune: string;
    quartier: string;
    repereVisuel: string;
    modePaiement: PaymentMethod;
    isRevendeurSale?: boolean;
  }) => Order | null;

  updateOrderStatus: (
    orderId: number,
    newStatus: OrderStatus,
    note?: string,
    additionalData?: {
      livreurId?: number;
      livreurNom?: string;
      motifEchec?: DeliveryFailureReason;
      commentaireEchec?: string;
    }
  ) => boolean;

  assignOrderToDelivery: (orderId: number, livreurId: number) => boolean;
  completeDelivery: (orderId: number) => boolean;
  failDelivery: (orderId: number, motif: DeliveryFailureReason, commentaire?: string) => boolean;

  // Portefeuille Revendeur
  requestWithdrawal: (
    montant: number,
    operateur: MobileMoneyOperator,
    telephone: string
  ) => boolean;
  approveWithdrawal: (transactionId: number) => boolean;
  rejectWithdrawal: (transactionId: number, motif: string) => boolean;

  // Produits & Approvisionnements
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  requestRestock: (produitId: number, quantite: number) => void;
  receiveRestock: (restockId: number) => void;

  // Mode Hors Ligne & Connectivité Malienne
  isOnline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  pendingOfflineCount: number;
  syncOfflineQueue: () => Promise<void>;

  // Canal WhatsApp MaliResell
  isWhatsAppOpen: boolean;
  whatsAppInitialMessage: string;
  openWhatsApp: (defaultMessage?: string) => void;
  closeWhatsApp: () => void;

  // Authentification & Sécurité Cloisonnée
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isDeploymentGuideOpen: boolean;
  openDeploymentGuide: () => void;
  closeDeploymentGuide: () => void;
  handleLogout: () => Promise<void>;

  // Helpers
  formatFCFA: (amount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('maliresell_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUser = localStorage.getItem('maliresell_active_user');
    return savedUser ? JSON.parse(savedUser) : users[1]; // Default Revendeur (Ousmane)
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('maliresell_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('maliresell_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem('maliresell_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [restocks, setRestocks] = useState<RestockRequest[]>(() => {
    const saved = localStorage.getItem('maliresell_restocks');
    return saved ? JSON.parse(saved) : INITIAL_RESTOCKS;
  });

  const [faqs, setFaqs] = useState<FaqItem[]>(() => {
    const saved = localStorage.getItem('maliresell_faqs');
    return saved ? JSON.parse(saved) : INITIAL_FAQS;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // Synchronisation Cloud Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupFirestore = async () => {
      try {
        await seedFirestoreIfEmpty();
        setIsCloudConnected(true);

        unsubscribe = subscribeToFirestore({
          onUsers: (cloudUsers) => {
            if (cloudUsers.length > 0) setUsers(cloudUsers);
          },
          onProducts: (cloudProducts) => {
            if (cloudProducts.length > 0) setProducts(cloudProducts);
          },
          onOrders: (cloudOrders) => {
            if (cloudOrders.length > 0) setOrders(cloudOrders);
          },
          onTransactions: (cloudTxs) => {
            if (cloudTxs.length > 0) setTransactions(cloudTxs);
          },
          onRestocks: (cloudRestocks) => {
            if (cloudRestocks.length > 0) setRestocks(cloudRestocks);
          },
          onFaqs: (cloudFaqs) => {
            if (cloudFaqs.length > 0) setFaqs(cloudFaqs);
          },
          onError: (err) => {
            console.warn('Firestore subscription error (offline fallback):', err);
          },
        });
      } catch (err) {
        console.warn('Could not connect to Firestore, running in robust offline mode:', err);
      }
    };

    setupFirestore();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('maliresell_faqs', JSON.stringify(faqs));
  }, [faqs]);

  // Synchronisation locale pour persistance et mode hors ligne
  useEffect(() => {
    localStorage.setItem('maliresell_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('maliresell_active_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('maliresell_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('maliresell_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('maliresell_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('maliresell_restocks', JSON.stringify(restocks));
  }, [restocks]);

  // Connectivité & Mode Hors Ligne (Réseau Malien)
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    return localStorage.getItem('maliresell_simulated_offline') === 'true';
  });
  const [offlineQueue, setOfflineQueue] = useState<Array<{ id: string; type: string; payload: any; timestamp: string }>>(() => {
    const saved = localStorage.getItem('maliresell_offline_queue');
    return saved ? JSON.parse(saved) : [];
  });

  // Support WhatsApp Bamako
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);
  const [whatsAppInitialMessage, setWhatsAppInitialMessage] = useState<string>('');

  const openWhatsApp = (defaultMessage?: string) => {
    setWhatsAppInitialMessage(defaultMessage || '');
    setIsWhatsAppOpen(true);
  };

  const closeWhatsApp = () => {
    setIsWhatsAppOpen(false);
  };

  // Authentification Modal & Guide de Déploiement
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isDeploymentGuideOpen, setIsDeploymentGuideOpen] = useState<boolean>(false);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openDeploymentGuide = () => {
    setIsDeploymentGuideOpen(true);
  };

  const closeDeploymentGuide = () => {
    setIsDeploymentGuideOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      const defaultUser = users.find((u) => u.role === 'CLIENT') || INITIAL_USERS[0];
      setCurrentUser(defaultUser);
      addToast('Déconnexion réussie. Mode invité / client actif.', 'info');
    } catch (err) {
      console.error('Erreur déconnexion:', err);
    }
  };

  // Écouteur Firebase Auth temps réel
  useEffect(() => {
    const unsubscribe = onAuthStateListener((firebaseUser) => {
      if (firebaseUser) {
        // Associer le profil existant ou synchroniser
        const match = users.find(
          (u) =>
            u.firebaseUid === firebaseUser.uid ||
            (firebaseUser.email && u.email.toLowerCase() === firebaseUser.email.toLowerCase())
        );
        if (match && currentUser.id !== match.id) {
          setCurrentUser(match);
        }
      }
    });

    return () => unsubscribe();
  }, [users, currentUser]);

  const effectiveOnline = isOnline && !isSimulatedOffline;

  const queueOfflineAction = (type: string, payload: any) => {
    const action = {
      id: Date.now().toString() + Math.random().toString(),
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
    setOfflineQueue((prev) => {
      const updated = [...prev, action];
      localStorage.setItem('maliresell_offline_queue', JSON.stringify(updated));
      return updated;
    });
  };

  const syncOfflineQueue = async () => {
    const queue = JSON.parse(localStorage.getItem('maliresell_offline_queue') || '[]');
    if (queue.length === 0) return;

    try {
      for (const item of queue) {
        if (item.type === 'CREATE_ORDER') {
          await syncSaveOrder(item.payload);
        } else if (item.type === 'UPDATE_ORDER') {
          await syncUpdateOrder(item.payload.id, item.payload.data);
        } else if (item.type === 'REQUEST_RESTOCK') {
          await syncSaveRestock(item.payload);
        } else if (item.type === 'RECEIVE_RESTOCK') {
          await syncUpdateRestock(item.payload.id, { statut: 'RECEPTIONNE' });
        } else if (item.type === 'UPDATE_PRODUCT') {
          await syncUpdateProduct(item.payload.id, item.payload.data);
        }
      }
      localStorage.removeItem('maliresell_offline_queue');
      setOfflineQueue([]);
      addToast(`Synchronisation réussie : ${queue.length} opération(s) transmise(s) à Firestore !`, 'success');
    } catch (err) {
      console.warn('Erreur lors du resync offline queue:', err);
      addToast('Erreur réseau. Vos données restent sécurisées localement.', 'error');
    }
  };

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      localStorage.setItem('maliresell_simulated_offline', String(next));
      if (next) {
        addToast('Mode Hors Ligne activé (Simulation de coupure réseau Malitel/Orange)', 'info');
      } else {
        addToast('Mode Hors Ligne désactivé. Reconnexion et synchronisation en cours...', 'success');
        syncOfflineQueue();
      }
      return next;
    });
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast('Réseau Internet rétabli ! Mode en ligne actif.', 'success');
      syncOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast('Connexion perdue. Passage en mode Hors Ligne (données sécurisées en mémoire locale).', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchRole = (role: Role) => {
    const userFound = users.find((u) => u.role === role);
    if (userFound) {
      setCurrentUser(userFound);
      addToast(`Basculé sur le profil : ${userFound.prenom} ${userFound.nom} (${role})`, 'info');
    }
  };

  const formatFCFA = (amount: number): string => {
    return (
      new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: 0,
      }).format(Math.round(amount)) + ' FCFA'
    );
  };

  // PANIER
  const addToCart = (product: Product, quantity = 1, customPriceClient?: number) => {
    // Vérification stock disponible (RM-06)
    const availableStock = product.stockPhysique - product.stockReserve;
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;

    if (currentQtyInCart + quantity > availableStock) {
      addToast(`Stock disponible insuffisant pour ${product.nom} (restant: ${availableStock})`, 'error');
      return;
    }

    // Contrôle prix revendeur plancher (RM-01)
    let finalClientPrice = customPriceClient || product.prixConseilleClient;
    if (customPriceClient && customPriceClient < product.prixRevendeur) {
      addToast(`Le prix client ne peut pas être inférieur au prix revendeur (${formatFCFA(product.prixRevendeur)})`, 'error');
      finalClientPrice = product.prixRevendeur;
    }

    setCart((prev) => {
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (customPriceClient) {
          updated[existingIndex].customPriceClient = finalClientPrice;
        }
        return updated;
      }
      return [...prev, { product, quantity, customPriceClient: finalClientPrice }];
    });

    addToast(`${product.nom} ajouté au panier`, 'success');
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const availableStock = product.stockPhysique - product.stockReserve;
    if (quantity > availableStock) {
      addToast(`Stock insuffisant (${availableStock} max)`, 'error');
      return;
    }

    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const updateCartPriceClient = (productId: number, price: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (price < product.prixRevendeur) {
      addToast(`Prix plancher revendeur non respecté (min: ${formatFCFA(product.prixRevendeur)})`, 'error');
      price = product.prixRevendeur;
    }

    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, customPriceClient: price } : item))
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // CRÉATION DE COMMANDE
  const createOrder = (orderData: {
    clientNom: string;
    clientPrenom: string;
    clientTelephone: string;
    clientTelephone2?: string;
    ville: string;
    commune: string;
    quartier: string;
    repereVisuel: string;
    modePaiement: PaymentMethod;
    isRevendeurSale?: boolean;
  }): Order | null => {
    if (cart.length === 0) {
      addToast('Votre panier est vide', 'error');
      return null;
    }

    // Contrôle stock disponible global
    for (const item of cart) {
      const p = products.find((prod) => prod.id === item.product.id);
      if (!p || item.quantity > p.stockPhysique - p.stockReserve) {
        addToast(`Le produit ${item.product.nom} n'est plus disponible dans la quantité demandée`, 'error');
        return null;
      }
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const reference = `MR-${dateStr}-${randomSeq}`;

    const isRevendeur = orderData.isRevendeurSale || currentUser.role === 'REVENDEUR';
    const revendeurUser = isRevendeur
      ? currentUser.role === 'REVENDEUR'
        ? currentUser
        : users.find((u) => u.role === 'REVENDEUR')
      : undefined;

    let montantArticles = 0;
    let totalMargeRevendeur = 0;
    let totalMargePlateforme = 0;

    const orderItems: OrderItem[] = cart.map((item, index) => {
      const p = item.product;
      const pClient =
        isRevendeur && item.customPriceClient ? item.customPriceClient : p.prixConseilleClient;
      const pRevendeur = p.prixRevendeur;
      const pFournisseur = p.prixAchatFournisseur;

      const margeRevendeur = isRevendeur ? Math.max(0, pClient - pRevendeur) : 0;
      const margePlateforme = isRevendeur ? pRevendeur - pFournisseur : pClient - pFournisseur;
      const totalLigne = pClient * item.quantity;

      montantArticles += totalLigne;
      totalMargeRevendeur += margeRevendeur * item.quantity;
      totalMargePlateforme += margePlateforme * item.quantity;

      return {
        id: index + 1,
        produitId: p.id,
        produitNom: p.nom,
        produitSku: p.sku,
        quantite: item.quantity,
        prixFournisseurUnitaire: pFournisseur,
        prixRevendeurUnitaire: pRevendeur,
        prixVenteUnitaire: pClient,
        margeRevendeurUnitaire: margeRevendeur,
        margePlateformeUnitaire: margePlateforme,
        totalLigne,
      };
    });

    const fraisLivraison = orderData.ville.toLowerCase().includes('bamako') ? 1500 : 3000;
    const montantTotal = montantArticles + fraisLivraison;

    const newId = orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 1;

    const newOrder: Order = {
      id: newId,
      reference,
      dateCreation: new Date().toISOString(),
      clientId: currentUser.id,
      clientFirebaseUid: currentUser.firebaseUid,
      clientNom: orderData.clientNom,
      clientPrenom: orderData.clientPrenom,
      clientTelephone: orderData.clientTelephone,
      clientTelephone2: orderData.clientTelephone2,
      ville: orderData.ville,
      commune: orderData.commune,
      quartier: orderData.quartier,
      repereVisuel: orderData.repereVisuel,
      revendeurId: revendeurUser?.id,
      revendeurNom: revendeurUser ? `${revendeurUser.prenom} ${revendeurUser.nom}` : undefined,
      statut: 'EN_ATTENTE',
      modePaiement: orderData.modePaiement,
      statutPaiement: 'EN_ATTENTE',
      fraisLivraison,
      montantArticles,
      montantTotal,
      totalMargeRevendeur,
      totalMargePlateforme,
      items: orderItems,
      historiqueStatuts: [
        {
          statut: 'EN_ATTENTE',
          date: new Date().toISOString(),
          note: isRevendeur
            ? `Vente saisie par le revendeur ${revendeurUser?.prenom} ${revendeurUser?.nom}`
            : 'Commande passée en ligne par le client',
        },
      ],
    };

    // RM-05 : Incrémenter le stock réservé
    setProducts((prev) =>
      prev.map((prod) => {
        const item = cart.find((ci) => ci.product.id === prod.id);
        if (item) {
          const updatedProd = {
            ...prod,
            stockReserve: prod.stockReserve + item.quantity,
          };
          syncUpdateProduct(prod.id, { stockReserve: updatedProd.stockReserve });
          return updatedProd;
        }
        return prod;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);

    if (!effectiveOnline) {
      queueOfflineAction('CREATE_ORDER', newOrder);
      addToast(`[Mode Hors Ligne] Commande ${reference} enregistrée localement. Synchronisation dès retour du réseau.`, 'success');
    } else {
      syncSaveOrder(newOrder);
      addToast(`Commande ${reference} enregistrée avec succès !`, 'success');
    }

    clearCart();
    return newOrder;
  };

  // TRANSITION DU STATUT DE COMMANDE (RM-09)
  const updateOrderStatus = (
    orderId: number,
    newStatus: OrderStatus,
    note?: string,
    additionalData?: {
      livreurId?: number;
      livreurNom?: string;
      motifEchec?: DeliveryFailureReason;
      commentaireEchec?: string;
    }
  ): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    // Décrémentation définitive du stock lors du passage à EXPEDIEE (RM-07)
    if (newStatus === 'EXPEDIEE' && order.statut !== 'EXPEDIEE') {
      setProducts((prev) =>
        prev.map((prod) => {
          const item = order.items.find((oi) => oi.produitId === prod.id);
          if (item) {
            const updated = {
              ...prod,
              stockPhysique: Math.max(0, prod.stockPhysique - item.quantite),
              stockReserve: Math.max(0, prod.stockReserve - item.quantite),
            };
            syncUpdateProduct(prod.id, {
              stockPhysique: updated.stockPhysique,
              stockReserve: updated.stockReserve,
            });
            return updated;
          }
          return prod;
        })
      );
    }

    // Restitution du stock en cas d'ANNULATION ou d'ÉCHEC (RM-08)
    if (
      (newStatus === 'ANNULEE' || newStatus === 'ECHOUEE') &&
      order.statut !== 'ANNULEE' &&
      order.statut !== 'ECHOUEE'
    ) {
      setProducts((prev) =>
        prev.map((prod) => {
          const item = order.items.find((oi) => oi.produitId === prod.id);
          if (item) {
            let updated: Product;
            if (order.statut === 'EXPEDIEE') {
              updated = {
                ...prod,
                stockPhysique: prod.stockPhysique + item.quantite,
              };
              syncUpdateProduct(prod.id, { stockPhysique: updated.stockPhysique });
            } else {
              updated = {
                ...prod,
                stockReserve: Math.max(0, prod.stockReserve - item.quantite),
              };
              syncUpdateProduct(prod.id, { stockReserve: updated.stockReserve });
            }
            return updated;
          }
          return prod;
        })
      );
    }

    // Déblocage conditionnel de la marge revendeur sur LIVREE (RM-12)
    if (
      newStatus === 'LIVREE' &&
      order.statut !== 'LIVREE' &&
      order.revendeurId &&
      order.totalMargeRevendeur > 0
    ) {
      // Créditer le wallet du revendeur
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === order.revendeurId) {
            const newSolde = (u.soldeWallet || 0) + order.totalMargeRevendeur;
            syncUpdateUser(u.id, { soldeWallet: newSolde });
            return {
              ...u,
              soldeWallet: newSolde,
            };
          }
          return u;
        })
      );

      // Enregistrer transaction
      const newTxId = transactions.length > 0 ? Math.max(...transactions.map((t) => t.id)) + 1 : 1;
      const newTx: WalletTransaction = {
        id: newTxId,
        revendeurId: order.revendeurId,
        type: 'CREDIT_COMMISSION',
        montant: order.totalMargeRevendeur,
        date: new Date().toISOString(),
        referenceCommande: order.reference,
        statut: 'VALIDE',
      };
      setTransactions((prev) => [newTx, ...prev]);
      syncSaveTransaction(newTx);
    }

    const updatedOrder: Order = {
      ...order,
      statut: newStatus,
      livreurId: additionalData?.livreurId ?? order.livreurId,
      livreurNom: additionalData?.livreurNom ?? order.livreurNom,
      motifEchec: additionalData?.motifEchec ?? order.motifEchec,
      commentaireEchec: additionalData?.commentaireEchec ?? order.commentaireEchec,
      statutPaiement: newStatus === 'LIVREE' ? 'PAYE' : order.statutPaiement,
      historiqueStatuts: [
        ...order.historiqueStatuts,
        {
          statut: newStatus,
          date: new Date().toISOString(),
          note: note || `Statut passé à ${newStatus}`,
        },
      ],
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
    syncUpdateOrder(orderId, updatedOrder);

    addToast(`Commande ${order.reference} : statut mis à jour vers ${newStatus}`, 'info');
    return true;
  };

  const assignOrderToDelivery = (orderId: number, livreurId: number): boolean => {
    const livreur = users.find((u) => u.id === livreurId && u.role === 'LIVREUR');
    if (!livreur) {
      addToast('Livreur non trouvé', 'error');
      return false;
    }
    return updateOrderStatus(
      orderId,
      'EN_PREPARATION',
      `Assigné au livreur ${livreur.prenom} ${livreur.nom}`,
      {
        livreurId: livreur.id,
        livreurNom: `${livreur.prenom} ${livreur.nom}`,
      }
    );
  };

  const completeDelivery = (orderId: number): boolean => {
    return updateOrderStatus(
      orderId,
      'LIVREE',
      'Livraison confirmée et paiement encaissé avec succès'
    );
  };

  const failDelivery = (
    orderId: number,
    motif: DeliveryFailureReason,
    commentaire?: string
  ): boolean => {
    return updateOrderStatus(
      orderId,
      'ECHOUEE',
      `Tentative de livraison infructueuse : ${motif}`,
      {
        motifEchec: motif,
        commentaireEchec: commentaire,
      }
    );
  };

  // PORTEFEUILLE REVENDEUR (RM-14, RM-15)
  const requestWithdrawal = (
    montant: number,
    operateur: MobileMoneyOperator,
    telephone: string
  ): boolean => {
    if (montant < 2000) {
      addToast('Le montant minimum de retrait est de 2 000 FCFA (RM-14)', 'error');
      return false;
    }

    const revendeur = users.find((u) => u.id === currentUser.id);
    if (!revendeur || (revendeur.soldeWallet || 0) < montant) {
      addToast('Solde disponible insuffisant pour effectuer ce retrait', 'error');
      return false;
    }

    const newSolde = (revendeur.soldeWallet || 0) - montant;
    // Débit du solde
    setUsers((prev) =>
      prev.map((u) => (u.id === revendeur.id ? { ...u, soldeWallet: newSolde } : u))
    );
    syncUpdateUser(revendeur.id, { soldeWallet: newSolde });

    if (currentUser.id === revendeur.id) {
      setCurrentUser((prev) => ({ ...prev, soldeWallet: newSolde }));
    }

    const newTxId = transactions.length > 0 ? Math.max(...transactions.map((t) => t.id)) + 1 : 1;
    const newTx: WalletTransaction = {
      id: newTxId,
      revendeurId: revendeur.id,
      type: 'RETRAIT_MOBILE_MONEY',
      montant,
      date: new Date().toISOString(),
      statut: 'EN_ATTENTE',
      operateurMobileMoney: operateur,
      numeroTelephoneMobileMoney: telephone,
    };

    setTransactions((prev) => [newTx, ...prev]);
    syncSaveTransaction(newTx);
    addToast(
      `Demande de retrait de ${formatFCFA(montant)} vers ${operateur} enregistrée !`,
      'success'
    );
    return true;
  };

  const approveWithdrawal = (transactionId: number): boolean => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? { ...t, statut: 'VALIDE' } : t))
    );
    syncUpdateTransaction(transactionId, { statut: 'VALIDE' });
    addToast('Demande de retrait approuvée et versée avec succès', 'success');
    return true;
  };

  const rejectWithdrawal = (transactionId: number, motif: string): boolean => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx || tx.statut !== 'EN_ATTENTE') return false;

    // Recréditer le revendeur
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === tx.revendeurId) {
          const restored = (u.soldeWallet || 0) + tx.montant;
          syncUpdateUser(u.id, { soldeWallet: restored });
          return { ...u, soldeWallet: restored };
        }
        return u;
      })
    );

    setTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? { ...t, statut: 'REJETE', motif } : t))
    );
    syncUpdateTransaction(transactionId, { statut: 'REJETE', motif });
    addToast(`Retrait rejeté. ${formatFCFA(tx.montant)} restitués au compte revendeur`, 'info');
    return true;
  };

  // PRODUITS & FOURNISSEURS
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const newProd: Product = { ...productData, id: newId };
    setProducts((prev) => [newProd, ...prev]);
    syncSaveProduct(newProd);
    addToast(`Produit ${newProd.nom} ajouté au catalogue`, 'success');
  };

  const updateProduct = (id: number, updated: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    syncUpdateProduct(id, updated);
    addToast('Fiche produit mise à jour', 'info');
  };

  const requestRestock = (produitId: number, quantite: number) => {
    const prod = products.find((p) => p.id === produitId);
    if (!prod) return;

    const newRestockId = restocks.length > 0 ? Math.max(...restocks.map((r) => r.id)) + 1 : 1;
    const fNom =
      currentUser.role === 'FOURNISSEUR'
        ? currentUser.nomEntreprise || `${currentUser.prenom} ${currentUser.nom}`
        : (users.find((u) => u.id === prod.fournisseurId)?.nomEntreprise || 'Keïta Électronique SARL');

    const newRestock: RestockRequest = {
      id: newRestockId,
      fournisseurId: prod.fournisseurId,
      fournisseurNom: fNom,
      produitId: prod.id,
      produitNom: prod.nom,
      quantite,
      prixAchatUnitaire: prod.prixAchatFournisseur,
      dateDeclaration: new Date().toISOString(),
      statut: 'EN_TRANSIT',
    };

    setRestocks((prev) => [newRestock, ...prev]);

    if (!effectiveOnline) {
      queueOfflineAction('REQUEST_RESTOCK', newRestock);
      addToast(
        `[Mode Hors Ligne] Avis de réassort pour ${quantite}x ${prod.nom} sauvegardé en mémoire locale. Synchronisation dès retour du réseau.`,
        'info'
      );
    } else {
      syncSaveRestock(newRestock);
      addToast(`Avis de réassort pour ${quantite}x ${prod.nom} envoyé au Hub MaliResell`, 'success');
    }
  };

  const receiveRestock = (restockId: number) => {
    const restock = restocks.find((r) => r.id === restockId);
    if (!restock || restock.statut === 'RECEPTIONNE') return;

    const prod = products.find((p) => p.id === restock.produitId);
    const newQty = (prod?.stockPhysique || 0) + restock.quantite;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === restock.produitId) {
          return { ...p, stockPhysique: newQty };
        }
        return p;
      })
    );

    setRestocks((prev) =>
      prev.map((r) => (r.id === restockId ? { ...r, statut: 'RECEPTIONNE' } : r))
    );

    if (!effectiveOnline) {
      queueOfflineAction('RECEIVE_RESTOCK', { id: restockId });
      queueOfflineAction('UPDATE_PRODUCT', { id: restock.produitId, data: { stockPhysique: newQty } });
      addToast(`[Mode Hors Ligne] Réception de ${restock.quantite} articles validée localement.`, 'info');
    } else {
      syncUpdateProduct(restock.produitId, { stockPhysique: newQty });
      syncUpdateRestock(restockId, { statut: 'RECEPTIONNE' });
      addToast(`Réassort de ${restock.quantite} articles réceptionné en stock physique`, 'success');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        users,
        products,
        categories,
        orders,
        transactions,
        restocks,
        faqs,
        cart,
        toasts,
        isCloudConnected,
        isOnline,
        isSimulatedOffline,
        toggleSimulatedOffline,
        pendingOfflineCount: offlineQueue.length,
        syncOfflineQueue,
        isWhatsAppOpen,
        whatsAppInitialMessage,
        openWhatsApp,
        closeWhatsApp,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        isDeploymentGuideOpen,
        openDeploymentGuide,
        closeDeploymentGuide,
        handleLogout,
        addToast,
        removeToast,
        addToCart,
        updateCartQuantity,
        updateCartPriceClient,
        removeFromCart,
        clearCart,
        createOrder,
        updateOrderStatus,
        assignOrderToDelivery,
        completeDelivery,
        failDelivery,
        requestWithdrawal,
        approveWithdrawal,
        rejectWithdrawal,
        addProduct,
        updateProduct,
        requestRestock,
        receiveRestock,
        formatFCFA,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp doit être utilisé au sein de AppProvider');
  }
  return context;
};
