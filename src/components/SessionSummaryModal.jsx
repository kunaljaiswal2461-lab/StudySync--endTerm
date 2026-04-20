import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, CheckCircle, FileText, Clock, Sparkles } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { setSessionSummaryFlag } from '../services/roomService';

const SessionSummaryModal = ({ roomId, members, resources }) => {
  const [completedTasks, setCompletedTasks] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    // Fetch completed tasks to show in the summary
    const fetchTasks = async () => {
      try {
        const q = query(collection(db, `rooms/${roomId}/tasks`), where('completed', '==', true));
        const snap = await getDocs(q);
        setCompletedTasks(snap.size);
      } catch (e) {
        console.error(e);
      }
    };
    fetchTasks();
  }, [roomId]);

  const handleDismiss = async () => {
    setIsDismissing(true);
    try {
      await setSessionSummaryFlag(roomId, false);
    } catch (e) {
      console.error(e);
      setIsDismissing(false);
    }
  };

  // Metrics calculation
  const totalCollectiveMinutes = members.reduce((acc, m) => acc + (m.totalMinutesInRoom || 0), 0);
  const topContributor = [...members].sort((a, b) => (b.totalMinutesInRoom || 0) - (a.totalMinutesInRoom || 0))[0];
  const resourceCount = resources?.length || 0;

  let message = "Getting warmed up!";
  if (totalCollectiveMinutes >= 25) message = "Full session crushed!";
  else if (totalCollectiveMinutes >= 10) message = "Solid focus!";

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Celebration Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-active/20 rounded-full  mix-blend-screen"></div>
      </div>

      <div className="card max-w-md w-full bg-slate-900 border border-active/30  overflow-hidden relative z-10 animate-in zoom-in-95 duration-500">
        
        <div className="p-8 text-center space-y-6">
          <div className="w-24 h-24 bg-active/20 rounded-full flex items-center justify-center mx-auto border-2 border-active/40 text-active  relative">
            <Trophy size={48} />
            <div className="absolute -top-2 -right-2 bg-slate-900 rounded-full p-1 border border-active">
              <Sparkles size={16} className="text-amber-400" />
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Focus Complete</h2>
            <p className="text-active font-bold text-sm tracking-widest uppercase">{message}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
              <Clock size={20} className="text-active mb-2" />
              <p className="text-3xl font-black text-white mb-1">{totalCollectiveMinutes}<span className="text-sm text-slate-500 ml-1">m</span></p>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Collective Focus</p>
            </div>
            
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
              <CheckCircle size={20} className="text-focus mb-2" />
              <p className="text-3xl font-black text-white mb-1">{completedTasks}</p>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tasks Done</p>
            </div>
            
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center col-span-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Trophy size={40} />
              </div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Top Contributor</p>
              <p className="text-lg font-black text-amber-400 uppercase tracking-tight">
                {topContributor ? topContributor.name : 'Unknown'}
              </p>
              <p className="text-xs text-slate-400 font-bold mt-1">{topContributor?.totalMinutesInRoom || 0}m contributed</p>
            </div>
            
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center col-span-2">
              <FileText size={20} className="text-blue-400 mb-2" />
              <p className="text-xl font-black text-white mb-1">{resourceCount} <span className="text-xs text-slate-500">Resources Shared</span></p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-950/80 border-t border-white/5">
          <button 
            onClick={handleDismiss}
            disabled={isDismissing}
            className="btn-primary w-full py-4 uppercase text-xs tracking-[0.2em]"
          >
            {isDismissing ? 'Syncing...' : 'Continue to Break'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SessionSummaryModal;
