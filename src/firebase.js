import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCep3LvTgjFUeRhgbcaGYObTWaNK7TWXQ",
  authDomain: "famous-coins.firebaseapp.com",
  projectId: "famous-coins",
  storageBucket: "famous-coins.firebasestorage.app",
  messagingSenderId: "961428237304",
  appId: "1:961428237304:web:325afc7137bf4c5b56440d",
  measurementId: "G-SERNPQF5M4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
