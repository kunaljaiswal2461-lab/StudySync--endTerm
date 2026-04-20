import React from 'react';
import { Users, ShieldCheck, Crown, ChevronRight } from 'lucide-react';
import FocusBadges from './FocusBadges';
import { transferAdmin } from '../services/roomService';

const PresencePanel = ({ members, roomId, currentAdminId, currentUserId }) => {
  const activeMembers = members.filter(m => m.status !== 'offline');
  const legacyMembers = members.filter(m => m.status === 'offline');

  const handleTransfer = async (newAdminId) => {
    if (window.confirm("Designate this user as the new Session Commander? You will lose control rights.")) {
      await transferAdmin(roomId, newAdminId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/20 rounded-3xl overflow-hidden border border-white/5">
      <div className="p-6 border-b border-white/5 bg-slate-900/40 flex items-center justify-between">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
          <Users size={16} className="text-active" /> Active Pulse
        </h3>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-active/10 rounded-lg border border-active/20">
           <div className="w-1.5 h-1.5 rounded-full bg-active animate-pulse"></div>
           <span className="text-[10px] font-black text-active uppercase tracking-tighter">{activeMembers.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Live Participants */}
        <div className="space-y-6">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-l-2 border-active pl-2">Synchronized</p>
          {activeMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5 text-lg font-black text-slate-300  transition-all duration-300">
                    {(member.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950  ${
                    member.status === 'focusing' ? 'bg-focus' : 'bg-active'
                  }`}></div>
                  {member.id === currentAdminId && (
                     <div className="absolute -top-2 -left-2 p-1 bg-[#ffffff] rounded-lg rotate-[-12deg] border border-[#222222]">
                        <Crown size={10} className="text-[#000000]" />
                     </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-[600] tracking-tight uppercase transition-colors ${member.id === currentAdminId ? 'text-[#ffffff]' : 'text-[#888888]'}`}>
                      {member.name || 'Unknown User'}
                    </p>
                    {member.status === 'focusing' && <ShieldCheck size={12} className="text-focus" />}
                  </div>
                  <FocusBadges totalMinutes={member.totalFocusMinutes || 0} />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {currentUserId === currentAdminId && member.id !== currentUserId && (
                   <button 
                    onClick={() => handleTransfer(member.id)}
                    className="p-2 bg-[#111111] hover:bg-[#ffffff] text-[#888888] hover:text-[#000000] rounded-xl transition-all border border-[#222222] opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[8px] font-black uppercase"
                   >
                     Commander <ChevronRight size={10} />
                   </button>
                )}

                {member.status === 'focusing' && (
                  <div className="flex gap-0.5 items-end h-3 opacity-50">
                      <div className="w-1 h-2 bg-focus"></div>
                      <div className="w-1 h-3 bg-focus"></div>
                      <div className="w-1 h-2 bg-focus"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legacy Members */}
        {legacyMembers.length > 0 && (
          <div className="pt-8 border-t border-white/5 space-y-4">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-l-2 border-slate-700 pl-2">Past Contributors</p>
             {legacyMembers.map((member) => (
               <div key={member.id} className="flex items-center justify-between opacity-40 hover:opacity-100 transition-all duration-300 group/legacy">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5 text-xs font-bold text-slate-600 group-hover/legacy:text-active">
                      {(member.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{member.name || 'Unknown User'}</p>
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{member.totalMinutesInRoom || 0}m invested</p>
                    </div>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>
      
      <div className="p-4 bg-slate-900/40 border-t border-white/5 text-center">
         <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">Collective focus established</p>
      </div>
    </div>
  );
};

export default PresencePanel;
