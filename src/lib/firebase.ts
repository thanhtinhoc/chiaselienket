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
// BẠN CÓ THỂ DÁN TRỰC TIẾP CẤU HÌNH FIREBASE CONFIG CỦA BẠN VÀO ĐÂY:
// (Thay thế các giá trị dưới đây bằng cấu hình lấy từ Firebase Console của bạn)
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBNF-j5VnyYsgek0JXOLy1rYFKb3zJV-oU",
  authDomain: "chiaselienket-68a09.firebaseapp.com",
  projectId: "chiaselienket-68a09",
  storageBucket: "chiaselienket-68a09.firebasestorage.app",
  messagingSenderId: "86654994209",
  appId: "1:86654994209:web:351083dc280b4bcefb6060"
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
