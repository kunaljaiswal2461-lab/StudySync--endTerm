import { useState, useEffect, useRef, useCallback } from 'react';
import { subscribeToTimer, updateTimer } from '../services/timerService';
import { updateMemberStatus, setSessionSummaryFlag } from '../services/roomService';
import { updateUserStats } from '../services/authService';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useRoomContext } from '../context/RoomContext';
import { playSound } from '../utils/SoundManager';

export const useTimer = (roomId, userId, adminId) => {
  const [timerState, setTimerState] = useState({
    phase: 'focus',
    secondsLeft: 1500,
    isRunning: false
  });
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToTimer(roomId, (data) => {
      if (data) {
        setTimerState(prev => ({ ...prev, ...data }));
      }
    });

    return () => {
      unsubscribe();
      const currentInterval = intervalRef.current;
      if (currentInterval) clearInterval(currentInterval);
    };
  }, [roomId]);

  const prevPhase = useRef(timerState.phase);
  
  useEffect(() => {
    if (prevPhase.current !== timerState.phase) {
      if (timerState.phase === 'break') {
        playSound('break');
        if (prevPhase.current === 'focus') playSound('complete');
      } else if (timerState.phase === 'focus') {
        playSound('focus');
      }
      prevPhase.current = timerState.phase;
    }
  }, [timerState.phase]);

  const lastMinuteAwarded = useRef(null);

  const handlePhaseComplete = async (currentPhase) => {
    if (currentPhase === 'focus') {
      playSound('complete');
      try {
        await addDoc(collection(db, `rooms/${roomId}/sessions`), {
           type: 'focus',
           startTime: serverTimestamp(),
           duration: 25,
           completedBy: userId,
           status: 'completed'
        });
      } catch (err) {
        console.error("Failed to log session:", err);
      }
    }
    updateMemberStatus(roomId, userId, 'idle');
  };

  useEffect(() => {
    const checkAndAwardMinute = async () => {
      if (timerState.phase === 'focus' && timerState.isRunning && timerState.secondsLeft > 0) {
        const currentMinute = Math.floor(timerState.secondsLeft / 60);
        
        if (lastMinuteAwarded.current !== currentMinute && timerState.secondsLeft % 60 === 0 && timerState.secondsLeft !== 1500) {
          try {
            await updateUserStats(userId, 1);
            
            const today = new Date().toISOString().split('T')[0];
            const activityRef = doc(db, `users/${userId}/activity`, today);
            const activitySnap = await getDoc(activityRef);
            const currentDaily = activitySnap.exists() ? activitySnap.data().minutes || 0 : 0;
            await setDoc(activityRef, { minutes: currentDaily + 1, date: today }, { merge: true });

            const memberRef = doc(db, `rooms/${roomId}/members`, userId);
            const memberSnap = await getDoc(memberRef);
            const currentContrib = memberSnap.exists() ? memberSnap.data().totalMinutesInRoom || 0 : 0;
            await setDoc(memberRef, { totalMinutesInRoom: currentContrib + 1 }, { merge: true });
            
            lastMinuteAwarded.current = currentMinute;
          } catch (err) {
            console.error("Failed to award real-time minute:", err);
          }
        }
      }
    };
    checkAndAwardMinute();
  }, [timerState.secondsLeft, timerState.phase, timerState.isRunning, roomId, userId]);

  // Robust Admin Interval
  useEffect(() => {
    let interval;
    if (timerState.isRunning && userId === adminId) {
      interval = setInterval(() => {
        setTimerState(prev => {
          if (prev.secondsLeft > 0) {
            const nextSeconds = prev.secondsLeft - 1;
            // Sync to RTDB every second. RTDB is built for real-time frequency.
            updateTimer(roomId, { secondsLeft: nextSeconds }, userId, adminId).catch(console.error);
            return { ...prev, secondsLeft: nextSeconds };
          } else {
            // Reached zero, trigger phase change
            clearInterval(interval);
            const nextPhase = prev.phase === 'focus' ? 'break' : 'focus';
            const nextSeconds = nextPhase === 'focus' ? 1500 : 300;
            
            updateTimer(roomId, {
              phase: nextPhase,
              secondsLeft: nextSeconds,
              isRunning: false
            }, userId, adminId);
            
            if (prev.phase === 'focus') {
              playSound('complete');
              // Log session asynchronously
              addDoc(collection(db, `rooms/${roomId}/sessions`), {
                 type: 'focus',
                 startTime: serverTimestamp(),
                 duration: 25,
                 completedBy: userId,
                 status: 'completed'
              }).catch(console.error);

              setSessionSummaryFlag(roomId, true).catch(console.error);
            }
            updateMemberStatus(roomId, userId, 'idle');
            return { ...prev, secondsLeft: nextSeconds, phase: nextPhase, isRunning: false };
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerState.isRunning, roomId, userId, adminId]);

  const toggleTimer = async () => {
    // Everyone now has the right to pause/resume the shared squad timer
    const newIsRunning = !timerState.isRunning;
    await updateTimer(roomId, { 
      isRunning: newIsRunning,
      phase: timerState.phase,
      secondsLeft: timerState.secondsLeft
    }, userId, adminId);
    
    await updateMemberStatus(roomId, userId, newIsRunning && timerState.phase === 'focus' ? 'focusing' : 'idle');
  };

  const setManualTime = async (minutes) => {
    if (userId !== adminId) return;
    const seconds = parseInt(minutes, 10) * 60;
    if (isNaN(seconds) || seconds <= 0) return;
    
    try {
      console.log(`[Commander] Setting manual time to ${minutes}m (${seconds}s)`);
      // Update DB directly. The onValue listener will sync it back to timerState.
      await updateTimer(roomId, {
        secondsLeft: seconds,
        isRunning: false,
        phase: 'focus'
      }, userId, adminId);
    } catch (err) {
      console.error("Manual Set Failed:", err);
    }
  };

  const resetTimer = () => {
    if (userId !== adminId) return;
    updateTimer(roomId, {
      phase: 'focus',
      secondsLeft: 1500,
      isRunning: false
    }, userId, adminId);
  };

  return { timerState, toggleTimer, setManualTime, resetTimer, isAdmin: userId === adminId };
};
