import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// ✅ 使用环境变量配置 Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 验证配置是否完整
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase 配置缺失！请检查 .env.local 文件');
  throw new Error('Firebase configuration is incomplete');
}

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 导出 Firebase 服务实例
export const db = getFirestore(app);           // Firestore 数据库
export const realtimeDb = getDatabase(app);    // Realtime Database
export const storage = getStorage(app);        // Cloud Storage

export default app;
