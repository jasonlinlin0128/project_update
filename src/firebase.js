import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBlOglfZtVNC3wkH8FzxPRWpZjbioOisKA",
  authDomain: "project-update-ab874.firebaseapp.com",
  projectId: "project-update-ab874",
  storageBucket: "project-update-ab874.appspot.com",
  messagingSenderId: "149051930119",
  appId: "1:149051930119:web:fa2be596b9c047fdb4dca2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Firebase Cloud Messaging
// 注意：只有在支援 Service Worker 的環境才能初始化
let messaging = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (e) {
    console.warn('FCM 初始化失敗:', e);
  }
}

export { db, auth, storage, messaging, getToken, onMessage };

