import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBXWv0Rr4AwOPaIyrN_d1LpXwheR80VNOY",
  authDomain: "pspsucesso.firebaseapp.com",
  databaseURL: "https://pspsucesso-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pspsucesso",
  storageBucket: "pspsucesso.firebasestorage.app",
  messagingSenderId: "172792274570",
  appId: "1:172792274570:web:77ada0e1588fb73066d773",
  measurementId: "G-983EPHZ4GZ"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
