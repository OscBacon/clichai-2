import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

config();

// @ts-ignore
// const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY ?? "";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "build-unicorn25par-4870.firebaseapp.com",
  projectId: "build-unicorn25par-4870",
  storageBucket: "build-unicorn25par-4870.firebasestorage.app",
  messagingSenderId: "707489567779",
  appId: "1:707489567779:web:227043a8c7db8c0aca4d96",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };
