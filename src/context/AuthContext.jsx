import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile = () => {};
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Use onSnapshot for real-time profile updates
        const { onSnapshot, doc } = await import('firebase/firestore');
        unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
            setCurrentUser({ ...user, ...docSnap.data() });
          } else {
            setCurrentUser(user);
          }
          setLoading(false);
        });
      } else {
        unsubscribeProfile();
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  const value = {
    currentUser,
    setCurrentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
