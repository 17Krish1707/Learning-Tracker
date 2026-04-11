import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, Clock, Target, Calendar, Award, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { statsAPI } from '../services/api';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

function Statistics() {
  const [stats, setStats]           = useState(null);
  const [subjectStats, setSubjectStats] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, sub] = await Promise.all([statsAPI.getOverall(), statsAPI.getSubjects()]);
      setStats(ov.stats);
      setSubjectStats(sub.stats || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Build chart data from dailyActivity
  const chartData = React.useMemo(() => {
    if (!stats?.dailyActivity) return [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Object.entries(stats.dailyActivity)
      .slice(-7)
      .map(([dateStr, hours]) => ({
        name: days[new Date(dateStr).getDay()],
        hours: parseFloat(hours.toFixed(2)),
      }));
  }, [stats]);

  const pieData = subjectStats.map((s, i) => ({
    name: s.name,
    value: s.hours || 0,
    color: COLORS[i % COLORS.length],
  })).filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-2xl bg-accent-primary/20 animate-pulse" />
        <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Loading analytics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-20 flex flex-col items-center gap-4 text-center">
        <AlertCircle size={40} className="text-red-500 opacity-60" />
        <p className="text-text-primary font-bold">Failed to load statistics</p>
        <p className="text-sm text-text-muted">{error}</p>
        <button onClick={load} className="flex items-center gap-2 px-5 h-10 rounded-2xl bg-accent-primary text-white font-bold text-sm">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const metricCards = [
    { label: 'Total Hours',   value: `${stats?.totalHours ?? 0}h`,  icon: Clock,     color: 'text-indigo-500',  bg: 'bg-indigo-500/10' },
    { label: 'This Week',     value: `${stats?.hoursThisWeek ?? 0}h`,icon: TrendingUp, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' },
    { label: 'Completion',    value: `${stats?.progressPercent ?? 0}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Day Streak',    value: `${stats?.streak ?? 0}d`,       icon: Award,     color: 'text-amber-500',   bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-text-primary tracking-tighter mb-2">Academic Analytics.</h1>
          <p className="text-lg text-text-muted font-medium">Real-time insights from your study sessions.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-background-tertiary rounded-2xl border border-border text-sm font-bold text-text-secondary hover:text-accent-primary transition-colors">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metricCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-4xl bg-background-primary border border-border shadow-soft flex items-center gap-4 group hover:border-accent-primary/30 transition-all"
          >
            <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform', stat.bg, stat.color)}>
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
        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 p-10 rounded-[3rem] bg-background-primary border border-border shadow-premium"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-text-primary tracking-tight">Study Intensity</h3>
              <p className="text-sm text-text-muted">Hours logged per day — last 7 days.</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--accent-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border-color)', fontWeight: 800 }}
                    formatter={(v) => [`${v}h`, 'Hours']}
                  />
                  <Area type="monotone" dataKey="hours" stroke="var(--accent-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-text-muted font-bold italic">No sessions logged in the last 7 days.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 p-10 rounded-[3rem] bg-background-primary border border-border shadow-premium flex flex-col"
        >
          <div className="mb-8">
            <h3 className="text-2xl font-black text-text-primary tracking-tight">Focus Distro</h3>
            <p className="text-sm text-text-muted">Time allocation by subject.</p>
          </div>
          {pieData.length > 0 ? (
            <>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v.toFixed(1)}h`, 'Hours']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-6">
                {pieData.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-sm font-bold text-text-secondary truncate max-w-[120px]">{s.name}</span>
                    </div>
                    <span className="text-sm font-black text-text-primary">{s.value.toFixed(1)}h</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-text-muted font-bold italic text-center text-sm">Log study sessions to see subject breakdown.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Upcoming Deadlines */}
      {stats?.upcomingDeadlines?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-[3rem] bg-background-primary border border-border shadow-soft"
        >
          <h3 className="text-2xl font-black text-text-primary tracking-tight mb-6">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {stats.upcomingDeadlines.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-background-secondary border border-border">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-accent-primary" />
                  <span className="font-bold text-text-primary">{d.title}</span>
                </div>
                <span className="text-sm font-bold text-amber-500">
                  {new Date(d.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Statistics;