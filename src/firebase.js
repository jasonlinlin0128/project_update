import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBlOglfZtVNC3wkH8FzxPRWpZjbioOisKA",
  authDomain: "project-update-ab874.firebaseapp.com",
  projectId: "project-update-ab874",
  storageBucket: "project-update-ab874.firebasestorage.app",
  messagingSenderId: "149051930119",
  appId: "1:149051930119:web:fa2be596b9c047fdb4dca2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
