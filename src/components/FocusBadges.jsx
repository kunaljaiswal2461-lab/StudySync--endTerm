import React from 'react';
import { Award, Zap, Target, Crown, Flame } from 'lucide-react';

const BADGES = [
  { min: 0, label: 'Neophyte', icon: <Target size={14} />, color: 'text-slate-400', bg: 'bg-slate-400/10' },
  { min: 100, label: 'Deep Worker', icon: <Flame size={14} />, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { min: 500, label: 'Focus Master', icon: <Zap size={14} />, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { min: 1000, label: 'Zenith', icon: <Crown size={14} />, color: 'text-active', bg: 'bg-active/10' },
];

const FocusBadges = ({ totalMinutes = 0 }) => {
  const currentBadge = [...BADGES].reverse().find(b => totalMinutes >= b.min) || BADGES[0];

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-slate-950/50 shadow-inner group">
      <div className={`p-1 rounded-lg ${currentBadge.bg} ${currentBadge.color} group-hover:scale-110 transition-transform`}>
        {currentBadge.icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">Rank</span>
        <span className={`text-[10px] font-black uppercase tracking-tight ${currentBadge.color}`}>
          {currentBadge.label}
        </span>
      </div>
    </div>
  );
};

export default FocusBadges;
