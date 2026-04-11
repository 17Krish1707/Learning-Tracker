import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Circle, Plus, Trash2, Zap, ArrowRight, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

function DailyGoals({ profile }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('daily_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Review previous sessions', completed: true },
      { id: 2, text: 'Complete 2 focus blocks', completed: false },
    ];
  });
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    localStorage.setItem('daily_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), text: newTask, completed: false }]);
    setNewTask('');
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-text-primary tracking-tight">Today's Protocol</h3>
          <p className="text-xs text-text-muted font-bold uppercase tracking-widest italic">Daily Sub-Goals</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/5 border border-accent-primary/10">
           <Zap size={12} className="text-accent-primary" />
           <span className="text-[10px] font-black text-accent-primary uppercase tracking-widest">{progressPercent}% Sync</span>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task, i) => (
          <motion.div 
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "group flex items-center justify-between p-4 rounded-2xl border transition-all",
              task.completed 
                ? "bg-background-secondary/30 border-transparent opacity-60" 
                : "bg-background-primary border-border hover:border-accent-primary/50 shadow-soft"
            )}
          >
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "h-6 w-6 rounded-lg flex items-center justify-center transition-all",
                  task.completed ? "bg-accent-primary text-white" : "border-2 border-border text-text-muted hover:border-accent-primary hover:text-accent-primary"
                )}
              >
                {task.completed && <CheckCircle2 size={14} strokeWidth={3} />}
              </button>
              <span className={cn("text-sm font-bold tracking-tight transition-all", task.completed ? "line-through text-text-muted" : "text-text-primary")}>
                {task.text}
              </span>
            </div>
            <button 
              onClick={() => deleteTask(task.id)}
              className="p-1 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      <form onSubmit={addTask} className="relative group">
        <input 
          type="text" 
          placeholder="Append new sub-goal..." 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="w-full h-12 rounded-2xl bg-background-tertiary/50 border border-border px-4 pr-12 text-sm font-bold text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:bg-background-primary transition-all outline-none"
        />
        <button 
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-accent-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} strokeWidth={3} />
        </button>
      </form>

      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 border border-accent-primary/10">
         <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60 italic">Metrical Status</span>
            <Target size={16} className="text-accent-primary" />
         </div>
         <div className="space-y-4">
            <div className="flex justify-between items-end">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Depth Goal</p>
                  <h4 className="text-2xl font-black text-text-primary tracking-tighter">{profile?.studyGoal || 120}<span className="text-xs text-text-muted ml-1 lowercase">min</span></h4>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Consistency</p>
                  <p className="text-sm font-black text-accent-primary tracking-widest uppercase">Elite</p>
               </div>
            </div>
            <div className="h-1.5 w-full bg-background-primary/50 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progressPercent}%` }}
                 className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
               />
            </div>
         </div>
      </div>
    </div>
  );
}

export default DailyGoals;
