import React, { useState, useRef, useEffect } from 'react';
import { Bell, Flame, Moon, Sun, Layers, Search, ChevronDown, LogOut, Settings, User as UserIcon, Zap, Command, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import GoogleSignInButton from './GoogleSignInButton';

function Header({ 
  streak, profile, notifications, onMarkAllRead, onClearNotifications, onDeleteNotification, onOpenProfile, onToggleTheme,
  searchTerm, onSearchChange, onMenuToggle
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
    <header className="sticky top-0 z-50 w-full bg-background-primary/40 backdrop-blur-3xl border-b border-border/60">
      <div className="mx-auto flex h-24 max-w-full items-center justify-between px-6 lg:px-12">
        {/* Left Side: Brand & Search */}
        <div className="flex items-center gap-6 lg:gap-16 flex-1">
          <button 
            onClick={onMenuToggle}
            className="lg:hidden p-3 rounded-2xl bg-background-tertiary text-text-primary hover:bg-background-secondary transition-all shadow-soft"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 group cursor-pointer shrink-0">
            <div className="flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-tr from-accent-primary to-accent-highlight text-white shadow-premium group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <Layers size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
               <span className="text-2xl lg:text-3xl font-black tracking-tighter uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-accent-primary via-fuchsia-500 to-accent-highlight animate-gradient-x bg-[length:200%_auto]">StudyTrack</span>
               <span className="text-[9px] font-black uppercase tracking-[0.5em] text-text-muted mt-1 opacity-60">Learning Manager</span>
            </div>
          </div>

          <div className="hidden lg:flex relative group max-w-md w-full ml-12">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-all group-focus-within:scale-110" size={20} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search your topics..." 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-14 w-full rounded-[1.5rem] border border-border bg-background-secondary/80 dark:bg-background-secondary/40 pl-14 pr-16 text-sm font-bold text-text-primary placeholder:text-text-muted/60 focus:border-accent-primary focus:bg-background-primary transition-all outline-none italic shadow-inner"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 bg-background-tertiary rounded-xl border border-border shadow-sm group-focus-within:opacity-0 transition-opacity">
               <Command size={10} className="text-text-muted" />
               <span className="text-[10px] font-black uppercase tracking-tighter text-text-muted">K</span>
            </div>
          </div>
        </div>

        {/* Right Side: Navigation & Profile */}
        <div className="flex items-center gap-8">
          <div className="hidden xl:flex items-center gap-3 px-6 py-3 rounded-[1.25rem] bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-soft">
            <Flame size={20} fill="currentColor" className="animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.3em]">{streak} Day Streak</span>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={onToggleTheme}
                className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] border border-border bg-background-primary/50 hover:bg-background-tertiary text-text-secondary transition-all hover:scale-110 active:scale-95 shadow-soft"
             >
                {profile.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             {user && (
                <div className="relative" ref={ref}>
                  <button
                    onClick={() => { setShowNotifs(v => !v); if (!showNotifs) onMarkAllRead(); }}
                    className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] border border-border bg-background-primary/50 hover:bg-background-tertiary text-text-secondary transition-all hover:scale-110 active:scale-95 relative shadow-soft"
                  >
                    <Bell size={20} />
                    {unread > 0 && (
                      <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-red-500 ring-4 ring-background-primary animate-ping" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifs && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="absolute right-0 mt-6 w-[28rem] rounded-[2.5rem] border border-border bg-background-primary/80 backdrop-blur-2xl shadow-premium p-4 overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 mb-3">
                          <div className="flex flex-col">
                             <span className="text-[11px] font-black uppercase tracking-[0.4em] text-text-primary">Notifications</span>
                             <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-1 italic">Updates on your activity</span>
                          </div>
                          <button className="text-[10px] font-black uppercase tracking-widest text-accent-primary hover:opacity-70 bg-accent-primary/5 px-4 py-1.5 rounded-full border border-accent-primary/10" onClick={onClearNotifications}>Clear All</button>
                        </div>
                        <div className="max-h-[450px] overflow-y-auto space-y-2 px-1">
                          {notifications.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center gap-6">
                               <div className="h-20 w-20 rounded-[2rem] bg-background-tertiary/50 border border-border flex items-center justify-center text-text-muted shadow-inner">
                                  <Zap size={32} strokeWidth={1} className="opacity-20" />
                               </div>
                               <div className="space-y-1">
                                  <p className="text-sm font-black text-text-primary uppercase tracking-widest italic">All caught up</p>
                                  <p className="text-xs font-bold text-text-muted italic opacity-60">No new notifications.</p>
                               </div>
                            </div>
                          ) : (
                            notifications.map(n => (
                              <div key={n.id} className={cn("flex items-center gap-6 p-5 rounded-[1.75rem] hover:bg-background-secondary/60 transition-all cursor-pointer group relative border border-transparent hover:border-border/60", n.read ? 'opacity-40' : 'bg-accent-primary/[0.03] border border-accent-primary/10')}>
                                <div className="h-3 w-3 rounded-full shrink-0 shadow-lg group-hover:scale-125 transition-transform" style={{ backgroundColor: typeColor[n.type] }} />
                                <div className="flex-1 space-y-2">
                                  <p className="text-sm font-bold text-text-primary leading-relaxed pr-8">{n.message}</p>
                                  <div className="flex items-center gap-2">
                                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted opacity-50 italic">{n.time}</span>
                                     <div className="h-1 w-1 rounded-full bg-border" />
                                     <span className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-30">{n.type}</span>
                                  </div>
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onDeleteNotification(n.id); }}
                                  className="absolute top-5 right-6 p-1.5 text-text-muted hover:text-danger hover:bg-danger/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <X size={16} />
                                </button>
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

          <div className="h-10 w-[1px] bg-border/60 mx-2 hidden sm:block" />

          {loading ? (
            <div className="h-14 w-14 rounded-[1.2rem] bg-background-tertiary animate-pulse" />
          ) : user ? (
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-4 p-2 pr-6 rounded-[1.4rem] bg-background-tertiary/40 border border-border/80 hover:bg-background-secondary/60 hover:border-accent-primary/40 transition-all group shadow-soft backdrop-blur-md"
              >
                <div className={cn("h-11 w-11 rounded-[0.9rem] flex items-center justify-center text-white font-black text-sm overflow-hidden border-2 border-white dark:border-gray-800 shadow-md transition-all group-hover:scale-105 group-hover:rotate-3", !user.picture?.startsWith('http') && "bg-accent-primary text-xl")}>
                  {user.picture?.startsWith('http') ? (
                    <img src={user.picture} alt="" className="h-full w-full object-cover" />
                  ) : (
                    user.picture || user.name?.[0] || 'U'
                  )}
                </div>
                <div className="text-left hidden lg:block">
                   <p className="text-xs font-black text-text-primary truncate max-w-[120px] uppercase tracking-tighter leading-none mb-1">{user.name}</p>
                   <p className="text-[9px] font-black text-accent-primary uppercase tracking-[0.2em] opacity-60 italic">Core Authenticated</p>
                </div>
                <ChevronDown size={14} className={cn("text-text-muted transition-transform duration-500 hidden sm:block", showUserMenu && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="absolute right-0 mt-6 w-80 rounded-[3rem] border border-border bg-background-primary shadow-premium p-3 overflow-hidden backdrop-blur-3xl"
                  >
                    <div className="px-6 py-6 mb-3 border-b border-border bg-background-secondary/40 rounded-[2rem] flex items-center gap-4">
                       <div className="h-12 w-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                          <UserIcon size={24} />
                       </div>
                       <div className="min-w-0">
                         <p className="text-sm font-black text-text-primary truncate uppercase tracking-tight">{user.name}</p>
                         <p className="text-[10px] text-text-muted truncate font-bold italic opacity-60">{user.email}</p>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <button onClick={() => { onOpenProfile(); setShowUserMenu(false); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-[1.75rem] text-sm font-black uppercase tracking-widest text-text-secondary hover:bg-accent-primary/10 hover:text-accent-primary transition-all group">
                         <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" /> 
                         <span className="text-[11px]">System Arch</span>
                       </button>
                       <button onClick={() => { onOpenProfile('Preferences'); setShowUserMenu(false); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-[1.75rem] text-sm font-black uppercase tracking-widest text-text-secondary hover:bg-accent-primary/10 hover:text-accent-primary transition-all group">
                         <Layers size={18} className="group-hover:scale-110 transition-transform" /> 
                         <span className="text-[11px]">Modules Config</span>
                       </button>
                       <div className="h-[1px] bg-border/60 my-3 mx-4" />
                       <button onClick={logout} className="w-full flex items-center gap-4 px-6 py-4 rounded-[1.75rem] text-sm font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group">
                         <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                         <span className="text-[11px]">Terminate Access</span>
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
