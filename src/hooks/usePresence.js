import { useEffect } from 'react';
import { updateMemberStatus } from '../services/roomService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export const usePresence = (roomId, userId) => {
  useEffect(() => {
    if (!roomId || !userId) return;

    const syncPresence = async () => {
      // Fetch current stats to show badges
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const totalMinutes = userSnap.exists() ? userSnap.data().totalFocusMinutes || 0 : 0;

      await updateMemberStatus(roomId, userId, { 
        status: 'idle',
        totalFocusMinutes: totalMinutes
      });
    };

    syncPresence();

    return () => {
      updateMemberStatus(roomId, userId, { status: 'offline' });
    };
  }, [roomId, userId]);
};
