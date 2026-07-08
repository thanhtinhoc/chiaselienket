import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc,
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

// ============================================================================
// HÀM ĐỌC BIẾN MÔI TRƯỜNG LINH HOẠT CHO CẢ VITE VÀ NEXT.JS (DEPLOY VERCEL)
// ============================================================================
const getEnv = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env[`VITE_FIREBASE_${key}`]) return import.meta.env[`VITE_FIREBASE_${key}`];
    if (import.meta.env[`NEXT_PUBLIC_FIREBASE_${key}`]) return import.meta.env[`NEXT_PUBLIC_FIREBASE_${key}`];
    if (import.meta.env[key]) return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[`VITE_FIREBASE_${key}`]) return process.env[`VITE_FIREBASE_${key}`] as string;
    if (process.env[`NEXT_PUBLIC_FIREBASE_${key}`]) return process.env[`NEXT_PUBLIC_FIREBASE_${key}`] as string;
    if (process.env[key]) return process.env[key] as string;
  }
  return '';
};

// ============================================================================
// BẠN CÓ THỂ DÁN TRỰC TIẾP CẤU HÌNH FIREBASE CONFIG CỦA BẠN VÀO ĐÂY:
// (Nếu có biến môi trường trên Vercel/Local, hệ thống sẽ ưu tiên dùng biến môi trường)
// ============================================================================
const firebaseConfig = {
  apiKey: getEnv('API_KEY') || "AIzaSyBNF-j5VnyYsgek0JXOLy1rYFKb3zJV-oU",
  authDomain: getEnv('AUTH_DOMAIN') || "chiaselienket-68a09.firebaseapp.com",
  projectId: getEnv('PROJECT_ID') || "chiaselienket-68a09",
  storageBucket: getEnv('STORAGE_BUCKET') || "chiaselienket-68a09.firebasestorage.app",
  messagingSenderId: getEnv('MESSAGING_SENDER_ID') || "86654994209",
  appId: getEnv('APP_ID') || "1:86654994209:web:351083dc280b4bcefb6060"
};
// ============================================================================

export const hasFirebaseConfig = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes("your_")
);

let app;
let db: any = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
} catch (error) {
  console.error("Lỗi khởi tạo Firebase:", error);
}

export { db };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
