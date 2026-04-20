import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRoom } from '../hooks/useRoom';
import { usePresence } from '../hooks/usePresence';
import { useTimer } from '../hooks/useTimer';
import { useRoomContext } from '../context/RoomContext';
import { endRoom, subscribeToSessionSummary } from '../services/roomService';
import PomodoroTimer from '../components/PomodoroTimer';
import PresencePanel from '../components/PresencePanel';
import ResourceBoard from '../components/ResourceBoard';
import ChatPanel from '../components/ChatPanel';
import TaskPanel from '../components/TaskPanel';
import MusicPlayer from '../components/MusicPlayer';
import ChallengePanel from '../components/ChallengePanel';
import SessionSummaryModal from '../components/SessionSummaryModal';
import { Copy, ArrowLeft, Share2, Loader2, Info, Users, MessageSquare, Library, ListTodo } from 'lucide-react';

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { room, loading, error } = useRoom(roomId);
  const { members, resources } = useRoomContext();
  
  const { timerState, toggleTimer, setManualTime, resetTimer, isAdmin } = useTimer(roomId, currentUser?.uid, room?.adminId);
  
  usePresence(roomId, currentUser?.uid);

  const [sessionSummary, setSessionSummary] = React.useState(null);

  React.useEffect(() => {
    if (!roomId) return;
    const unsubscribe = subscribeToSessionSummary(roomId, (data) => {
      setSessionSummary(data);
    });
    return () => unsubscribe();
  }, [roomId]);

  const copyRoomCode = () => {
    if (room?.roomCode) {
      navigator.clipboard.writeText(room.roomCode);
      alert('Room code copied!');
    }
  };

  const handleInvite = async () => {
    const inviteUrl = `${window.location.origin}/?join=${room.roomCode}`;
    const inviteText = `Join my study session on StudySync!\nRoom: ${room.title}\nCode: ${room.roomCode}\nJoin here: ${inviteUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'StudySync Invite',
          text: inviteText,
          url: inviteUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(inviteText);
      alert('Invite link and message copied to clipboard!');
    }
  };

  const handleEndSession = async () => {
    if (window.confirm("Are you sure you want to END this session? This will deactivate the room and remove it from the global feed.")) {
      try {
        await endRoom(roomId);
        navigate('/');
      } catch (err) {
        console.error("Failed to end room:", err);
      }
    }
  };

  const [leftTab, setLeftTab] = React.useState('members');
  const [rightTab, setRightTab] = React.useState('vault');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-12 w-12 text-active mx-auto" />
          <p className="text-slate-400 uppercase tracking-widest text-xs font-black">Connecting to Session...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="card max-w-md w-full text-center space-y-6">
          <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
            <Info size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Oops! Room Not Found</h2>
          <p className="text-slate-400">The room might have been closed or the code is incorrect.</p>
          <button onClick={() => navigate('/')} className="btn-primary w-full flex items-center justify-center gap-2">
             <ArrowLeft size={18} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-12 px-6 lg:px-12 max-w-[1800px] mx-auto min-h-screen relative">
      {/* Background Decorative Elements Removed */}

      {/* Room Header */}
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[2.5rem]  overflow-hidden group">
        <div className="absolute inset-0    opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="relative space-y-3">
          <div className="flex items-center gap-5">
             <button onClick={() => navigate('/')} className="p-3 bg-slate-950/50 hover:bg-slate-800 rounded-2xl text-slate-400 transition-all border border-white/5 shadow-inner">
                <ArrowLeft size={24} />
             </button>
             <div>
               <h1 className="text-4xl font-black text-white uppercase tracking-tight leading-none mb-2">{room.title}</h1>
               <span className="px-3 py-1 bg-active/10 text-active text-xs font-black border border-active/20 rounded-full uppercase tracking-[0.2em]">
                 {room.topic}
               </span>
             </div>
          </div>
          <p className="text-slate-400 text-lg font-medium pl-16 max-w-2xl">{room.goal}</p>
        </div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-4 w-full md:w-auto mt-6 md:mt-0">
          <div className="flex-1 w-full md:w-auto flex items-center justify-between gap-8 px-8 py-4 bg-slate-950/50 backdrop-blur-md border border-white/5 rounded-[1.5rem] shadow-inner group/code">
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Session Protocol</p>
                <p className="text-2xl font-mono font-bold text-white tracking-[0.4em]">{room.roomCode}</p>
             </div>
             <button 
              onClick={copyRoomCode}
              className="p-3 hover:bg-active/20 rounded-xl text-active transition-all border border-transparent hover:border-active/30"
              title="Copy Code"
             >
                <Copy size={24} />
             </button>
          </div>
          
          <div className="flex w-full md:w-auto gap-3">
             <button 
               onClick={handleInvite}
               className="hidden lg:flex items-center justify-center p-4 bg-slate-800/50 hover:bg-slate-700 text-white rounded-[1.5rem] transition-all border border-white/5 "
               title="Invite"
             >
                <Share2 size={20} />
             </button>
             <button 
               onClick={() => navigate('/')}
               className="flex-1 md:flex-none flex items-center justify-center px-6 py-4 bg-slate-800/50 hover:bg-slate-700 text-white rounded-[1.5rem] transition-all font-black text-[10px] uppercase tracking-widest border border-white/5 "
             >
                Exit
             </button>
             {isAdmin && (
               <button 
                 onClick={handleEndSession}
                 className="flex-1 md:flex-none flex items-center justify-center px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-[1.5rem] transition-all font-black text-[10px] uppercase tracking-widest border border-red-500/20 "
               >
                  End
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Main Room Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Members + Chat (Col 1-3) */}
        <div className="lg:col-span-3 h-[calc(100vh-250px)] sticky top-24 flex flex-col gap-4">
          <div className="flex p-1 bg-slate-950/50 rounded-2xl border border-white/5">
             <button 
              onClick={() => setLeftTab('members')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${leftTab === 'members' ? 'bg-slate-800 text-active ' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <Users size={14} /> Pulse
             </button>
             <button 
              onClick={() => setLeftTab('chat')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${leftTab === 'chat' ? 'bg-slate-800 text-active ' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <MessageSquare size={14} /> Comms
             </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {leftTab === 'members' ? <PresencePanel members={members} roomId={roomId} currentAdminId={room?.adminId} currentUserId={currentUser.uid} /> : <ChatPanel roomId={roomId} userId={currentUser.uid} userName={currentUser.name} />}
          </div>
        </div>

        {/* Center: Timer (Col 4-8) */}
        <div className="lg:col-span-5 space-y-8">
          <ChallengePanel 
            roomId={roomId} 
            members={members} 
            userId={currentUser.uid} 
          />

          <PomodoroTimer 
            timerState={timerState} 
            toggleTimer={toggleTimer} 
            isAdmin={isAdmin}
            setManualTime={setManualTime}
            resetTimer={resetTimer}
          />
          
          <MusicPlayer />
          
          <div className="card bg-slate-900/40 border-white/5">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Focus Protocol</h4>
             <ul className="space-y-4">
                <li className="flex gap-4 text-sm text-slate-300">
                   <div className="w-6 h-6 rounded-lg bg-active/20 text-active flex items-center justify-center flex-shrink-0 font-black text-[10px] border border-active/30">01</div>
                   Stay present. Avoid switching tabs during focus blocks.
                </li>
                <li className="flex gap-4 text-sm text-slate-300">
                   <div className="w-6 h-6 rounded-lg bg-active/20 text-active flex items-center justify-center flex-shrink-0 font-black text-[10px] border border-active/30">02</div>
                   Micro-breaks are for hydration. Deep work is the goal.
                </li>
             </ul>
          </div>
        </div>

        {/* Right Sidebar: Library + Tasks (Col 9-12) */}
        <div className="lg:col-span-4 h-[calc(100vh-250px)] sticky top-24 flex flex-col gap-4">
          <div className="flex p-1 bg-slate-950/50 rounded-2xl border border-white/5">
             <button 
              onClick={() => setRightTab('vault')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${rightTab === 'vault' ? 'bg-slate-800 text-active ' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <Library size={14} /> Vault
             </button>
             <button 
              onClick={() => setRightTab('tasks')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${rightTab === 'tasks' ? 'bg-slate-800 text-active ' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <ListTodo size={14} /> Mission
             </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {rightTab === 'vault' ? <ResourceBoard roomId={roomId} resources={resources} userId={currentUser.uid} /> : <TaskPanel roomId={roomId} userId={currentUser.uid} />}
          </div>
        </div>
      </div>

      {/* Session Summary Modal Overlay */}
      {sessionSummary?.showSummary && (
        <SessionSummaryModal 
          roomId={roomId}
          members={members}
          resources={resources}
        />
      )}
    </div>
  );
};

export default Room;
