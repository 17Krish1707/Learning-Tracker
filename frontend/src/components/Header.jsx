import React, { useState, useRef, useEffect } from 'react';
import { Bell, Flame, Moon, Sun, Layers, Search, ChevronDown, LogOut, Settings, User as UserIcon, Zap, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import GoogleSignInButton from './GoogleSignInButton';

function Header({ 
  streak, profile, notifications, onMarkAllRead, onOpenProfile, onToggleTheme,
  searchTerm, onSearchChange 
}) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const ref = useRef(null);
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const unread = notifications.filter(n => !n.read).length;
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShowNotifs(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const typeColor = { deadline: '#ef4444', streak: '#f59e0b', complete: '#10b981', time: '#6366f1', info: '#9ca3af' };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background-glass backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-full items-center justify-between px-8">
        {/* Left Side: Brand & Search */}
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary text-white shadow-lg shadow-accent-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Layers size={22} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-sky-500 animate-gradient-x bg-[length:200%_auto]">StudyTrack</span>
          </div>

          <div className="hidden lg:flex relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" size={18} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search anything..." 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-11 w-80 rounded-2xl border border-border bg-background-secondary/50 pl-12 pr-12 text-sm font-bold text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:bg-background-primary focus:ring-4 focus:ring-accent-primary/10 transition-all outline-none"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-background-tertiary rounded-lg border border-border opacity-60 group-focus-within:opacity-0 transition-opacity">
               <Command size={10} />
               <span className="text-[10px] font-black uppercase">K</span>
            </div>
          </div>
        </div>

        {/* Right Side: Navigation & Profile */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
            <Flame size={18} fill="currentColor" />
            <span className="text-sm font-black uppercase tracking-widest">{streak} Day Streak</span>
          </div>

          <div className="flex items-center gap-3">
             <button 
                onClick={onToggleTheme}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background-primary/50 hover:bg-background-tertiary text-text-secondary transition-all hover:scale-105 active:scale-95"
             >
                {profile.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             {user && (
                <div className="relative" ref={ref}>
                  <button
                    onClick={() => { setShowNotifs(v => !v); if (!showNotifs) onMarkAllRead(); }}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background-primary/50 hover:bg-background-tertiary text-text-secondary transition-all hover:scale-105 active:scale-95 relative"
                  >
                    <Bell size={20} />
                    {unread > 0 && (
                      <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-4 ring-background-primary animate-bounce" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifs && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-96 rounded-3xl border border-border bg-background-primary shadow-premium p-3 overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border mb-2">
                          <span className="text-sm font-black uppercase tracking-widest text-text-primary">Intelligence Hub</span>
                          <button className="text-[10px] font-black uppercase tracking-widest text-accent-primary hover:opacity-70" onClick={onMarkAllRead}>Clear All</button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto space-y-1">
                          {notifications.length === 0 ? (
                            <div className="py-12 text-center">
                               <div className="h-12 w-12 rounded-2xl bg-background-tertiary flex items-center justify-center mx-auto mb-3 text-text-muted">
                                  <Zap size={24} />
                               </div>
                               <p className="text-sm font-bold text-text-muted">No new alerts.</p>
                            </div>
                          ) : (
                            notifications.map(n => (
                              <div key={n.id} className={cn("flex gap-4 p-4 rounded-2xl hover:bg-background-secondary transition-all cursor-pointer group", n.read ? 'opacity-40' : 'bg-accent-primary/5 border border-accent-primary/10')}>
                                <div className="h-2.5 w-2.5 mt-1.5 rounded-full shrink-0 group-hover:scale-150 transition-transform" style={{ backgroundColor: typeColor[n.type] }} />
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-text-primary leading-snug">{n.message}</p>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{n.time}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
             )}
          </div>

          <div className="h-8 w-[1px] bg-border mx-2" />

          {loading ? (
            <div className="h-11 w-11 rounded-2xl bg-background-tertiary animate-pulse" />
          ) : user ? (
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-background-tertiary/50 border border-border hover:bg-background-secondary transition-all group"
              >
                <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center text-white font-black text-sm overflow-hidden border-2 border-white dark:border-gray-900 shadow-md transition-transform group-hover:scale-105", !user.picture?.startsWith('http') && "bg-accent-primary text-lg")}>
                  {user.picture?.startsWith('http') ? (
                    <img src={user.picture} alt="" className="h-full w-full object-cover" />
                  ) : (
                    user.picture || user.name?.[0] || 'U'
                  )}
                </div>
                <div className="text-left hidden md:block">
                   <p className="text-xs font-black text-text-primary truncate max-w-[100px] uppercase tracking-tighter">{user.name}</p>
                   <p className="text-[9px] font-bold text-text-muted truncate max-w-[100px]">Elite Member</p>
                </div>
                <ChevronDown size={14} className={cn("text-text-muted transition-transform duration-300", showUserMenu && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-64 rounded-3xl border border-border bg-background-primary shadow-premium p-2 overflow-hidden"
                  >
                    <div className="px-4 py-4 mb-2 border-b border-border bg-background-secondary/30 rounded-2xl">
                      <p className="text-sm font-black text-text-primary truncate uppercase">{user.name}</p>
                      <p className="text-[10px] text-text-muted truncate font-bold">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                       <button onClick={() => { onOpenProfile(); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-text-secondary hover:bg-accent-primary/10 hover:text-accent-primary transition-all group">
                         <UserIcon size={18} className="group-hover:scale-110 transition-transform" /> Account Settings
                       </button>
                       <button onClick={() => { onOpenProfile('Preferences'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-text-secondary hover:bg-accent-primary/10 hover:text-accent-primary transition-all group">
                         <Settings size={18} className="group-hover:scale-110 transition-transform" /> System Prefs
                       </button>
                       <div className="h-[1px] bg-border my-2 mx-2" />
                       <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group">
                         <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Terminate Session
                       </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <GoogleSignInButton />
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
