import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History as HistoryIcon, Clock, CheckCircle2,
  Layers, Search, RotateCcw, Zap, AlertCircle, RefreshCw, Trash2
} from 'lucide-react';
import { cn } from '../utils/cn';
import { sessionsAPI } from '../services/api';

function History() {
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting]   = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sessionsAPI.getAll();
      setSessions(res.sessions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (sessionId) => {
    setDeleting(sessionId);
    try {
      await sessionsAPI.remove(sessionId);
      setSessions(prev => prev.filter(s => s._id !== sessionId));
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete ALL session history? This cannot be undone.')) return;
    try {
      await Promise.all(sessions.map(s => sessionsAPI.remove(s._id)));
      setSessions([]);
    } catch (e) {
      alert(e.message);
    }
  };

  const filtered = sessions.filter(s => {
    const q = searchTerm.toLowerCase();
    return (
      (s.topicId?.title || '').toLowerCase().includes(q) ||
      (s.topicId?.subjectId?.name || '').toLowerCase().includes(q)
    );
  });

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const today     = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);
    const target    = new Date(d);    target.setHours(0,0,0,0);
    if (target.getTime() === today.getTime())     return 'Today';
    if (target.getTime() === yesterday.getTime()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-2xl bg-accent-primary/20 animate-pulse" />
        <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Loading history…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-20 flex flex-col items-center gap-4 text-center">
        <AlertCircle size={40} className="text-red-500 opacity-60" />
        <p className="text-text-primary font-bold">Failed to load history</p>
        <p className="text-sm text-text-muted">{error}</p>
        <button onClick={load} className="flex items-center gap-2 px-5 h-10 rounded-2xl bg-accent-primary text-white font-bold text-sm">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const totalHours = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const avgSession  = sessions.length > 0 ? totalHours / sessions.length : 0;
  const maxSession  = sessions.length > 0 ? Math.max(...sessions.map(s => s.duration || 0)) : 0;

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
            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/10">
              <HistoryIcon size={20} strokeWidth={2.5} />
            </div>
          </h1>
          <p className="text-lg text-text-muted font-medium">Every unit of effort, precisely recorded.</p>
        </motion.div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search sessions…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-14 w-64 bg-background-primary border border-border rounded-2xl pl-12 pr-4 text-sm font-bold focus:border-accent-primary transition-all shadow-soft outline-none"
            />
          </div>
          {sessions.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="h-14 px-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 font-bold text-sm"
            >
              <HistoryIcon size={18} /> Clear All
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sessions timeline */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence>
            {filtered.length > 0 ? filtered.map((session, i) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="group relative"
              >
                <div className="flex gap-6">
                  <div className="w-24 shrink-0 pt-4 hidden sm:block">
                    <p className="text-xs font-black uppercase tracking-widest text-text-muted text-right">
                      {formatDate(session.date)}
                    </p>
                  </div>
                  <div className="relative flex flex-col items-center">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center z-10 border-4 border-background-primary shadow-soft bg-accent-primary text-white transition-transform group-hover:scale-110">
                      <RotateCcw size={20} strokeWidth={2.5} />
                    </div>
                    <div className="h-full w-[2px] bg-border/60 absolute top-12" />
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="p-6 rounded-[2.5rem] bg-background-primary border border-border shadow-soft hover:shadow-premium transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          {session.topicId?.subjectId?.name && (
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                              <Layers size={12} /> {session.topicId.subjectId.name}
                            </div>
                          )}
                          <h4 className="text-xl font-black text-text-primary tracking-tight">
                            {session.topicId?.title || 'Deleted topic'}
                          </h4>
                          {session.notes && (
                            <p className="text-xs text-text-muted italic">"{session.notes}"</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background-tertiary border border-border">
                            <Clock size={16} className="text-text-muted" />
                            <span className="text-sm font-black text-text-primary">{formatDuration(session.duration)}</span>
                          </div>
                          <button
                            onClick={() => handleDelete(session._id)}
                            disabled={deleting === session._id}
                            className="p-2 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all opacity-0 group-hover:opacity-100"
                          >
                            {deleting === session._id
                              ? <div className="h-4 w-4 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
                              : <Trash2 size={16} />
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="py-20 text-center rounded-4xl border border-dashed border-border opacity-50">
                <HistoryIcon size={40} className="mx-auto mb-4 text-text-muted" />
                <p className="font-bold text-text-muted italic">
                  {searchTerm ? `No sessions matching "${searchTerm}"` : 'No study sessions logged yet. Start studying!'}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 rounded-4xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-premium relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <Zap size={100} strokeWidth={1} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60">Log Summary</p>
            <h3 className="text-3xl font-black mb-8 leading-tight">
              {sessions.length} Sessions<br />Recorded.
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Total Hours',    value: `${(totalHours / 60).toFixed(1)}h` },
                { label: 'Longest Session', value: formatDuration(maxSession) },
                { label: 'Avg / Session',  value: formatDuration(Math.round(avgSession)) },
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-sm font-bold opacity-70">{stat.label}</span>
                  <span className="text-lg font-black tracking-tight">{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default History;