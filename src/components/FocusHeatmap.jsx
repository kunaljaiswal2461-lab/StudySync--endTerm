import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Activity, Info } from 'lucide-react';

const FocusHeatmap = ({ userId }) => {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!userId) return;
      try {
        const q = query(
          collection(db, `users/${userId}/activity`),
          orderBy('date', 'desc'),
          limit(7)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data());
        setActivityData(data);
      } catch (err) {
        console.error("Heatmap fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [userId]);

  const weekDays = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const activity = activityData.find(a => a.date === dateStr);
      const minutes = activity ? activity.minutes : 0;
      
      let level = 0;
      if (minutes > 60) level = 3;
      else if (minutes > 30) level = 2;
      else if (minutes > 0) level = 1;

      days.push({ dayName, dateStr, minutes, level });
    }
    return days;
  }, [activityData]);

  const getLevelColor = (level) => {
    switch (level) {
      case 3: return 'bg-focus  border-focus/50';
      case 2: return 'bg-focus/60 border-focus/30';
      case 1: return 'bg-focus/30 border-focus/20';
      default: return 'bg-slate-900 border-white/5';
    }
  };

  return (
    <div className="card bg-slate-900/40 border-white/5 p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-focus/5  pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-focus/10 rounded-xl border border-focus/20 text-focus">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Focus Intensity</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last 7 Days Activity</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-900 rounded-sm"></div>
              <span className="text-[8px] font-bold text-slate-600 uppercase">Off</span>
           </div>
           <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-focus rounded-sm"></div>
              <span className="text-[8px] font-bold text-slate-600 uppercase">Peak</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4 relative z-10">
        {weekDays.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center gap-3 group/cell">
            <div className="relative">
              <div 
                className={`w-full aspect-square min-w-[40px] rounded-xl border transition-all duration-500 cursor-help ${getLevelColor(day.level)} group-hover/cell:scale-110 group-hover/cell:brightness-125`}
              ></div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-950 border border-white/10 rounded-lg opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap ">
                 <p className="text-[10px] font-black text-white uppercase tracking-wider">{day.minutes}m Focused</p>
                 <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center mt-0.5">{day.dateStr}</p>
              </div>
            </div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{day.dayName}</span>
          </div>
        ))}
      </div>

      {!loading && activityData.length === 0 && (
         <div className="mt-6 flex items-center justify-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
            <Info size={12} className="text-slate-500" />
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">First transmission pending. Focus to start log.</p>
         </div>
      )}
    </div>
  );
};

export default FocusHeatmap;
