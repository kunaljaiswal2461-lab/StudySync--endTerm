import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, ListTodo } from 'lucide-react';
import { addTask, updateTask, deleteTask } from '../services/roomService';
import { useRoomContext } from '../context/RoomContext';

const TaskPanel = ({ roomId, userId }) => {
  const [taskText, setTaskText] = useState('');
  const { tasks } = useRoomContext();

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    await addTask(roomId, {
      text: taskText.trim(),
      createdBy: userId,
    });
    setTaskText('');
  };

  const toggleComplete = async (taskId, currentStatus) => {
    await updateTask(roomId, taskId, { completed: !currentStatus });
  };

  const handleDelete = async (taskId) => {
    await deleteTask(roomId, taskId);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/20 rounded-3xl overflow-hidden border border-white/5">
      <div className="p-6 border-b border-white/5 bg-slate-900/40">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
          <ListTodo size={16} className="text-active" /> Mission Objectives
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
             <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-700 border border-white/5">
                <ListTodo size={24} />
             </div>
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">No objectives defined</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id} 
              className={`group flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                task.completed 
                  ? 'bg-slate-900/20 border-white/5 opacity-50' 
                  : 'bg-slate-900/40 border-white/5 hover:border-active/30'
              }`}
            >
              <button 
                onClick={() => toggleComplete(task.id, task.completed)}
                className={`transition-colors ${task.completed ? 'text-active' : 'text-slate-600 hover:text-active'}`}
              >
                {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>
              
              <span className={`flex-1 text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {task.text}
              </span>

              <button 
                onClick={() => handleDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddTask} className="p-4 bg-slate-900/40 border-t border-white/5">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Define new objective..." 
            className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-active/50 transition-all"
            value={taskText}
            onChange={e => setTaskText(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-active/20 text-active rounded-lg hover:bg-active/30 transition-all"
          >
            <Plus size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskPanel;
