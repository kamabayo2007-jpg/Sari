import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Product, Category, Order, WalletTransaction, RestockRequest, FaqItem } from '../types';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS,
  INITIAL_RESTOCKS,
  INITIAL_FAQS,
} from '../data/initialData';

const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  TRANSACTIONS: 'transactions',
  RESTOCKS: 'restocks',
  FAQS: 'faqs',
};

// Initialisation idempotente de la base Firestore si vide
export async function seedFirestoreIfEmpty() {
  try {
    const productsSnap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    if (productsSnap.empty) {
      console.log('Seeding initial data to Firestore...');

      // Seed Users
      for (const u of INITIAL_USERS) {
        await setDoc(doc(db, COLLECTIONS.USERS, String(u.id)), u);
      }

      // Seed Categories
      for (const c of INITIAL_CATEGORIES) {
        await setDoc(doc(db, COLLECTIONS.CATEGORIES, String(c.id)), c);
      }

      // Seed Products
      for (const p of INITIAL_PRODUCTS) {
        await setDoc(doc(db, COLLECTIONS.PRODUCTS, String(p.id)), p);
      }

      // Seed Orders
      for (const o of INITIAL_ORDERS) {
        await setDoc(doc(db, COLLECTIONS.ORDERS, String(o.id)), o);
      }

      // Seed Transactions
      for (const t of INITIAL_TRANSACTIONS) {
        await setDoc(doc(db, COLLECTIONS.TRANSACTIONS, String(t.id)), t);
      }

      // Seed Restocks
      for (const r of INITIAL_RESTOCKS) {
        await setDoc(doc(db, COLLECTIONS.RESTOCKS, String(r.id)), r);
      }

      // Seed FAQs
      for (const f of INITIAL_FAQS) {
        await setDoc(doc(db, COLLECTIONS.FAQS, f.id), f);
      }
      console.log('Firestore seed completed successfully!');
    } else {
      // Vérifier et initialiser les FAQs si la collection n'existe pas encore
      const faqsSnap = await getDocs(collection(db, COLLECTIONS.FAQS));
      if (faqsSnap.empty) {
        console.log('Seeding FAQs to Firestore...');
        for (const f of INITIAL_FAQS) {
          await setDoc(doc(db, COLLECTIONS.FAQS, f.id), f);
        }
      }
    }
  } catch (err) {
    console.warn('Firestore seeding notice:', err);
  }
}

// Écouteurs temps réel Firestore
export function subscribeToFirestore(callbacks: {
  onUsers: (users: User[]) => void;
  onProducts: (products: Product[]) => void;
  onOrders: (orders: Order[]) => void;
  onTransactions: (txs: WalletTransaction[]) => void;
  onRestocks: (restocks: RestockRequest[]) => void;
  onFaqs?: (faqs: FaqItem[]) => void;
  onError?: (err: Error) => void;
}) {
  const unsubUsers = onSnapshot(
    collection(db, COLLECTIONS.USERS),
    (snap) => {
      if (!snap.empty) {
        const data = snap.docs.map((d) => d.data() as User);
        data.sort((a, b) => a.id - b.id);
        callbacks.onUsers(data);
      }
    },
    (err) => callbacks.onError?.(err)
  );

  const unsubProducts = onSnapshot(
    collection(db, COLLECTIONS.PRODUCTS),
    (snap) => {
      if (!snap.empty) {
        const data = snap.docs.map((d) => d.data() as Product);
        data.sort((a, b) => a.id - b.id);
        callbacks.onProducts(data);
      }
    },
    (err) => callbacks.onError?.(err)
  );

  const unsubOrders = onSnapshot(
    collection(db, COLLECTIONS.ORDERS),
    (snap) => {
      if (!snap.empty) {
        const data = snap.docs.map((d) => d.data() as Order);
        data.sort((a, b) => b.id - a.id); // Plus récentes en premier
        callbacks.onOrders(data);
      }
    },
    (err) => callbacks.onError?.(err)
  );

  const unsubTransactions = onSnapshot(
    collection(db, COLLECTIONS.TRANSACTIONS),
    (snap) => {
      if (!snap.empty) {
        const data = snap.docs.map((d) => d.data() as WalletTransaction);
        data.sort((a, b) => b.id - a.id);
        callbacks.onTransactions(data);
      }
    },
    (err) => callbacks.onError?.(err)
  );

  const unsubRestocks = onSnapshot(
    collection(db, COLLECTIONS.RESTOCKS),
    (snap) => {
      if (!snap.empty) {
        const data = snap.docs.map((d) => d.data() as RestockRequest);
        data.sort((a, b) => b.id - a.id);
        callbacks.onRestocks(data);
      }
    },
    (err) => callbacks.onError?.(err)
  );

  const unsubFaqs = onSnapshot(
    collection(db, COLLECTIONS.FAQS),
    (snap) => {
      if (!snap.empty && callbacks.onFaqs) {
        const data = snap.docs.map((d) => d.data() as FaqItem);
        data.sort((a, b) => a.ordre - b.ordre);
        callbacks.onFaqs(data);
      }
    },
    (err) => callbacks.onError?.(err)
  );

  return () => {
    unsubUsers();
    unsubProducts();
    unsubOrders();
    unsubTransactions();
    unsubRestocks();
    unsubFaqs();
  };
}

// Opérations de sauvegarde Cloud
export async function syncSaveOrder(order: Order) {
  try {
    await setDoc(doc(db, COLLECTIONS.ORDERS, String(order.id)), order);
  } catch (err) {
    console.warn('Sync order to Firestore failed:', err);
  }
}

export async function syncUpdateOrder(orderId: number, data: Partial<Order>) {
  try {
    await updateDoc(doc(db, COLLECTIONS.ORDERS, String(orderId)), data);
  } catch (err) {
    console.warn('Sync update order failed:', err);
  }
}

export async function syncSaveProduct(product: Product) {
  try {
    await setDoc(doc(db, COLLECTIONS.PRODUCTS, String(product.id)), product);
  } catch (err) {
    console.warn('Sync product failed:', err);
  }
}

export async function syncUpdateProduct(productId: number, data: Partial<Product>) {
  try {
    await updateDoc(doc(db, COLLECTIONS.PRODUCTS, String(productId)), data);
  } catch (err) {
    console.warn('Sync update product failed:', err);
  }
}

export async function syncSaveTransaction(tx: WalletTransaction) {
  try {
    await setDoc(doc(db, COLLECTIONS.TRANSACTIONS, String(tx.id)), tx);
  } catch (err) {
    console.warn('Sync transaction failed:', err);
  }
}

export async function syncUpdateTransaction(txId: number, data: Partial<WalletTransaction>) {
  try {
    await updateDoc(doc(db, COLLECTIONS.TRANSACTIONS, String(txId)), data);
  } catch (err) {
    console.warn('Sync update transaction failed:', err);
  }
}

export async function syncSaveUser(user: User) {
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, String(user.id)), user);
  } catch (err) {
    console.warn('Sync user failed:', err);
  }
}

export async function syncUpdateUser(userId: number, data: Partial<User>) {
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, String(userId)), data);
  } catch (err) {
    console.warn('Sync update user failed:', err);
  }
}

export async function syncSaveRestock(restock: RestockRequest) {
  try {
    await setDoc(doc(db, COLLECTIONS.RESTOCKS, String(restock.id)), restock);
  } catch (err) {
    console.warn('Sync restock failed:', err);
  }
}

export async function syncUpdateRestock(restockId: number, data: Partial<RestockRequest>) {
  try {
    await updateDoc(doc(db, COLLECTIONS.RESTOCKS, String(restockId)), data);
  } catch (err) {
    console.warn('Sync update restock failed:', err);
  }
}
