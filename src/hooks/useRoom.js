import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { 
  subscribeToRoomMembers, 
  subscribeToResources,
  subscribeToMessages,
  subscribeToTasks 
} from '../services/roomService';
import { useRoomContext } from '../context/RoomContext';

export const useRoom = (roomId) => {
  const { setMembers, setResources, setMessages, setTasks, setCurrentRoom } = useRoomContext();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomId) return;
    
    // Smart room data fetch (handles IDs and Codes)
    const fetchRoom = async () => {
      setLoading(true);
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        let roomData = null;
        
        // Try direct ID fetch first
        const roomRef = doc(db, 'rooms', roomId);
        const roomSnap = await getDoc(roomRef);
        
        if (roomSnap.exists()) {
          roomData = { id: roomSnap.id, ...roomSnap.data() };
        } else if (roomId.length === 6) {
          // Fallback: Check if it's a Room Code
          const q = query(collection(db, 'rooms'), where('roomCode', '==', roomId.toUpperCase()));
          const qSnap = await getDocs(q);
          if (!qSnap.empty) {
            const doc = qSnap.docs[0];
            roomData = { id: doc.id, ...doc.data() };
          }
        }

        if (roomData) {
          setRoom(roomData);
          setCurrentRoom(roomData);
        } else {
          setError('Room not found');
        }
      } catch (err) {
        console.error("Room Resolution Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();

    // Subscriptions
    const unsubMembers = subscribeToRoomMembers(roomId, setMembers);
    const unsubResources = subscribeToResources(roomId, setResources);
    const unsubMessages = subscribeToMessages(roomId, setMessages);
    const unsubTasks = subscribeToTasks(roomId, setTasks);

    return () => {
      unsubMembers();
      unsubResources();
      unsubMessages();
      unsubTasks();
      setCurrentRoom(null);
      setMembers([]);
      setResources([]);
      setMessages([]);
      setTasks([]);
    };
  }, [roomId, setMembers, setResources, setMessages, setTasks, setCurrentRoom]);

  return { room, loading, error };
};
