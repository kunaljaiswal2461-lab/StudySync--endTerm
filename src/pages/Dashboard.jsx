import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createRoom, joinRoomByCode, getRooms } from '../services/roomService';
import { getUserSessions } from '../services/authService';
import FocusHeatmap from '../components/FocusHeatmap';
import OnboardingModal from '../components/OnboardingModal';
import { Plus, Users, Clock, Hash, Layout, Search, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [newRoom, setNewRoom] = useState({ title: '', topic: '', goal: '', isPublic: true });
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ weeklyAvg: '0h 0m', growth: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.hasOnboarded !== true) {
      setShowOnboarding(true);
    }
  }, [currentUser]);

  const filteredRooms = React.useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    
    const terms = searchQuery.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    if (terms.length === 0) return rooms;

    const scoredRooms = rooms.map(room => {
      let score = 0;
      const title = (room.title || '').toLowerCase();
      const topic = (room.topic || '').toLowerCase();
      const goal = (room.goal || '').toLowerCase();

      terms.forEach(term => {
        // Exact substring matches give high points
        if (title.includes(term)) score += 10;
        if (topic.includes(term)) score += 8;
        if (goal.includes(term)) score += 3;

        // Semantic word-boundary matches give bonus points
        try {
          if (new RegExp(`\\b${term}`).test(title)) score += 5;
          if (new RegExp(`\\b${term}`).test(topic)) score += 4;
          if (new RegExp(`\\b${term}`).test(goal)) score += 1;
        } catch (e) {
          // Ignore invalid regex from user input
        }
      });

      return { room, score };
    });

    return scoredRooms
      .filter(sr => sr.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(sr => sr.room);
  }, [rooms, searchQuery]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRooms(currentUser.uid);
        setRooms(data);
        
        // Fetch sessions for stats
        const sessions = await getUserSessions(currentUser.uid);
        calculateStats(sessions);

        // Check for join code in URL
        const urlParams = new URLSearchParams(window.location.search);
        const joinCode = urlParams.get('join');
        if (joinCode) {
           handleJoinRoomByUrl(joinCode);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [currentUser.uid]);

  const handleJoinRoomByUrl = async (code) => {
    try {
      const roomId = await joinRoomByCode(code.toUpperCase(), currentUser.uid, currentUser.name);
      navigate(`/room/${roomId}`);
    } catch (err) {
      setError(err.message);
      // Remove the param from URL without refreshing
      window.history.replaceState({}, document.title, "/");
    }
  };

  const calculateStats = (sessions) => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const currentWeekSessions = sessions.filter(s => {
      const date = s.timestamp?.toDate();
      return date >= lastWeek;
    });

    const previousWeekSessions = sessions.filter(s => {
      const date = s.timestamp?.toDate();
      return date >= prevWeek && date < lastWeek;
    });

    const currentMins = currentWeekSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const previousMins = previousWeekSessions.reduce((acc, s) => acc + (s.duration || 0), 0);

    const avgDailyMins = Math.round(currentMins / 7);
    const avgHours = Math.floor(avgDailyMins / 60);
    const avgMins = avgDailyMins % 60;
    const weeklyAvgStr = `${avgHours}h ${avgMins}m`;

    let growth = 0;
    if (previousMins > 0) {
      growth = Math.round(((currentMins - previousMins) / previousMins) * 100);
    } else if (currentMins > 0) {
      growth = 100;
    }

    setStats({ weeklyAvg: weeklyAvgStr, growth });
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (isCreating) return;
    setError('');
    setIsCreating(true);
    try {
      const roomId = await createRoom({
        ...newRoom,
        creatorName: currentUser.name
      }, currentUser.uid);
      navigate(`/room/${roomId}`);
    } catch (err) {
      console.error('Room Creation Error:', err);
      setError(`Session Launch Failed: ${err.message}`);
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (roomCode.length !== 6) return setError('Code must be 6 characters');
    setError('');
    try {
      const roomId = await joinRoomByCode(roomCode.toUpperCase(), currentUser.uid, currentUser.name);
      navigate(`/room/${roomId}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 card p-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter flex items-center gap-4">
              Welcome back, <span className="text-active">{currentUser.name}</span> <Sparkles className="text-focus" size={40} />
            </h1>
            <p className="text-slate-400 text-lg font-black uppercase tracking-[0.4em] opacity-80">Collective Focus Terminal v1.0</p>
          </div>
        
        <div className="flex gap-4">
          <div className="bg-slate-800/50 border border-slate-600 rounded-xl px-6 py-3 flex items-center gap-3">
            <Clock className="text-active" />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Investment</p>
              <p className="text-xl font-bold text-white">{currentUser.totalFocusMinutes || 0}m</p>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-600 rounded-xl px-6 py-3 flex items-center gap-3">
            <Hash className="text-focus" />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Current Streak</p>
              <p className="text-xl font-bold text-white">{currentUser.streak || 0} Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Activity Heatmap */}
      <div className="card p-6">
        <FocusHeatmap userId={currentUser.uid} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Room List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex-shrink-0">Active Pulse</h2>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                 <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search sessions..." 
                      className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-active/50 transition-colors"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <button 
                   onClick={() => setShowModal(true)}
                   className="btn-primary w-full sm:w-auto flex-shrink-0"
                 >
                   <Plus size={16} /> New Session
                 </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="card animate-pulse h-40 bg-slate-800/50"></div>
                ))}
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="card text-center py-16 space-y-4 border-dashed border-slate-700">
                <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-700">
                  <Search size={32} />
                </div>
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">
                  {searchQuery ? 'No matching sessions found' : 'No active sessions available'}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={() => setShowModal(true)}
                    className="mt-4 mx-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-active/10 text-active rounded-xl hover:bg-active/20 transition-all text-[10px] font-black uppercase tracking-widest border border-active/20"
                  >
                    <Plus size={14} /> Create your first room
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRooms.map(room => (
                  <div 
                    key={room.id} 
                    onClick={() => navigate(`/room/${room.id}`)}
                    className="group relative bg-[#0a0a0a] border border-[#2a2a2a] p-5 mb-3 hover:border-[#555555] transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0    opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-active"></div>
                          <span className="px-3 py-1 bg-active/10 text-active text-[10px] font-black rounded-lg uppercase tracking-widest border border-active/20">
                            {room.topic}
                          </span>
                        </div>
                        <ArrowRight className="text-slate-700 group-hover:text-active" size={20} />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{room.title}</h3>
                      <p className="text-sm text-slate-400 line-clamp-2 mb-6 font-medium leading-relaxed">{room.goal}</p>
                      <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-4">
                        <div className="flex items-center gap-2">
                           <Users size={14} className="text-slate-500" />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Team Session</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-950 px-3 py-1 rounded-lg">
                           # {room.roomCode}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Your Mission History - Deep Fix Edition */}
          <div className="card p-6 space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Mission History</h2>
                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-white/5">Session Logs</span>
             </div>
             <div className="grid grid-cols-1 gap-4">
                {currentUser.joinedRooms?.length > 0 ? (
                   [...new Set(currentUser.joinedRooms || [])].filter(id => typeof id === 'string').slice(-5).reverse().map((roomId, idx) => {
                      const cleanId = String(roomId).trim();
                      return (
                        <a 
                          key={`${cleanId}-${idx}`} 
                          href={`/room/${cleanId}`}
                          className="flex items-center justify-between p-5 mb-3 bg-[#0a0a0a] border border-[#2a2a2a] hover:border-[#555555] transition-all group relative overflow-hidden cursor-pointer no-underline block"
                        >
                           <div className="absolute bottom-0 left-0 h-[2px] bg-active/20 w-full group-hover:bg-active transition-colors"></div>
                           
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5 text-slate-500 group-hover:text-active transition-colors ">
                                 <Clock size={24} />
                              </div>
                              <div>
                                 <p className="text-xs font-black text-white uppercase tracking-tight">Mission Log: <span className="text-active/80">{cleanId.substring(0, 8)}</span></p>
                                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Launch Re-entry Protocol</p>
                              </div>
                           </div>
                        </a>
                      );
                   })
                ) : (
                   <div className="card text-center py-12 border-dashed border-slate-800 opacity-50">
                      <p className="text-xs text-slate-600 uppercase font-black tracking-widest">No previous missions detected</p>
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Sidebar: Join and Stats */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Search size={20} className="text-active" /> Join via Code
            </h3>
            <form onSubmit={handleJoinRoom} className="space-y-3">
              <input 
                type="text" 
                placeholder="6-char Room Code" 
                className="input-field uppercase text-center font-mono text-lg"
                maxLength={6}
                value={roomCode}
                onChange={e => setRoomCode(e.target.value)}
              />
              <button type="submit" className="w-full btn-primary group">
                Join Session
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            </form>
          </div>

          <div className="card bg-slate-800/40">
            <h3 className="text-lg font-bold text-white mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/50 rounded-xl">
                 <p className="text-slate-400 text-xs mb-1">Weekly Average</p>
                 <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold text-white">{stats.weeklyAvg}</p>
                    <span className={`${stats.growth >= 0 ? 'text-active' : 'text-red-400'} text-xs font-medium`}>
                      {stats.growth >= 0 ? '+' : ''}{stats.growth}% vs last week
                    </span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="card max-w-md w-full animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-white mb-4">Launch Study Session</h2>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-400 block mb-1">Room Title</label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  placeholder="e.g. Finals Crunch Time" 
                  value={newRoom.title}
                  onChange={e => setNewRoom({...newRoom, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400 block mb-1">Topic</label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  placeholder="e.g. Physics" 
                  value={newRoom.topic}
                  onChange={e => setNewRoom({...newRoom, topic: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400 block mb-1">Specific Goal</label>
                <textarea 
                  className="input-field h-24" 
                  placeholder="What are we focusing on specifically?" 
                  value={newRoom.goal}
                  onChange={e => setNewRoom({...newRoom, goal: e.target.value})}
                ></textarea>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <div>
                  <label className="text-sm font-bold text-white block">Global Visibility</label>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Allow anyone in the Active Pulse feed to join</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setNewRoom({...newRoom, isPublic: !newRoom.isPublic})}
                  className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 shadow-inner border border-white/10 ${newRoom.isPublic ? 'bg-active' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1/2 -translate-y-1/2 transition-transform shadow-md ${newRoom.isPublic ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary" disabled={isCreating}>Cancel</button>
                <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2" disabled={isCreating}>
                  {isCreating ? <><Loader2 className="animate-spin" size={18} /> Launching...</> : 'Start Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal 
          userId={currentUser.uid} 
          onClose={() => setShowOnboarding(false)} 
          onComplete={() => { currentUser.hasOnboarded = true; }} 
        />
      )}
    </div>
  );
};

export default Dashboard;
