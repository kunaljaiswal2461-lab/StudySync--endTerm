import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, addDoc, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { auth, db } from './firebase';

export const signUp = async (email, password, name) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Create user profile in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    name,
    email,
    streak: 0,
    totalFocusMinutes: 0,
    lastActiveDate: serverTimestamp(),
    hasOnboarded: false,
  });
  
  return user;
};

export const completeOnboarding = async (uid) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { hasOnboarded: true });
};

export const login = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  return await signOut(auth);
};

export const getUserProfile = async (uid) => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateUserStats = async (uid, minutes) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    await updateDoc(userRef, {
      totalFocusMinutes: (data.totalFocusMinutes || 0) + minutes,
      lastActiveDate: serverTimestamp(),
    });

    // Also record this as a session
    await addDoc(collection(db, `users/${uid}/sessions`), {
      duration: minutes,
      timestamp: serverTimestamp(),
      type: 'focus'
    });
  }
};

export const getUserSessions = async (uid) => {
  const q = query(
    collection(db, `users/${uid}/sessions`),
    orderBy('timestamp', 'desc'),
    limit(100)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
