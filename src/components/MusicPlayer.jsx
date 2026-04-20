import React, { useState } from 'react';
import { Play, Pause, SkipForward, Volume2, Music, ExternalLink } from 'lucide-react';

const STREAMS = [
  { id: 'jfKfPfyJRdk', name: 'Lofi Girl - Chilled Beats', color: 'text-pink-400' },
  { id: 'rPjez8z61rI', name: 'Chillhop Radio', color: 'text-orange-400' },
  { id: '5yx6BWV8v9A', name: 'Coffee Shop Vibes', color: 'text-brown-400' },
];

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStream, setCurrentStream] = useState(0);

  const nextStream = () => {
    setCurrentStream((prev) => (prev + 1) % STREAMS.length);
  };

  return (
    <div className="card bg-slate-950/40 border-white/5 p-6 relative overflow-hidden group">
      <div className="absolute inset-0    opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
           <div className={`p-2 bg-slate-900 rounded-lg border border-white/5 ${isPlaying ? 'animate-pulse' : ''}`}>
              <Music size={18} className="text-indigo-400" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Atmosphere</p>
              <h4 className="text-xs font-black text-white uppercase tracking-tight">{STREAMS[currentStream].name}</h4>
           </div>
        </div>
        <a 
          href={`https://www.youtube.com/watch?v=${STREAMS[currentStream].id}`} 
          target="_blank" 
          rel="noreferrer"
          className="p-2 text-slate-600 hover:text-white transition-colors"
        >
          <ExternalLink size={14} />
        </a>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:scale-105 transition-all  shadow-indigo-500/20"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>
        
        <button 
          onClick={nextStream}
          className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 transition-all border border-white/5"
        >
          <SkipForward size={18} />
        </button>

        <div className="flex-1 h-1 bg-slate-900 rounded-full overflow-hidden">
           <div className={`h-full bg-indigo-500 transition-all duration-1000 ${isPlaying ? 'w-full' : 'w-0'}`}></div>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
           <Volume2 size={14} />
        </div>
      </div>

      {/* Hidden Iframe for Audio (Using YouTube Embed with autoplay) */}
      {isPlaying && (
        <iframe 
          className="hidden"
          width="0" 
          height="0" 
          src={`https://www.youtube.com/embed/${STREAMS[currentStream].id}?autoplay=1&mute=0`} 
          title="Lofi Radio"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        ></iframe>
      )}
    </div>
  );
};

export default MusicPlayer;
