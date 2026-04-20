import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc, 
  serverTimestamp, 
  deleteDoc,
  onSnapshot,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';

export const createRoom = async (roomData, userId) => {
  try {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomRef = doc(collection(db, 'rooms'));
    const roomId = roomRef.id;
    
    const room = {
      ...roomData,
      id: roomId,
      roomCode,
      createdBy: userId,
      adminId: userId, // Creator is the first Admin
      isActive: true,
      createdAt: serverTimestamp(),
    };
    
    await setDoc(roomRef, room);
    
    // Add creator as member
    await setDoc(doc(db, `rooms/${roomId}/members`, userId), {
      name: roomData.creatorName,
      status: 'idle',
      joinedAt: serverTimestamp(),
      totalMinutesInRoom: 0
    });

    // Add to user's joinedRooms history
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      joinedRooms: arrayUnion(roomId)
    });
    
    return roomId;
  } catch (error) {
    console.error("FATAL: createRoom failed:", error);
    throw error;
  }
};

export const joinRoomByCode = async (roomCode, userId, userName) => {
  try {
    const q = query(collection(db, 'rooms'), where('roomCode', '==', roomCode.toUpperCase()), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Room not found or inactive');
    }
    
    const roomDoc = querySnapshot.docs[0];
    const roomId = roomDoc.id;
    
    await setDoc(doc(db, `rooms/${roomId}/members`, userId), {
      name: userName,
      status: 'idle',
      joinedAt: serverTimestamp(),
      totalMinutesInRoom: 0
    }, { merge: true });

    // Add to user's joinedRooms history
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      joinedRooms: arrayUnion(roomId)
    });
    
    return roomId;
  } catch (error) {
    console.error("FATAL: joinRoomByCode failed:", error);
    throw error;
  }
};

export const getRooms = async () => {
  // We fetch active rooms and then filter/sort in memory 
  // to absolutely guarantee no Firestore composite index errors silently block the feed.
  const q = query(collection(db, 'rooms'), where('isActive', '==', true));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(room => room.isPublic !== false) // If undefined (old rooms), assume public
    .sort((a, b) => {
       const getTime = (dateObj) => {
         if (!dateObj) return 0;
         if (typeof dateObj.toMillis === 'function') return dateObj.toMillis();
         if (dateObj.seconds) return dateObj.seconds * 1000;
         if (dateObj instanceof Date) return dateObj.getTime();
         return 0;
       };
       return getTime(b.createdAt) - getTime(a.createdAt); // Descending
    });
};

export const subscribeToRoomMembers = (roomId, callback) => {
  return onSnapshot(collection(db, `rooms/${roomId}/members`), (snapshot) => {
    const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(members);
  });
};

export const addResource = async (roomId, resource) => {
  await addDoc(collection(db, `rooms/${roomId}/resources`), {
    ...resource,
    addedAt: serverTimestamp(),
  });
};

export const subscribeToResources = (roomId, callback) => {
  return onSnapshot(
    query(collection(db, `rooms/${roomId}/resources`), orderBy('addedAt', 'desc')), 
    (snapshot) => {
      const resources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(resources);
    }
  );
};

export const deleteResource = async (roomId, resourceId) => {
  await deleteDoc(doc(db, `rooms/${roomId}/resources`, resourceId));
};

export const upvoteResource = async (roomId, resourceId, userId) => {
  const resourceRef = doc(db, `rooms/${roomId}/resources`, resourceId);
  await updateDoc(resourceRef, {
    votes: arrayUnion(userId)
  });
};

export const getLeaderboard = async () => {
  const q = query(collection(db, 'users'), orderBy('totalFocusMinutes', 'desc'), limit(10));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateMemberStatus = async (roomId, userId, updates) => {
  const memberRef = doc(db, `rooms/${roomId}/members`, userId);
  await setDoc(memberRef, updates, { merge: true });
};

// Chat System
export const addMessage = async (roomId, message) => {
  await addDoc(collection(db, `rooms/${roomId}/messages`), {
    ...message,
    timestamp: serverTimestamp(),
  });
};

export const transferAdmin = async (roomId, newAdminId) => {
  await updateDoc(doc(db, 'rooms', roomId), { adminId: newAdminId });
};

export const subscribeToMessages = (roomId, callback) => {
  return onSnapshot(
    query(collection(db, `rooms/${roomId}/messages`), orderBy('timestamp', 'asc')), 
    (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(messages);
    }
  );
};

// Task System
export const addTask = async (roomId, task) => {
  await addDoc(collection(db, `rooms/${roomId}/tasks`), {
    ...task,
    completed: false,
    createdAt: serverTimestamp(),
  });
};

export const updateTask = async (roomId, taskId, updates) => {
  await setDoc(doc(db, `rooms/${roomId}/tasks`, taskId), updates, { merge: true });
};

export const deleteTask = async (roomId, taskId) => {
  await deleteDoc(doc(db, `rooms/${roomId}/tasks`, taskId));
};

export const subscribeToTasks = (roomId, callback) => {
  return onSnapshot(
    query(collection(db, `rooms/${roomId}/tasks`), orderBy('createdAt', 'desc')), 
    (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(tasks);
    }
  );
};

// Challenge System
export const addChallenge = async (roomId, challenge) => {
  await addDoc(collection(db, `rooms/${roomId}/challenges`), {
    ...challenge,
    isCompleted: false,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToChallenges = (roomId, callback) => {
  return onSnapshot(
    query(collection(db, `rooms/${roomId}/challenges`), orderBy('createdAt', 'desc'), limit(1)), 
    (snapshot) => {
      const challenges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(challenges[0] || null);
    }
  );
};

export const completeChallenge = async (roomId, challengeId) => {
  await updateDoc(doc(db, `rooms/${roomId}/challenges`, challengeId), { isCompleted: true });
};

export const endRoom = async (roomId) => {
  await updateDoc(doc(db, 'rooms', roomId), { isActive: false });
};

export const subscribeToSessionSummary = (roomId, callback) => {
  return onSnapshot(doc(db, `rooms/${roomId}/currentSession`, 'summary'), (docSnap) => {
    callback(docSnap.exists() ? docSnap.data() : null);
  });
};

export const setSessionSummaryFlag = async (roomId, showSummary) => {
  await setDoc(doc(db, `rooms/${roomId}/currentSession`, 'summary'), {
    showSummary,
    updatedAt: serverTimestamp()
  }, { merge: true });
};
