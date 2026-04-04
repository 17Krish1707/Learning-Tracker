import React, { useState } from 'react';
import { Target, Clock, CheckCircle2, Plus, TrendingUp, Calendar, Zap, ArrowUpRight, Search, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import TopicList from './TopicList';
import AddTopic from './AddTopic';

function Dashboard({ subject, topics, onStatusChange, onEditTopic, onAddTopic, onLogTime, onDeleteTopic }) {
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  if (!subject) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center max-w-4xl mx-auto"
      >
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-accent-primary/20 blur-3xl rounded-full scale-150" />
          <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-gradient-to-tr from-accent-primary to-accent-secondary text-white shadow-premium animate-pulse-subtle">
            <Target size={56} strokeWidth={1.5} />
          </div>
        </div>
        
        <h2 className="text-5xl font-black tracking-tight text-text-primary mb-6">Your Academic Command Center.</h2>
        <p className="text-xl text-text-secondary leading-relaxed mb-12 max-w-2xl opacity-80">
          Unlock your full potential with professional tracking, real-time insights, and a distraction-free environment designed for peak performance.
        </p>

        <div className="grid md:grid-cols-3 gap-6 w-full">
          {[
            { icon: LayoutGrid, title: 'Organize', desc: 'Structure your knowledge with folders.', color: 'indigo' },
            { icon: Zap, title: 'Track', desc: 'Real-time logs for every study session.', color: 'fuchsia' },
            { icon: TrendingUp, title: 'Analyze', desc: 'Visual progress metrics that motivate.', color: 'emerald' },
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-4xl bg-background-primary border border-border hover:border-accent-primary/50 transition-all text-left shadow-soft hover:shadow-premium group">
               <div className={cn(
                 "h-12 w-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                 feature.color === 'indigo' ? "bg-indigo-500/10 text-indigo-500" : 
                 feature.color === 'fuchsia' ? "bg-fuchsia-500/10 text-fuchsia-500" : "bg-emerald-500/10 text-emerald-500"
               )}>
                 <feature.icon size={24} />
               </div>
               <h4 className="text-lg font-black text-text-primary mb-2 uppercase tracking-tight">{feature.title}</h4>
               <p className="text-sm text-text-muted leading-relaxed">{feature.desc}</p>
            </div>
          ))}
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
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-success">Live Track Active</span>
          </div>
          <h1 className="text-5xl font-black text-text-primary tracking-tighter mb-2 flex items-center gap-4">
            {subject.name}
            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-accent-primary/5 text-accent-primary border border-accent-primary/10">
               <ArrowUpRight size={20} />
            </div>
          </h1>
          <p className="text-lg text-text-muted font-medium">Mastering excellence through consistent action.</p>
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

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Progress Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-8 p-10 rounded-[3rem] bg-gradient-to-br from-background-primary to-background-secondary border border-border shadow-premium relative overflow-hidden group"
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

        {/* Side Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-4xl bg-background-primary border border-border shadow-soft flex flex-col justify-between flex-1 group hover:border-accent-primary/30 transition-all"
          >
            <div className="flex justify-between items-start">
               <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock size={28} />
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Total Effort</p>
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
            className="p-8 rounded-4xl bg-background-primary border border-border shadow-soft flex flex-col justify-between flex-1 group hover:border-accent-secondary/30 transition-all"
          >
            <div className="flex justify-between items-start">
               <div className="h-14 w-14 rounded-2xl bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar size={28} />
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-fuchsia-500 uppercase tracking-widest mb-1">Next Milestone</p>
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
      </div>

      {/* Topics Section */}
      <div className="rounded-[3rem] bg-background-primary border border-border shadow-soft overflow-hidden">
        <div className="px-10 py-8 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-6 bg-background-secondary/10">
          <div>
            <h3 className="text-2xl font-black text-text-primary tracking-tight">Focus Units</h3>
            <p className="text-sm text-text-muted font-medium">Manage and track individual learning modules.</p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-background-tertiary rounded-2xl">
            <button onClick={() => setViewMode('grid')} className={cn("p-2 px-4 rounded-xl transition-all", viewMode === 'grid' ? "bg-background-primary shadow-sm text-accent-primary" : "text-text-muted hover:text-text-primary")}><LayoutGrid size={18} /></button>
            <button onClick={() => setViewMode('list')} className={cn("p-2 px-4 rounded-xl transition-all", viewMode === 'list' ? "bg-background-primary shadow-sm text-accent-primary" : "text-text-muted hover:text-text-primary")}><List size={18} /></button>
          </div>
        </div>

        <AnimatePresence>
          {showAddTopic && (
            <motion.div 
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
  );
}

export default Dashboard;
