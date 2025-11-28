import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

interface AuthContextType {
  user: User | null;
  loading: boolean;

  // signup now supports extra profile object
  signup: (
    email: string,
    password: string,
    extra?: string | Record<string, any>
  ) => Promise<void>;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: any }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // observe firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (current) => {
      setUser(current);
      setLoading(false);
    });
    return unsub;
  }, []);

  // SIGNUP — stores role, fullName, etc
  const signup = async (
    email: string,
    password: string,
    extra?: string | Record<string, any>
  ) => {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Build profile data
    let profile: Record<string, any> = {};

    if (typeof extra === "string") {
      // old usage: signup(email, pw, "name")
      profile.name = extra;
    } else if (extra && typeof extra === "object") {
      // new usage: signup(email, pw, { fullName, role, ... })
      profile = extra;
    }

    const finalProfile = {
      uid: userCred.user.uid,
      email,
      createdAt: profile.createdAt ?? new Date().toISOString(),
      ...profile,
    };

    await setDoc(doc(db, "users", userCred.user.uid), finalProfile, {
      merge: true,
    });
  };

  // LOGIN — return type must be Promise<void>
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // LOGOUT
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext)!;
};
