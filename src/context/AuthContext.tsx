import React, { createContext, useContext, useEffect, useState } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getUserRole } from "@/lib/roles";

interface UserData {
  uid: string;
  username: string;
  role: string;
}

interface AuthContextType {
  currentUser: UserData | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registrarLog: (acao: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper: derive username from firebase email "username@psp.com"
function emailToUsername(email: string): string {
  const base = email.split("@")[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

// Try to fetch role from Firestore "roles" collection, fallback to hardcoded map
async function fetchRole(uid: string, username: string): Promise<string> {
  try {
    const snap = await getDoc(doc(db, "roles", uid));
    if (snap.exists() && snap.data().role) {
      return snap.data().role as string;
    }
  } catch (_) {}
  // Fallback to hardcoded map (for backwards compat)
  return getUserRole(username.toLowerCase());
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase Auth state — source of truth, no localStorage
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.email) {
        const username = emailToUsername(firebaseUser.email);
        const role = await fetchRole(firebaseUser.uid, username);
        setCurrentUser({ uid: firebaseUser.uid, username, role });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const registrarLog = async (acao: string) => {
    const user = currentUser;
    try {
      await addDoc(collection(db, "logs"), {
        usuario: user ? user.username : "Sistema",
        cargo: user ? user.role : "N/A",
        acao,
        timestamp: serverTimestamp(),
        data: new Date().toLocaleDateString("pt-PT"),
        hora: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
      });
    } catch (e) {
      console.error("Erro ao gerar log:", e);
    }
  };

  const login = async (username: string, password: string) => {
    const u = username.trim().toLowerCase();
    const email = u + "@psp.com";
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const role = await fetchRole(cred.user.uid, u);
    const userData: UserData = {
      uid: cred.user.uid,
      username: u.charAt(0).toUpperCase() + u.slice(1),
      role,
    };
    setCurrentUser(userData);
    // Log login
    try {
      await addDoc(collection(db, "logs"), {
        usuario: userData.username,
        cargo: userData.role,
        acao: "Iniciou sessão",
        timestamp: serverTimestamp(),
        data: new Date().toLocaleDateString("pt-PT"),
        hora: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
      });
    } catch (_) {}
  };

  const logout = async () => {
    await registrarLog("Encerrou a sessão (Logout)");
    await signOut(auth);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, registrarLog }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
