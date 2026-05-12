import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: "ADD_FIREBASE_KEY",
  authDomain: "ADD_DOMAIN",
  projectId: "ADD_PROJECT_ID",
  storageBucket: "ADD_BUCKET",
  messagingSenderId: "ADD_SENDER_ID",
  appId: "ADD_APP_ID"
}

export const app = initializeApp(firebaseConfig)