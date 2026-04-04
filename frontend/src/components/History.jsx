import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History as HistoryIcon, Clock, ChevronRight, CheckCircle2, 
  Calendar, Layers, Filter, Search, RotateCcw, Zap
} from 'lucide-react';
import { cn } from '../utils/cn';

const sessions = [
  { id: '1', date: 'Today', subject: 'DSA', topic: 'Arrays & Strings', time: '1h 20m', status: 'Completed', color: 'indigo' },
  { id: '2', date: 'Today', subject: 'Java', topic: 'OOP Concepts', time: '45m', status: 'In Progress', color: 'fuchsia' },
  { id: '3', date: 'Yesterday', subject: 'DBMS', topic: 'SQL Queries', time: '3h 10m', status: 'Completed', color: 'emerald' },
  { id: '4', date: 'Yesterday', subject: 'OS', topic: 'Process Scheduling', time: '55m', status: 'In Progress', color: 'amber' },
  { id: '5', date: 'Apr 2, 2026', subject: 'DSA', topic: 'Linked Lists', time: '2h 05m', status: 'Completed', color: 'indigo' },
  { id: '6', date: 'Apr 1, 2026', subject: 'DBMS', topic: 'Indexing', time: '1h 40m', status: 'Completed', color: 'emerald' },
];

function History() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [historySessions, setHistorySessions] = React.useState(sessions);

  const filteredSessions = historySessions.filter(s => 
    s.topic.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteAll = () => {
    if (window.confirm('Delete all session history? This cannot be undone.')) {
      setHistorySessions([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-3">
             <div className="h-2 w-2 rounded-full bg-accent-primary shadow-[0_0_8px_var(--accent-primary)]" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-primary">Secure Logs Active</span>
          </div>
          <h1 className="text-5xl font-black text-text-primary tracking-tighter mb-2 flex items-center gap-4">
            Session History.
            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/10 shadow-glow">
               <HistoryIcon size={20} strokeWidth={2.5} />
            </div>
          </h1>
          <p className="text-lg text-text-muted font-medium">Trace back every unit of effort ever invested.</p>
        </motion.div>

        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Find session..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="h-14 w-64 bg-background-primary border border-border rounded-2xl pl-12 pr-4 text-sm font-bold focus:border-accent-primary transition-all shadow-soft outline-none"
              />
           </div>
           <button 
             onClick={handleDeleteAll}
             className="h-14 px-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 font-bold text-sm"
           >
              <HistoryIcon size={18} />
              Clear Life Logs
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Timeline Summary Area */}
        <div className="lg:col-span-8 space-y-8">
           <AnimatePresence>
              {filteredSessions.map((session, i) => (
                <motion.div 
                  key={session.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative"
                >
                  <div className="flex gap-6">
                    {/* Date Column */}
                    <div className="w-24 shrink-0 pt-4 hidden sm:block">
                      <p className="text-xs font-black uppercase tracking-widest text-text-muted text-right">
                        {session.date}
                      </p>
                    </div>
                    {/* Vertical Connector */}
                    <div className="relative flex flex-col items-center">
                       <div className={cn(
                         "h-12 w-12 rounded-2xl flex items-center justify-center z-10 border-4 border-background-primary shadow-soft transition-transform group-hover:scale-110",
                         session.color === 'indigo' ? "bg-indigo-500 text-white" : 
                         session.color === 'fuchsia' ? "bg-fuchsia-500 text-white" : 
                         session.color === 'emerald' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                       )}>
                          <RotateCcw size={20} strokeWidth={2.5} />
                       </div>
                       <div className="h-full w-[2px] bg-border/60 absolute top-12" />
                    </div>
                    {/* Log Card */}
                    <div className="flex-1 pb-8">
                       <div className="p-6 rounded-[2.5rem] bg-background-primary border border-border shadow-soft hover:shadow-premium transition-all">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                             <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                   <Layers size={12} /> {session.subject}
                                </div>
                                <h4 className="text-xl font-black text-text-primary tracking-tight">{session.topic}</h4>
                             </div>
                             <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background-tertiary border border-border">
                                   <Clock size={16} className="text-text-muted" />
                                   <span className="text-sm font-black text-text-primary">{session.time}</span>
                                </div>
                                {session.status === 'Completed' ? (
                                  <div className="p-2 rounded-xl bg-success/10 text-success border border-success/20">
                                     <CheckCircle2 size={18} />
                                  </div>
                                ) : (
                                  <div className="p-2 rounded-xl bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20">
                                     <HistoryIcon size={18} />
                                  </div>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>

        {/* Side Summary */}
        <div className="lg:col-span-4 space-y-8">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="p-10 rounded-4xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-premium relative overflow-hidden"
           >
              <div className="absolute right-0 top-0 p-4 opacity-10">
                 <Zap size={100} strokeWidth={1} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60">Log Efficiency</p>
              <h3 className="text-3xl font-black mb-8 leading-tight">Elite Flow<br/>Detected.</h3>
              
              <div className="space-y-6">
                 {[
                   { label: 'Longest Session', value: '3.4h' },
                   { label: 'Daily Peak', value: '6.2h' },
                   { label: 'Avg / Topic', value: '1.8h' },
                 ].map((stat, idx) => (
                   <div key={idx} className="flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="text-sm font-bold opacity-70">{stat.label}</span>
                      <span className="text-lg font-black tracking-tight">{stat.value}</span>
                   </div>
                 ))}
              </div>
           </motion.div>

           <div className="p-8 rounded-4xl bg-background-primary border border-border shadow-soft space-y-6">
              <h4 className="text-lg font-black text-text-primary uppercase tracking-tight pl-1">Consistency Track</h4>
              <div className="grid grid-cols-7 gap-2">
                 {Array.from({ length: 28 }).map((_, i) => (
                   <div 
                     key={i} 
                     className={cn(
                       "h-3 w-full rounded-sm",
                       i % 3 === 0 ? "bg-accent-primary" : "bg-border/40",
                       i > 20 && "opacity-30"
                     )} 
                   />
                 ))}
              </div>
              <p className="text-xs text-text-muted font-bold px-1 italic">"The secret to mastery is showing up every day."</p>
           </div>
        </div>
      </div>
    </div>
  );
}

export default History;
