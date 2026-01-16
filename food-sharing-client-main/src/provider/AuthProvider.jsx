import { createContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import axios from "axios";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const creatUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const userSignIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

const refreshUser = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser?.email) return;

  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/users/public/${currentUser.email}`
  );

  setUser({
    uid: currentUser.uid,
    email: currentUser.email,
    displayName: data.name,
    photoURL: data.photoURL,
  });
};

  const googleLogin = () => {
    return new GoogleAuthProvider();
  };

  const UserSignOut = async () => {
  try {
    setLoading(true);

    // 1️⃣ Firebase logout
    await signOut(auth);

    // 2️⃣ CLEAR local auth state immediately
    setUser(null);

    // 3️⃣ Clear backend session
    await axios.post(
      `${import.meta.env.VITE_API_URL}/logout`,
      {},
      { withCredentials: true }
    );
  } finally {
    setLoading(false);
  }
};

  const updateUserProfile = (updatedData) => {
    return updateProfile(auth.currentUser, updatedData);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      
      if (currentUser) {
  setUser({
    uid: currentUser.uid,
    email: currentUser.email,
    displayName: currentUser.displayName,
    photoURL: currentUser.photoURL,
  });
} else {
  setUser(null);
}

      // Request notification permission once
      if ("Notification" in window) {
        Notification.requestPermission().catch(() => {});
      }

try {
  if (currentUser?.email) {
    // 1️⃣ Ensure user exists in MongoDB
    await axios.post(
      `${import.meta.env.VITE_API_URL}/users`,
      {
        email: currentUser.email,
        name: currentUser.displayName || "",
        photoURL: currentUser.photoURL || "",
      },
      { withCredentials: true }
    );

    // 2️⃣ Create JWT session
    await axios.post(
      `${import.meta.env.VITE_API_URL}/jwt`,
      { email: currentUser.email },
      { withCredentials: true }
    );

    // 3️⃣ NOW safely fetch MongoDB profile
    const profileRes = await axios.get(
      `${import.meta.env.VITE_API_URL}/users/public/${currentUser.email}`
    );

    // 4️⃣ Sync React auth state with DB profile
    setUser({
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: profileRes.data.name,
      photoURL: profileRes.data.photoURL,
    });
  } else {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/logout`,
      {},
      { withCredentials: true }
    );
    setUser(null);
  }
} catch (err) {
  console.error("Auth sync error:", err);
} finally {
  setLoading(false);
}
    });

    return () => unsubscribe();
  }, []);

  const authInfo = {
    user,
    setUser,
    refreshUser,
    creatUser,
    userSignIn,
    UserSignOut,
    loading,
    updateUserProfile,
    googleLogin,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;