import React, { useState } from 'react';
import { Target, Clock, CheckCircle2, Plus, TrendingUp, Calendar, Zap, ArrowUpRight, Search, LayoutGrid, List, ArrowRight, Check, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import TopicList from './TopicList';
import AddTopic from './AddTopic';
import DailyGoals from './DailyGoals';

function Dashboard({ subject, topics, allTopics = [], profile, onStatusChange, onEditTopic, onAddTopic, onLogTime, onDeleteTopic, onNavigate, todayStats }) {
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const addTopicRef = React.useRef(null);

  React.useEffect(() => {
    if (showAddTopic && addTopicRef.current) {
      addTopicRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showAddTopic]);

  // Task Queue for Overview
  const actionItems = allTopics
    .filter(t => t.status !== 'Completed')
    .sort((a, b) => {
      const p = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return p[b.priority] - p[a.priority];
    })
    .slice(0, 5);

  const globalTotalTime = allTopics.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0);
  const globalCompleted = allTopics.filter(t => t.status === 'Completed').length;
  const globalProgress = allTopics.length > 0 ? Math.round((globalCompleted / allTopics.length) * 100) : 0;

  if (!subject) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto space-y-12 py-4 pb-20 mt-8"
      >
        {/* Simple Greeting */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-16">
          <div className="space-y-6">
             <div className="flex items-center gap-3">
               <span className="h-2 w-2 rounded-full bg-accent-primary shadow-[0_0_12px_rgba(167,139,250,0.8)] animate-pulse" />
               <p className="text-[11px] font-black uppercase tracking-[0.45em] text-text-muted opacity-80 italic">System Online</p>
             </div>
             <h1 className="text-8xl font-black text-text-primary tracking-tighter leading-[0.85] filter drop-shadow-sm">
               Hello, <br /><span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary italic"> {profile.name.split(' ')[0]}.</span>
             </h1>
             <p className="text-xl text-text-muted font-medium max-w-xl leading-relaxed">Your learning journey is on track. Here is what needs focus today.</p>
          </div>
          
          <div className="flex items-center gap-10">
             <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted mb-2 opacity-60">Completion</p>
                <h4 className="text-5xl font-black text-text-primary tracking-tighter">{globalProgress}<span className="text-2xl opacity-30">%</span></h4>
             </div>
             <div className="h-12 w-[1px] bg-border/60" />
             <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted mb-2 opacity-60">Total Effort</p>
                <h4 className="text-5xl font-black text-text-primary tracking-tighter">{(globalTotalTime/60).toFixed(1)}<span className="text-2xl opacity-30">h</span></h4>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Focus Plan */}
          <div className="lg:col-span-7 space-y-12">
            <div className="relative p-1 rounded-[3.5rem] bg-gradient-to-br from-accent-primary/10 via-transparent to-accent-secondary/5 overflow-hidden">
               <div className="absolute inset-0 bg-background-primary/40 backdrop-blur-3xl" />
               <div className="relative p-10 rounded-[3.3rem] bg-background-primary/40 border border-white/10 shadow-soft overflow-hidden group">
                  <div className="absolute -right-20 -top-20 h-64 w-64 bg-accent-primary/10 rounded-full blur-[100px] group-hover:bg-accent-primary/20 transition-all duration-700" />
                  <DailyGoals profile={profile} todayStats={todayStats} />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 rounded-[2.5rem] bg-background-primary border border-border shadow-soft group hover:border-accent-primary/40 hover:-translate-y-1 transition-all duration-300 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-muted mb-3">Performance</h4>
                  <p className="text-3xl font-black text-text-primary tracking-tight italic">Elite Streak</p>
               </div>
               
               <div className="p-8 rounded-[2.5rem] bg-background-primary border border-border shadow-soft group hover:border-accent-secondary/40 hover:-translate-y-1 transition-all duration-300 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-muted mb-3">Ranking</h4>
                  <p className="text-3xl font-black text-text-primary tracking-tight italic">Top Performer</p>
               </div>
            </div>
          </div>

          {/* Right: Task Queue */}
          <div className="lg:col-span-5 space-y-8">
             <div className="flex items-center justify-between px-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-text-muted opacity-80">Queue</h3>
                <span className="text-[10px] font-black px-3 py-1 rounded-full bg-background-tertiary border border-border text-text-muted uppercase tracking-wider">System Queue</span>
             </div>

             <div className="space-y-4">
                {actionItems.length > 0 ? actionItems.map((topic, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={topic.id}
                    onClick={() => onNavigate(topic.subjectId)}
                    className="group p-6 bg-background-primary/50 backdrop-blur-md border border-border rounded-[2rem] hover:border-accent-primary/40 hover:shadow-premium transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-5 min-w-0">
                       <div className={cn(
                         "h-12 w-12 min-w-[48px] rounded-2xl flex items-center justify-center transition-all shadow-sm",
                         topic.priority === 'High' ? "bg-red-500/10 text-red-500 border border-red-500/20" : topic.priority === 'Medium' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                       )}>
                          <Zap size={20} fill="currentColor" className="opacity-60" />
                       </div>
                       <div className="min-w-0">
                          <h5 className="text-[13px] font-black text-text-primary tracking-tight truncate uppercase italic leading-none mb-2 group-hover:text-accent-primary transition-colors">{topic.title}</h5>
                          <div className="flex items-center gap-2">
                             <span className="h-1 w-1 rounded-full bg-text-muted opacity-30" />
                             <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] opacity-60 italic">{topic.priority} Level</p>
                          </div>
                       </div>
                    </div>
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-background-tertiary text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                       <ArrowRight size={16} />
                    </div>
                  </motion.div>
                )) : (
                  <div className="p-16 text-center rounded-[3rem] border border-dashed border-border/60 bg-background-secondary/20 flex flex-col items-center gap-4 group">
                     <div className="h-16 w-16 rounded-3xl bg-background-tertiary flex items-center justify-center text-text-muted group-hover:scale-110 transition-transform duration-500">
                        <Zap size={32} strokeWidth={1} className="opacity-40" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-black text-text-primary uppercase tracking-widest italic">All caught up</p>
                        <p className="text-xs font-bold text-text-muted italic opacity-60">System queue is empty.</p>
                     </div>
                  </div>
                )}
             </div>

             <div className="p-10 rounded-[3rem] bg-gradient-to-br from-indigo-500/10 to-accent-primary/10 border border-accent-primary/20 space-y-8 relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-accent-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.3em] text-accent-primary">
                   <span>Mastery Projection</span>
                   <span className="px-3 py-1 rounded-full bg-accent-primary text-white text-[9px]">Calculated</span>
                </div>
                <div className="space-y-3">
                   <div className="h-2 w-full bg-background-primary/50 rounded-full overflow-hidden p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${globalProgress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-accent-primary to-accent-highlight rounded-full" 
                      />
                   </div>
                   <div className="flex justify-between text-[10px] font-bold text-text-muted italic px-1 opacity-60">
                      <span>Legacy</span>
                      <span>Target: 100%</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const totalTimeSpent = topics.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0);
  const completedTopics = topics.filter(t => t.status === 'Completed').length;
  const progressPercent = topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0;
  const filteredTopics = topics.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const formatHours = (minutes) => (minutes / 60).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-8">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-4 relative">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-4">
             <div className="h-3 w-3 rounded-full bg-success shadow-[0_0_12px_rgba(5,150,105,0.6)] animate-pulse" />
             <span className="text-[11px] font-black uppercase tracking-[0.4em] text-success">Study Session</span>
          </div>
          <h1 className="text-6xl font-black text-text-primary tracking-tighter mb-4 flex items-center gap-6">
            {subject.name}
            <div className="h-14 w-14 flex items-center justify-center rounded-[1.25rem] bg-accent-primary text-white shadow-premium hover:rotate-6 transition-transform">
               <TrendingUp size={28} strokeWidth={2.5} />
            </div>
          </h1>
          <p className="text-xl text-text-muted font-medium italic opacity-80">Optimizing focus for maximum retention.</p>
        </motion.div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowAddTopic(true)}
            className="group relative h-16 px-12 rounded-[2rem] bg-accent-primary text-white font-black overflow-hidden shadow-premium active:scale-95 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <div className="relative flex items-center gap-3 uppercase tracking-[0.2em] text-xs">
               <Plus size={20} strokeWidth={3} /> New Entry
            </div>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Analytics & Topics */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Main Progress Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative p-1 rounded-[4rem] bg-gradient-to-br from-accent-primary/20 via-transparent to-accent-secondary/10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-background-primary/40 backdrop-blur-3xl" />
            <div className="relative p-12 rounded-[3.8rem] bg-background-primary/40 border border-white/10 shadow-premium overflow-hidden group">
               <div className="absolute -left-20 -top-20 h-80 w-80 bg-accent-primary/10 rounded-full blur-[120px]" />
               <div className="absolute -right-20 -bottom-20 h-64 w-64 bg-accent-secondary/5 rounded-full blur-[100px]" />
               
               <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                 <div className="space-y-8 flex-1">
                   <div>
                     <p className="text-[11px] font-black text-accent-primary uppercase tracking-[0.5em] mb-4 opacity-80 italic">Course Progress</p>
                     <h3 className="text-8xl font-black text-text-primary tracking-tighter tabular-nums leading-none">{progressPercent}<span className="text-3xl text-text-muted ml-2 opacity-30">%</span></h3>
                   </div>
                   
                   <div className="flex flex-wrap gap-10 pt-4">
                      <div className="space-y-2">
                         <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Completed</p>
                         <p className="text-2xl font-black text-success flex items-center gap-3"><CheckCircle2 size={24} strokeWidth={2.5} /> {completedTopics}</p>
                      </div>
                      <div className="w-[1px] h-12 bg-border/40 hidden sm:block" />
                      <div className="space-y-2">
                         <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Pending</p>
                         <p className="text-2xl font-black text-accent-primary flex items-center gap-3"><Clock size={24} strokeWidth={2.5} /> {topics.length - completedTopics}</p>
                      </div>
                   </div>
                 </div>

                 <div className="relative flex items-center justify-center p-6 shrink-0">
                    <div className="absolute inset-0 bg-accent-primary/5 rounded-full blur-3xl" />
                    <svg className="w-64 h-64 -rotate-90 relative z-10">
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="var(--accent-primary)" />
                          <stop offset="100%" stopColor="var(--accent-highlight)" />
                        </linearGradient>
                        <filter id="glow">
                           <feGaussianBlur stdDeviation="4" result="blur" />
                           <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>
                      <circle cx="128" cy="128" r="110" fill="none" stroke="currentColor" strokeWidth="16" className="text-border/20" />
                      <motion.circle 
                        cx="128" cy="128" r="110" fill="none" stroke="url(#progressGradient)" strokeWidth="16" 
                        strokeDasharray="691" 
                        initial={{ strokeDashoffset: 691 }}
                        animate={{ strokeDashoffset: 691 - (691 * progressPercent) / 100 }}
                        transition={{ duration: 2, ease: "circOut" }}
                        strokeLinecap="round"
                        filter="url(#glow)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 translate-y-2">
                       <span className="text-5xl font-black text-text-primary flex items-end">
                          {completedTopics}<span className="text-xl text-text-muted mb-2 ml-1">/{topics.length}</span>
                       </span>
                       <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-40">Records</span>
                    </div>
                 </div>
               </div>

               <div className="mt-16 h-2 w-full rounded-full bg-background-tertiary shadow-inner overflow-hidden flex p-0.5 border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.2, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-highlight rounded-full relative"
                  >
                     <div className="absolute top-0 right-0 h-full w-8 bg-white/20 blur-sm -skew-x-12" />
                  </motion.div>
               </div>
            </div>
          </motion.div>

          {/* Topics Section */}
          <div className="rounded-[4rem] bg-background-primary border border-border shadow-soft overflow-hidden">
            <div className="px-12 py-10 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-8 bg-background-secondary/10">
              <div className="flex items-center gap-6 flex-1 w-full">
                <Search className="text-accent-primary" size={24} />
                <input 
                  type="text" 
                  placeholder="Search topics..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-lg font-bold text-text-primary placeholder:text-text-muted/40 focus:ring-0 outline-none w-full italic"
                />
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-background-tertiary rounded-2xl border border-border shadow-inner">
                <button onClick={() => setViewMode('grid')} className={cn("p-2.5 px-5 rounded-xl transition-all", viewMode === 'grid' ? "bg-background-primary shadow-premium text-accent-primary" : "text-text-muted hover:text-text-primary")}><LayoutGrid size={20} /></button>
                <button onClick={() => setViewMode('list')} className={cn("p-2.5 px-5 rounded-xl transition-all", viewMode === 'list' ? "bg-background-primary shadow-premium text-accent-primary" : "text-text-muted hover:text-text-primary")}><List size={20} /></button>
              </div>
            </div>

            <AnimatePresence>
              {showAddTopic && (
                <motion.div 
                  ref={addTopicRef}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-12 border-b border-border bg-accent-primary/[0.02] overflow-hidden"
                >
                  <div className="py-12">
                    <AddTopic onAdd={onAddTopic} onClose={() => setShowAddTopic(false)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-6 md:p-12">
              {filteredTopics.length > 0 ? (
                <TopicList 
                  topics={filteredTopics} 
                  onStatusChange={onStatusChange}
                  onLogTime={onLogTime}
                  onDeleteTopic={onDeleteTopic}
                  onEditTopic={onEditTopic}
                />
              ) : (
                <div className="py-24 text-center rounded-[3rem] border border-dashed border-border/60 bg-background-secondary/10 group">
                   <div className="h-24 w-24 rounded-[2.5rem] bg-background-primary border border-border flex items-center justify-center mx-auto mb-8 shadow-soft group-hover:scale-110 transition-transform duration-700">
                      <Search size={40} strokeWidth={1} className="text-text-muted opacity-20" />
                   </div>
                   <h4 className="text-xl font-black text-text-primary uppercase tracking-[0.2em] mb-3 italic">Nothing Found</h4>
                   <p className="text-sm font-medium text-text-muted italic opacity-60 mb-8 max-w-xs mx-auto">No records match your current filter criteria.</p>
                   <button 
                     onClick={() => setSearchQuery('')}
                     className="px-8 py-3 rounded-2xl bg-background-tertiary border border-border text-xs font-black uppercase tracking-widest text-text-primary hover:bg-background-secondary transition-all"
                   >
                     Reset Search
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Side Stats & Daily Goals */}
        <div className="lg:col-span-4 flex flex-col gap-10">
          
          {/* Main Side Stats */}
          <div className="grid grid-cols-1 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative p-1 rounded-[3rem] bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
            >
              <div className="p-10 rounded-[2.8rem] bg-background-primary border border-border shadow-soft flex flex-col justify-between group h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-colors duration-700" />
                <div className="flex justify-between items-start relative z-10">
                   <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm border border-indigo-500/10">
                      <Clock size={32} strokeWidth={2.5} />
                   </div>
                   <div className="text-right">
                      <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2 text-right opacity-80 italic">Time Logged</p>
                      <h4 className="text-5xl font-black text-text-primary tracking-tighter tabular-nums">{formatHours(totalTimeSpent)}<span className="text-xl text-text-muted ml-2 italic opacity-30">h</span></h4>
                   </div>
                </div>
                <div className="mt-8 pt-8 border-t border-border/60 flex items-center justify-between relative z-10">
                   <span className="text-xs font-bold text-text-muted italic opacity-60 tracking-tight">Tracked effort</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative p-1 rounded-[3rem] bg-accent-secondary/10 hover:bg-accent-secondary/20 transition-colors"
            >
              <div className="p-10 rounded-[2.8rem] bg-background-primary border border-border shadow-soft flex flex-col justify-between group h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-accent-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent-secondary/10 transition-colors duration-700" />
                <div className="flex justify-between items-start relative z-10">
                   <div className="h-16 w-16 rounded-2xl bg-accent-secondary/10 text-accent-secondary flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-sm border border-accent-secondary/10">
                      <Calendar size={32} strokeWidth={2.5} />
                   </div>
                   <div className="text-right">
                      <p className="text-[11px] font-black text-accent-secondary uppercase tracking-[0.3em] mb-2 text-right opacity-80 italic">Deadline</p>
                      <h4 className="text-5xl font-black text-text-primary tracking-tighter tabular-nums">14<span className="text-xl text-text-muted ml-2 italic opacity-30">d</span></h4>
                   </div>
                </div>
                <div className="mt-8 pt-8 border-t border-border/60 flex items-center justify-between relative z-10">
                   <span className="text-xs font-bold text-text-muted italic opacity-60 tracking-tight">Estimated completion</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Daily Goals Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-10 rounded-[4rem] bg-background-primary border border-border shadow-premium relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-highlight" />
            <DailyGoals profile={profile} todayStats={todayStats} />
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
