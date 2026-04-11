import React, { useState } from 'react';
import { Target, Clock, CheckCircle2, Plus, TrendingUp, Calendar, Zap, ArrowUpRight, Search, LayoutGrid, List, ArrowRight, Check, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import TopicList from './TopicList';
import AddTopic from './AddTopic';
import DailyGoals from './DailyGoals';

function Dashboard({ subject, topics, allTopics = [], profile, onStatusChange, onEditTopic, onAddTopic, onLogTime, onDeleteTopic }) {
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
        className="max-w-7xl mx-auto space-y-12 py-4 pb-20"
      >
        {/* Simple Greeting */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-12">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <span className="h-1.5 w-1.5 rounded-full bg-accent-primary animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted opacity-60 italic">Online & Active</p>
             </div>
             <h1 className="text-7xl font-black text-text-primary tracking-tighter leading-[0.9]">
               Hello, <br /><span className="text-accent-primary italic">{profile.name.split(' ')[0]}.</span>
             </h1>
             <p className="text-xl text-text-muted font-medium max-w-xl">Your learning journey is on track. Here's what needs your attention today.</p>
          </div>
          
          <div className="flex items-center gap-6 divide-x divide-border">
             <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1 opacity-50">Mastery</p>
                <h4 className="text-4xl font-black text-text-primary tracking-tighter">{globalProgress}%</h4>
             </div>
             <div className="text-right pl-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1 opacity-50">Total Time</p>
                <h4 className="text-4xl font-black text-text-primary tracking-tighter">{(globalTotalTime/60).toFixed(1)}h</h4>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Focus Plan */}
          <div className="lg:col-span-7 space-y-12">
            <div className="p-10 rounded-[3rem] bg-gradient-to-br from-background-primary to-background-secondary border border-border shadow-soft">
               <DailyGoals profile={profile} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-8 rounded-4xl bg-background-primary border border-border shadow-soft group hover:border-accent-primary/40 transition-all text-center">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Consistency</h4>
                  <p className="text-2xl font-black text-text-primary tracking-tight italic">Top Performer</p>
               </div>
               
               <div className="p-8 rounded-4xl bg-background-primary border border-border shadow-soft group hover:border-accent-secondary/40 transition-all text-center">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Status</h4>
                  <p className="text-2xl font-black text-text-primary tracking-tight italic">Active Streak</p>
               </div>
            </div>
          </div>

          {/* Right: Task Queue */}
          <div className="lg:col-span-5 space-y-8">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Action Items</h3>
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-background-tertiary border border-border text-text-muted uppercase">Top 5</span>
             </div>

             <div className="space-y-4">
                {actionItems.length > 0 ? actionItems.map((topic, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={topic.id}
                    className="group p-6 bg-background-primary border border-border rounded-3xl hover:border-accent-primary/40 hover:shadow-soft transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-5 min-w-0">
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           const nextStatus = {
                             'Not Started': 'In Progress',
                             'In Progress': 'Completed',
                             'Completed': 'Not Started'
                           };
                           onStatusChange(topic.id, nextStatus[topic.status]);
                         }}
                         className={cn(
                           "h-10 w-10 min-w-[40px] rounded-xl border-2 flex items-center justify-center transition-all shadow-sm",
                           topic.status === 'Completed' 
                             ? "bg-success/10 border-success text-success" 
                             : topic.status === 'In Progress'
                               ? "border-accent-primary text-accent-primary bg-accent-primary/5"
                               : "bg-background-tertiary border-border text-text-muted hover:border-accent-primary"
                         )}
                       >
                         {topic.status === 'Completed' ? (
                           <Check size={18} strokeWidth={4} />
                         ) : topic.status === 'In Progress' ? (
                           <div className="h-2 w-2 rounded-full bg-accent-primary animate-pulse" />
                         ) : (
                           <Circle size={18} className="opacity-40" />
                         )}
                       </button>
                       <div className="min-w-0">
                          <h5 className="text-sm font-black text-text-primary tracking-tight truncate uppercase italic leading-none mb-1 group-hover:text-accent-primary transition-colors">{topic.title}</h5>
                          <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-60 last:italic">{topic.priority} Priority</p>
                       </div>
                    </div>
                    <ArrowRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
                  </motion.div>
                )) : (
                  <div className="p-12 text-center rounded-4xl border border-dashed border-border opacity-50">
                     <p className="text-sm font-bold text-text-muted italic">All caught up! Zero items in queue.</p>
                  </div>
                )}
             </div>

             <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 space-y-6">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
                   <span>Projected Growth</span>
                   <span>{(globalProgress * 1.2).toFixed(0)}%</span>
                </div>
                <div className="h-1 w-full bg-background-primary rounded-full overflow-hidden">
                   <div className="h-full w-[45%] bg-indigo-500 rounded-full" />
                </div>
                <p className="text-xs text-text-muted font-medium italic opacity-60">Estimation based on current momentum.</p>
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
    <div className="max-w-7xl mx-auto space-y-10 py-4">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-3">
             <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-success">Tracker Active</span>
          </div>
          <h1 className="text-5xl font-black text-text-primary tracking-tighter mb-2 flex items-center gap-4">
            {subject.name}
            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-accent-primary/5 text-accent-primary border border-accent-primary/10">
               <TrendingUp size={20} />
            </div>
          </h1>
          <p className="text-lg text-text-muted font-medium">Progress overview and topic management.</p>
        </motion.div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddTopic(true)}
            className="flex items-center gap-2 h-14 px-8 rounded-2xl bg-accent-primary text-white font-black shadow-premium hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            <Plus size={20} /> New Topic
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Analytics & Topics */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Progress Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-10 rounded-[3rem] bg-gradient-to-br from-background-primary to-background-secondary border border-border shadow-premium relative overflow-hidden group"
          >
            <div className="absolute -right-10 -top-10 h-64 w-64 bg-accent-primary/5 rounded-full blur-[80px] group-hover:bg-accent-primary/10 transition-colors" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-accent-primary uppercase tracking-[0.4em] mb-3">Overall Completion</p>
                  <h3 className="text-6xl font-black text-text-primary tracking-tighter">{progressPercent}<span className="text-2xl text-text-muted">%</span></h3>
                </div>
                <div className="flex flex-wrap gap-6 pt-2">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Completed</p>
                      <p className="text-xl font-bold text-success flex items-center gap-2"><CheckCircle2 size={18} /> {completedTopics}</p>
                   </div>
                   <div className="w-[1px] h-10 bg-border hidden sm:block" />
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">In Progress</p>
                      <p className="text-xl font-bold text-accent-secondary flex items-center gap-2"><Clock size={18} /> {topics.length - completedTopics}</p>
                   </div>
                </div>
              </div>

              <div className="relative flex items-center justify-center p-4">
                 <svg className="w-56 h-56 -rotate-90">
                   <circle cx="112" cy="112" r="90" fill="none" stroke="currentColor" strokeWidth="12" className="text-border/40" />
                   <motion.circle 
                     cx="112" cy="112" r="90" fill="none" stroke="currentColor" strokeWidth="12" 
                     className="text-accent-primary" 
                     strokeDasharray="565.48" 
                     initial={{ strokeDashoffset: 565.48 }}
                     animate={{ strokeDashoffset: 565.48 - (565.48 * progressPercent) / 100 }}
                     transition={{ duration: 1.5, ease: "easeOut" }}
                     strokeLinecap="round"
                   />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-text-primary">{completedTopics}</span>
                    <span className="text-[10px] font-black text-text-muted uppercase">Topics Done</span>
                 </div>
              </div>
            </div>

            <div className="mt-12 h-4 w-full rounded-full bg-background-tertiary/50 border border-border/50 overflow-hidden p-1">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progressPercent}%` }}
                 transition={{ duration: 1, delay: 0.5 }}
                 className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
               />
            </div>
          </motion.div>

          {/* Topics Section */}
          <div className="rounded-[3rem] bg-background-primary border border-border shadow-soft overflow-hidden">
            <div className="px-10 py-8 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-6 bg-background-secondary/10">
              <div className="flex items-center gap-4">
                <Search className="text-text-muted" size={20} />
                <input 
                  type="text" 
                  placeholder="Filter topics..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-text-primary placeholder:text-text-muted focus:ring-0 outline-none w-full"
                />
              </div>
              <div className="flex items-center gap-1 p-1 bg-background-tertiary rounded-2xl">
                <button onClick={() => setViewMode('grid')} className={cn("p-2 px-4 rounded-xl transition-all", viewMode === 'grid' ? "bg-background-primary shadow-sm text-accent-primary" : "text-text-muted hover:text-text-primary")}><LayoutGrid size={18} /></button>
                <button onClick={() => setViewMode('list')} className={cn("p-2 px-4 rounded-xl transition-all", viewMode === 'list' ? "bg-background-primary shadow-sm text-accent-primary" : "text-text-muted hover:text-text-primary")}><List size={18} /></button>
              </div>
            </div>

            <AnimatePresence>
              {showAddTopic && (
                <motion.div 
                  ref={addTopicRef}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-10 border-b border-border bg-background-secondary/20 overflow-hidden"
                >
                  <div className="py-10">
                    <AddTopic onAdd={onAddTopic} onClose={() => setShowAddTopic(false)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 md:p-8">
              <TopicList 
                topics={filteredTopics} 
                onStatusChange={onStatusChange}
                onLogTime={onLogTime}
                onDeleteTopic={onDeleteTopic}
                onEditTopic={onEditTopic}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Side Stats & Daily Goals */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Main Side Stats */}
          <div className="grid grid-cols-1 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-4xl bg-background-primary border border-border shadow-soft flex flex-col justify-between group hover:border-accent-primary/30 transition-all"
            >
              <div className="flex justify-between items-start">
                 <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock size={28} />
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1 text-right">Total Effort</p>
                    <h4 className="text-3xl font-black text-text-primary tracking-tight">{formatHours(totalTimeSpent)}<span className="text-sm text-text-muted ml-1 italic">hrs</span></h4>
                 </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                 <span className="text-xs font-bold text-text-muted">Efficiency focus</span>
                 <span className="text-xs font-black text-success flex items-center gap-1"><TrendingUp size={12} /> +12%</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-8 rounded-4xl bg-background-primary border border-border shadow-soft flex flex-col justify-between group hover:border-accent-secondary/30 transition-all"
            >
              <div className="flex justify-between items-start">
                 <div className="h-14 w-14 rounded-2xl bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar size={28} />
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-fuchsia-500 uppercase tracking-widest mb-1 text-right">Next Milestone</p>
                    <h4 className="text-3xl font-black text-text-primary tracking-tight">4<span className="text-sm text-text-muted ml-1 italic">days</span></h4>
                 </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                 <span className="text-xs font-bold text-text-muted">Scheduled sprint</span>
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="h-6 w-6 rounded-full border-2 border-background-primary bg-background-tertiary" />)}
                 </div>
              </div>
            </motion.div>
          </div>

          {/* Daily Goals Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-8 rounded-[2.5rem] bg-background-primary border border-border shadow-soft"
          >
            <DailyGoals profile={profile} />
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
