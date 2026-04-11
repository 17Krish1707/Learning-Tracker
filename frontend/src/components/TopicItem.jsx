import React, { useState } from 'react';
import { Calendar, Clock, Trash2, CheckCircle2, Circle, AlertCircle, Pencil, FileText, Check, X, Timer, MoreVertical, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StudyLogger from './StudyLogger';
import { cn } from '../utils/cn';

function TopicItem({ topic, index, onStatusChange, onLogTime, onDeleteTopic, onEditTopic }) {
  const [showLogger, setShowLogger] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(topic.notes || '');

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
      case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'Low': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      default: return 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-900/30';
    }
  };

  const toggleStatus = () => {
    const nextStatus = {
      'Not Started': 'In Progress',
      'In Progress': 'Completed',
      'Completed': 'Not Started'
    };
    onStatusChange(topic.id, nextStatus[topic.status]);
  };

  return (
    <div className="group relative p-6 lg:p-10 border-b border-border last:border-0 hover:bg-background-secondary/40 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="flex items-start gap-6 lg:gap-10">
        <button 
          onClick={toggleStatus}
          className={cn(
            "shrink-0 mt-1 h-9 w-9 rounded-[1.1rem] border-2 flex items-center justify-center transition-all bg-background-primary shadow-soft relative overflow-hidden",
            topic.status === 'Completed' 
              ? "bg-success/10 border-success text-success scale-110" 
              : topic.status === 'In Progress'
                ? "border-accent-primary text-accent-primary bg-accent-primary/5 ring-4 ring-accent-primary/10"
                : "border-border text-text-muted/20 hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5 shadow-none"
          )}
        >
          <AnimatePresence mode="wait">
            {topic.status === 'Completed' ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                 <Check size={20} strokeWidth={4} />
              </motion.div>
            ) : topic.status === 'In Progress' ? (
              <motion.div 
                key="progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative flex items-center justify-center"
              >
                 <Circle size={22} className="animate-spin-slow opacity-10" />
                 <div className="absolute h-2.5 w-2.5 rounded-full bg-accent-primary shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
              </motion.div>
            ) : (
              <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Circle size={22} strokeWidth={2} className="opacity-40" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <input
                  autoFocus
                  defaultValue={topic.title}
                  onBlur={e => { onEditTopic(topic.id, { title: e.target.value }); setIsEditingTitle(false); }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { onEditTopic(topic.id, { title: e.target.value }); setIsEditingTitle(false); }
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  className="w-full bg-background-tertiary border-2 border-accent-primary/30 rounded-2xl px-5 py-2.5 text-xl font-black text-text-primary outline-none shadow-premium italic"
                />
              ) : (
                <h4 
                  className={cn(
                    "text-2xl font-black truncate transition-all cursor-pointer tracking-tight",
                    topic.status === 'Completed' ? "text-text-muted/40 line-through italic" : "text-text-primary group-hover:text-accent-primary"
                  )}
                  onDoubleClick={() => setIsEditingTitle(true)}
                >
                  {topic.title}
                </h4>
              )}
            </div>
            
            <div className="flex items-center gap-4 shrink-0">
               <span className={cn(
                  "px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.25em] border shadow-sm transition-all",
                  getPriorityStyles(topic.priority)
               )}>
                 {topic.priority}
               </span>
               <div className="h-6 w-[1px] bg-border/40 mx-1" />
               <button onClick={() => onDeleteTopic(topic.id)} className="p-2.5 text-text-muted hover:text-danger hover:bg-danger/5 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 size={20} />
               </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8 text-[12px] font-black uppercase tracking-[0.2em] text-text-muted opacity-70 mb-8">
            <div className="flex items-center gap-3">
              <Timer size={16} className="text-accent-primary opacity-40" />
              <span className="italic">{topic.timeSpent || 0}m logged</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-accent-secondary opacity-40" />
              <span className="italic">{topic.lastStudied || 'No protocol'}</span>
            </div>
            <button 
              onClick={() => setShowLogger(!showLogger)}
              className="flex items-center gap-3 text-accent-primary hover:text-accent-secondary transition-all ml-auto"
            >
              <Zap size={16} fill="currentColor" className="opacity-40" />
              <span>Record Sprint</span>
            </button>
          </div>

          <AnimatePresence>
            {showLogger && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="p-8 rounded-[2.5rem] bg-background-tertiary/40 border border-border/60 shadow-inner backdrop-blur-sm">
                   <StudyLogger topic={topic} onLogTime={onLogTime} onClose={() => setShowLogger(false)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notes Area */}
          <div className="relative group/notes">
             {isEditingNotes ? (
               <div className="space-y-4">
                 <textarea
                   autoFocus
                   rows={4}
                   value={notesText}
                   onChange={e => setNotesText(e.target.value)}
                   className="w-full bg-background-tertiary border-2 border-accent-primary/20 rounded-[2.5rem] p-8 text-base font-medium text-text-secondary outline-none shadow-premium focus:border-accent-primary transition-all resize-none italic leading-relaxed"
                   placeholder="Enter your conceptual synthesis..."
                 />
                 <div className="flex justify-end gap-3">
                    <button onClick={() => setIsEditingNotes(false)} className="px-6 py-2 rounded-xl text-xs font-black uppercase text-text-muted hover:text-text-primary transition-all">Abort</button>
                    <button onClick={() => { onEditTopic(topic.id, { notes: notesText }); setIsEditingNotes(false); }} className="px-8 py-2 rounded-xl text-xs font-black uppercase bg-accent-primary text-white shadow-premium hover:opacity-90 transition-all">Commit Note</button>
                 </div>
               </div>
             ) : (
               <div 
                 onClick={() => setIsEditingNotes(true)}
                 className="w-full min-h-[120px] p-10 rounded-[3.5rem] bg-background-tertiary/20 border border-border/40 hover:border-accent-primary/30 hover:bg-background-tertiary/40 transition-all cursor-text relative overflow-hidden group"
               >
                 <div className="absolute top-6 right-8 text-[9px] font-black uppercase tracking-[0.4em] text-accent-primary opacity-0 group-hover:opacity-40 transition-opacity">Metadata Analysis</div>
                 {!topic.notes ? (
                   <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20 py-2">
                      <FileText size={24} strokeWidth={1} />
                      <p className="text-[10px] uppercase font-black tracking-[0.3em] italic">Synthesis pending</p>
                   </div>
                 ) : (
                   <p className="text-base font-medium text-text-secondary whitespace-pre-wrap leading-relaxed italic opacity-80">{topic.notes}</p>
                 )}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopicItem;
