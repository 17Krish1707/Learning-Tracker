import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, Clock, Target, Calendar, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const data = [
  { name: 'Mon', hours: 2.4 },
  { name: 'Tue', hours: 3.5 },
  { name: 'Wed', hours: 2.1 },
  { name: 'Thu', hours: 4.2 },
  { name: 'Fri', hours: 1.8 },
  { name: 'Sat', hours: 5.0 },
  { name: 'Sun', hours: 3.2 },
];

const subjectData = [
  { name: 'DSA', value: 45, color: '#6366f1' },
  { name: 'Java', value: 25, color: '#8b5cf6' },
  { name: 'DBMS', value: 20, color: '#10b981' },
  { name: 'OS', value: 10, color: '#f59e0b' },
];

function Statistics() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-text-primary tracking-tighter mb-2">Academic Analytics.</h1>
          <p className="text-lg text-text-muted font-medium">Deep dive into your learning patterns and efficiency.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-background-tertiary rounded-2xl border border-border">
          <Calendar size={18} className="text-accent-primary" />
          <span className="text-sm font-bold text-text-secondary">Last 7 Days</span>
        </div>
      </div>

      {/* High-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Deep Work', value: '22.5h', icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Avg / Day', value: '3.2h', icon: TrendingUp, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' },
          { label: 'Completion', value: '78%', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Rank', value: 'Elite', icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-4xl bg-background-primary border border-border shadow-soft flex items-center gap-4 group hover:border-accent-primary/30 transition-all"
          >
            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{stat.label}</p>
              <h4 className="text-2xl font-black text-text-primary tracking-tight">{stat.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Activity Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 p-10 rounded-[3rem] bg-background-primary border border-border shadow-premium"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-text-primary tracking-tight">Study Intensity</h3>
              <p className="text-sm text-text-muted">Total focus hours per day over the current week.</p>
            </div>
            <div className="flex gap-2">
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background-tertiary text-xs font-bold text-text-secondary">
                  <div className="h-2 w-2 rounded-full bg-accent-primary shadow-[0_0_8px_var(--accent-primary)]" />
                  Hours
               </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    borderRadius: '16px', 
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)',
                    fontWeight: 800
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="var(--accent-primary)" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorHours)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Subject Breakdown Pie */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 p-10 rounded-[3rem] bg-background-primary border border-border shadow-premium flex flex-col"
        >
          <div className="mb-8">
            <h3 className="text-2xl font-black text-text-primary tracking-tight">Focus Distro</h3>
            <p className="text-sm text-text-muted">Time allocation by subject.</p>
          </div>

          <div className="flex-1 min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                   <Pie
                      data={subjectData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                   >
                      {subjectData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                   </Pie>
                   <Tooltip />
                </PieChart>
             </ResponsiveContainer>
          </div>

          <div className="space-y-3 mt-6">
             {subjectData.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-sm font-bold text-text-secondary">{s.name}</span>
                   </div>
                   <span className="text-sm font-black text-text-primary">{s.value}%</span>
                </div>
             ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Statistics;
