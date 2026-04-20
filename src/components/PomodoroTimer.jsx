import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Coffee, Focus, Lock } from 'lucide-react';
import { formatTime } from '../utils/helpers';

const PomodoroTimer = ({ timerState, toggleTimer, isAdmin, setManualTime, resetTimer }) => {
  const [manualMinutes, setManualMinutes] = useState(25);

  const percentage = ((timerState.phase === 'focus' ? 1500 - timerState.secondsLeft : 300 - timerState.secondsLeft) / (timerState.phase === 'focus' ? 1500 : 300)) * 100;

  return (
    <div className="group relative card flex flex-col items-center justify-center p-16 space-y-12 overflow-hidden">
      

      <div className="flex items-center gap-3 px-6 py-2 bg-slate-950/50 backdrop-blur-md rounded-full border border-white/5 mb-4 z-10 shadow-inner">
        {timerState.phase === 'focus' ? (
          <><Focus className="text-focus animate-pulse" size={20} /> <span className="text-sm font-black text-white uppercase tracking-[0.3em]">Focus Protocol</span></>
        ) : (
          <><Coffee className="text-active animate-bounce" size={20} /> <span className="text-sm font-black text-white uppercase tracking-[0.3em]">Rest Cycle</span></>
        )}
      </div>
      
      <div className="relative w-80 h-80 flex items-center justify-center z-10">
        

        <svg className="w-full h-full transform -rotate-90 relative z-10">
          <circle
            cx="160"
            cy="160"
            r="150"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-slate-900/50"
          />
          <circle
            cx="160"
            cy="160"
            r="150"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 150}
            strokeDashoffset={2 * Math.PI * 150 * (1 - percentage / 100)}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${timerState.phase === 'focus' ? 'text-focus' : 'text-active'}`}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center z-20">
          <div className="text-6xl font-[600] text-[#ffffff] tracking-tighter tabular-nums">
            {formatTime(timerState.secondsLeft)}
          </div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-2">Time Remaining</div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-8 z-10 w-full max-w-xs">
        <div className="flex gap-10 items-center justify-center w-full">
          <button 
            onClick={toggleTimer}
            className={`group/btn w-24 h-24 flex items-center justify-center transition-all duration-300 transform relative overflow-hidden ${
              timerState.isRunning 
              ? 'bg-transparent text-[#ffffff] border border-[#ffffff]' 
              : 'bg-[#ffffff] text-[#000000]'
            }`}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            {timerState.isRunning ? <Pause size={40} className="relative z-10" /> : <Play size={40} className="ml-2 relative z-10" />}
          </button>
          
          <button 
            onClick={resetTimer}
            disabled={!isAdmin}
            className={`w-24 h-24 flex items-center justify-center transition-all duration-200 border border-[#222222] ${
              !isAdmin ? 'bg-[#0a0a0a] text-[#333333] cursor-not-allowed' : 'bg-[#111111] text-[#888888] hover:bg-[#ffffff] hover:text-[#000000]'
            }`}
            title="Reset Protocol"
          >
            <RotateCcw size={32} />
          </button>
        </div>

        {isAdmin ? (
          <div className="w-full space-y-4 animate-in fade-in slide-in- duration-500">
             <div className="flex p-1 bg-slate-950 rounded-2xl border border-white/5">
                <input 
                  type="number" 
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                  className="w-20 bg-transparent text-center font-black text-white text-sm outline-none border-r border-white/10"
                  min="1"
                  max="120"
                />
                <button 
                  onClick={() => setManualTime(manualMinutes)}
                  className="flex-1 py-3 text-[10px] font-black text-active uppercase tracking-[0.2em] hover:text-white transition-colors"
                >
                  Set Manual
                </button>
             </div>
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center">Session Commander Control</p>
          </div>
        ) : (
          <div className="text-center space-y-2 opacity-60">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse flex items-center justify-center gap-2">
                <Lock size={12} /> Remote Control Locked
             </p>
             <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Waiting for Session Commander</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;
