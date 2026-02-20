import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- CONFIGURACIÓN FIREBASE ---
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCMNcQoIV9hYsZYHcYr_wmLn71qSJHebIs",
  authDomain: "pedido-digital-online.firebaseapp.com",
  projectId: "pedido-digital-online",
  storageBucket: "pedido-digital-online.firebasestorage.app",
  messagingSenderId: "612281107703",
  appId: "1:612281107703:web:240f0979aaf640986fbff2",
  measurementId: "G-8DVXBZZE93"
};

const app = initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const APP_ID_DB = "1:612281107703:web:240f0979aaf640986fbff2";