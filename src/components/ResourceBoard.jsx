import React, { useState, useMemo } from 'react';
import { addResource, deleteResource, upvoteResource } from '../services/roomService';
import { Link as LinkIcon, FileText, Plus, Trash2, ExternalLink, Filter, Loader2, ArrowBigUp } from 'lucide-react';

const ResourceBoard = ({ roomId, resources = [], userId }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({ title: '', url: '', type: 'link' });

  // Meritocratic Sorting: Sort by votes descending, then by time
  const filteredResources = useMemo(() => {
    if (!resources) return [];
    
    let list = [...resources];
    
    // First, filter by type if selected
    if (filterType !== 'all') {
      list = list.filter(r => r.type === filterType);
    }
    
    // Then, sort by vote count (highest first)
    return list.sort((a, b) => {
      const votesA = a.votes ? a.votes.length : 0;
      const votesB = b.votes ? b.votes.length : 0;
      if (votesA !== votesB) return votesB - votesA;
      return (b.addedAt?.seconds || 0) - (a.addedAt?.seconds || 0);
    });
  }, [resources, filterType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return;
    
    setIsSubmitting(true);
    try {
      let finalUrl = formData.url;
      if (formData.type === 'link' && !finalUrl.startsWith('http')) {
        finalUrl = `https://${finalUrl}`;
      }

      await addResource(roomId, {
        title: formData.title,
        url: finalUrl,
        type: formData.type,
        addedBy: userId,
        votes: [] // Initialize empty votes array
      });
      
      setFormData({ title: '', url: '', type: 'link' });
      setShowAdd(false);
    } catch (err) {
      console.error('Failed to add resource:', err);
      alert('Failed to save to vault. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Erase this transmission from the vault?')) {
      await deleteResource(roomId, id);
    }
  };

  const handleUpvote = async (e, id) => {
    e.stopPropagation();
    await upvoteResource(roomId, id, userId);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/20 rounded-3xl overflow-hidden border border-white/5 relative group">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-active/5 rounded-full blur-3xl pointer-events-none group-hover:bg-active/10 transition-colors"></div>

      <div className="p-6 border-b border-white/5 bg-slate-900/40 relative z-10 flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
            <FileText size={16} className="text-active" /> Resource Vault
          </h3>
        </div>
        <div className="flex gap-2">
           <select 
             className="appearance-none bg-slate-950 border border-white/10 text-[9px] font-black text-slate-400 rounded-lg px-3 py-1.5 outline-none hover:border-active/50 transition-all cursor-pointer uppercase tracking-widest"
             value={filterType}
             onChange={(e) => setFilterType(e.target.value)}
           >
              <option value="all">ALL</option>
              <option value="link">LINKS</option>
              <option value="note">NOTES</option>
           </select>
           <button 
            onClick={() => setShowAdd(!showAdd)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-black text-[9px] uppercase tracking-widest  ${showAdd ? 'bg-slate-800 text-slate-300' : 'bg-[#ffffff] text-[#000000] hover:bg-[#e0e0e0]'}`}
           >
            {showAdd ? 'CLOSE' : <><Plus size={14} /> ADD</>}
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar relative z-10">
        {showAdd && (
          <form onSubmit={handleSubmit} className="p-6 bg-slate-900/60 rounded-2xl border border-active/30 space-y-4 animate-in fade-in zoom-in-95 duration-300  mb-6">
            <input 
              type="text" 
              placeholder="RESOURCE TITLE" 
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-active/50 transition-all font-bold uppercase tracking-wider" 
              required 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
            <textarea 
              placeholder={formData.type === 'link' ? "PASTE URL HERE..." : "TYPE NOTE CONTENT..."}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-active/50 transition-all h-24 font-medium resize-none" 
              required
              value={formData.url}
              onChange={e => setFormData({...formData, url: e.target.value})}
            ></textarea>
            
            <div className="flex p-1 bg-slate-950 rounded-xl border border-white/5">
              <button 
                type="button" 
                onClick={() => setFormData({...formData, type: 'link'})}
                className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest ${formData.type === 'link' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-400'}`}
              >
                LINK
              </button>
              <button 
                type="button" 
                onClick={() => setFormData({...formData, type: 'note'})}
                className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest ${formData.type === 'note' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-400'}`}
              >
                NOTE
              </button>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full btn-primary py-3 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> UPLOADING...</> : 'PUBLISH TO VAULT'}
            </button>
          </form>
        )}

        {filteredResources.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center space-y-4">
             <FileText size={24} className="text-slate-700" />
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Vault remains empty</p>
             <button 
               onClick={() => setShowAdd(true)}
               className="flex items-center gap-2 px-4 py-2 bg-active/10 text-active hover:bg-active/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors border border-active/20"
             >
               <Plus size={12} /> Add the first link or note
             </button>
          </div>
        ) : (
          filteredResources.map(res => {
            const hasVoted = res.votes && res.votes.includes(userId);
            const voteCount = res.votes ? res.votes.length : 0;
            
            return (
              <div key={res.id} className="group/item p-5 bg-slate-900/40 border border-white/5 rounded-2xl hover:border-active/30 transition-all duration-300 relative overflow-hidden">
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5 bg-[#ffffff] text-[#000000]`}>
                     {res.type === 'link' ? <LinkIcon size={10} /> : <FileText size={10} />}
                     {res.type}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleUpvote(e, res.id)}
                      disabled={hasVoted}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-all text-[10px] font-black ${
                        hasVoted 
                        ? 'bg-focus/20 border-focus/30 text-focus' 
                        : 'bg-slate-950 border-white/5 text-slate-500 hover:border-active hover:text-active'
                      }`}
                    >
                      <ArrowBigUp size={14} className={hasVoted ? 'fill-current' : ''} />
                      {voteCount}
                    </button>
                    
                    {res.addedBy === userId && (
                       <button 
                        onClick={() => handleDelete(res.id)}
                        className="p-1.5 text-slate-700 hover:text-red-400 hover:bg-red-400/10 rounded-md opacity-0 group-hover/item:opacity-100 transition-all"
                       >
                         <Trash2 size={14} />
                       </button>
                    )}
                  </div>
                </div>
                
                <div className="relative z-10">
                  <h4 className="text-sm font-black text-white mb-2 leading-tight uppercase tracking-tight group-hover/item:text-active transition-colors">{res.title}</h4>
                  {res.type === 'link' ? (
                    <a 
                      href={res.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-950/50 hover:bg-[#ffffff] hover:text-[#000000] rounded-lg text-[10px] text-active border border-white/5 transition-all mt-1 font-black uppercase tracking-widest"
                    >
                      LAUNCH <ExternalLink size={10} />
                    </a>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed font-medium">{res.url}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-slate-900/40 border-t border-white/5 text-center">
         <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.1em]">Verified Knowledge Base</p>
      </div>
    </div>
  );
};

export default ResourceBoard;
