import { ref, onValue, set, update, serverTimestamp } from 'firebase/database';
import { rtdb } from './firebase';

export const subscribeToTimer = (roomId, callback) => {
  const timerRef = ref(rtdb, `rooms/${roomId}/timer`);
  return onValue(timerRef, (snapshot) => {
    callback(snapshot.val());
  });
};

export const updateTimer = async (roomId, timerData, requesterId, adminId) => {
  // VALIDATION: Shared Pause/Resume for everyone, but Manual Set is Admin-only
  const isAdmin = requesterId === adminId;

  // If someone is trying to change the duration (secondsLeft), they MUST be an admin
  if (timerData.secondsLeft !== undefined) {
    const timerRef = ref(rtdb, `rooms/${roomId}/timer`);
    // We only need to check if the new value is a significant jump (manual set)
    // or if the current requester is the admin
    if (!isAdmin) {
       // Logic to prevent non-admins from jumping time
       // (Simplified for this task: only admin can update)
       console.warn("Unauthorized Timer Update attempt");
       return;
    }
  }

  const timerRef = ref(rtdb, `rooms/${roomId}/timer`);
  await update(timerRef, {
    ...timerData,
    lastUpdatedAt: serverTimestamp(),
  });
};

export const resetTimer = async (roomId, phase = 'focus', seconds = 1500) => {
  const timerRef = ref(rtdb, `rooms/${roomId}/timer`);
  await set(timerRef, {
    phase,
    secondsLeft: seconds,
    isRunning: false,
    lastUpdatedAt: serverTimestamp(),
  });
};
