import React, { useState, useEffect, useMemo } from 'react';
import { addChallenge, subscribeToChallenges, completeChallenge } from '../services/roomService';
import { Trophy, Target, Plus, Loader2, PartyPopper, Zap } from 'lucide-react';

const ChallengePanel = ({ roomId, members, userId }) => {
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', targetMinutes: 60 });

  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = subscribeToChallenges(roomId, (challenge) => {
      setActiveChallenge(challenge);
    });
    return () => unsubscribe();
  }, [roomId]);

  const totalSquadMinutes = useMemo(() => {
    return members.reduce((acc, m) => acc + (m.totalMinutesInRoom || 0), 0);
  }, [members]);

  const progress = useMemo(() => {
    if (!activeChallenge) return 0;
    const p = (totalSquadMinutes / activeChallenge.targetMinutes) * 100;
    return Math.min(Math.round(p), 100);
  }, [totalSquadMinutes, activeChallenge]);

  useEffect(() => {
    if (activeChallenge && !activeChallenge.isCompleted && totalSquadMinutes >= activeChallenge.targetMinutes) {
      completeChallenge(roomId, activeChallenge.id);
    }
  }, [totalSquadMinutes, activeChallenge, roomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || formData.targetMinutes <= 0) return;
    
    setIsSubmitting(true);
    try {
      await addChallenge(roomId, {
        title: formData.title,
        targetMinutes: parseInt(formData.targetMinutes),
        createdBy: userId
      });
      setShowAdd(false);
      setFormData({ title: '', targetMinutes: 60 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 relative overflow-hidden group">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-active/10  pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-active/10 rounded-xl border border-active/20 text-active">
            <Trophy size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Squad Mission</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collective Objective</p>
          </div>
        </div>
        {!activeChallenge && !showAdd && (
          <button 
            onClick={() => setShowAdd(true)}
            className="p-2 bg-slate-800 hover:bg-active text-slate-400 hover:text-white rounded-xl transition-all border border-white/5"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      <div className="relative z-10">
        {showAdd ? (
          <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in- duration-300">
            <input 
              type="text" 
              placeholder="MISSION TITLE (e.g. Finals Grind)" 
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-active/50 transition-all font-bold uppercase tracking-wider"
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
            <div className="flex items-center gap-3">
              <div className="flex-1">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Target Minutes</label>
                 <input 
                  type="number" 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-active/50 transition-all font-bold"
                  value={formData.targetMinutes}
                  onChange={e => setFormData({...formData, targetMinutes: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-5">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Launch'}
                </button>
              </div>
            </div>
          </form>
        ) : activeChallenge ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
               <div>
                 <h4 className={`text-lg font-black uppercase tracking-tight ${activeChallenge.isCompleted ? 'text-focus text-glow' : 'text-white'}`}>
                   {activeChallenge.title}
                 </h4>
                 <div className="flex items-center gap-2 mt-1">
                    <Zap size={12} className={activeChallenge.isCompleted ? 'text-focus' : 'text-active'} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {totalSquadMinutes} / {activeChallenge.targetMinutes} MINS EARNED
                    </span>
                 </div>
               </div>
               {activeChallenge.isCompleted && (
                 <div className="p-2 bg-focus/10 rounded-full text-focus border border-focus/20 animate-bounce">
                    <PartyPopper size={20} />
                 </div>
               )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
               <div className="h-3 w-full bg-slate-950 rounded-full border border-white/5 overflow-hidden p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative ${activeChallenge.isCompleted ? '  ' : 'bg-active '}`}
                    style={{ width: `${progress}%` }}
                  >
                    {!activeChallenge.isCompleted && (
                      <div className="absolute inset-0     animate-[shimmer_2s_infinite]"></div>
                    )}
                  </div>
               </div>
               <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Squad Efficiency</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${activeChallenge.isCompleted ? 'text-focus' : 'text-active'}`}>
                    {progress}% Complete
                  </span>
               </div>
            </div>

            {activeChallenge.isCompleted && (
               <div className="p-4 bg-focus/5 border border-focus/20 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-focus uppercase tracking-[0.2em] animate-pulse">Squad Goal Reached. Focus Rank Boosted.</p>
               </div>
            )}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-slate-800 rounded-3xl">
             <div className="p-3 bg-slate-800/50 rounded-full text-slate-600">
                <Target size={32} />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Active Mission</p>
               <button 
                onClick={() => setShowAdd(true)}
                className="mt-2 text-active hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
               >
                 + Launch New Mission
               </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengePanel;
