import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const ICON_OPTIONS = ['Code2', 'Coffee', 'Database', 'Cpu', 'Book', 'Globe', 'Layers', 'Terminal', 'Zap', 'Star'];
const COLOR_OPTIONS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#f97316'];
const FOLDER_EMOJIS = ['📁', '🎓', '💻', '🔬', '🎨', '📊', '🏋️', '🌍', '🎵', '⚙️'];

function Sidebar({ 
  folders, subjects, activeSubjectId, setActiveSubjectId,
  activeView, setActiveView,
  onAddFolder, onEditFolder, onDeleteFolder,
  onAddSubject, onEditSubject, onDeleteSubject,
  profile,
  isOpen, onClose
}) {
  const [collapsedFolders, setCollapsedFolders] = useState({});
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({});

  const toggleFolder = (id) => setCollapsedFolders(prev => ({ ...prev, [id]: !prev[id] }));

  const subjectsByFolder = (folderId) => subjects.filter(s => s.folderId === folderId);
  const uncategorized = subjects.filter(s => !s.folderId || !folders.find(f => f.id === s.folderId));

  const handleOpenModal = (type, existingData = null) => {
    setModal({ type, existingData });
    setFormData(existingData || (type === 'addFolder' ? { name: '', emoji: '📁', color: '#6366f1' } : { name: '', folderId: '', iconName: 'Book', color: '#6366f1' }));
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (modal.type === 'addFolder') onAddFolder(formData);
    else if (modal.type === 'addSubject') onAddSubject(formData);
    setModal(null);
  };

  const NavItem = ({ icon: Icon, label, active, onClick, badge, color }) => (
    <button 
      onClick={onClick}
      className={cn(
        "group flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all",
        active 
          ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20' 
          : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
          active ? 'bg-white/20' : 'bg-background-secondary border border-border group-hover:border-accent-primary/30'
        )} style={!active && color ? { color: color } : {}}>
          <Icon size={16} />
        </div>
        <span className="truncate max-w-[140px]">{label}</span>
      </div>
      {badge !== undefined && (
        <span className={cn(
          "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
          active ? 'bg-white/30 text-white' : 'bg-background-tertiary text-text-muted'
        )}>
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] w-72 bg-background-primary border-r border-border flex flex-col transition-transform duration-300 transform lg:translate-x-0 lg:static lg:flex lg:h-full",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 space-y-8 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between lg:hidden mb-6">
             <span className="text-sm font-black uppercase tracking-widest text-accent-primary">Nav. Menu</span>
             <button onClick={onClose} className="p-2 rounded-xl bg-background-tertiary text-text-muted"><Icons.X size={20} /></button>
          </div>
          
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-4 opacity-50">Command Center</div>
            <NavItem 
              icon={Icons.LayoutDashboard} 
              label="Overview" 
              active={activeView === 'dashboard'} 
              onClick={() => { setActiveSubjectId(null); setActiveView('dashboard'); }} 
            />
            <NavItem 
              icon={Icons.BarChart3} 
              label="Statistics" 
              active={activeView === 'stats'}
              onClick={() => setActiveView('stats')}
            />
            <NavItem 
              icon={Icons.Clock} 
              label="History" 
              active={activeView === 'history'}
              onClick={() => setActiveView('history')}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted opacity-50">Curriculum</h3>
              <div className="flex gap-1">
                <button onClick={() => handleOpenModal('addFolder')} className="p-1 rounded-lg text-text-muted hover:bg-background-tertiary hover:text-accent-primary transition-colors">
                  <Icons.FolderPlus size={14} />
                </button>
                <button onClick={() => handleOpenModal('addSubject')} className="p-1 rounded-lg text-text-muted hover:bg-background-tertiary hover:text-accent-primary transition-colors">
                  <Icons.Plus size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              {folders.map(folder => {
                const folderSubjects = subjectsByFolder(folder.id);
                const isCollapsed = collapsedFolders[folder.id];
                return (
                  <div key={folder.id} className="space-y-1">
                    <button 
                      onClick={() => toggleFolder(folder.id)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-text-secondary hover:bg-background-tertiary transition-all group"
                    >
                      <Icons.ChevronDown size={14} className={cn("transition-transform duration-200 opacity-40 group-hover:opacity-100", isCollapsed && "-rotate-90")} />
                      <span className="text-base leading-none">{folder.emoji}</span>
                      <span className="flex-1 text-left truncate">{folder.name}</span>
                      <span className="text-[10px] font-black opacity-30 group-hover:opacity-100">{folderSubjects.length}</span>
                    </button>
                    {!isCollapsed && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="pl-4 space-y-1 border-l-2 border-border/40 ml-4">
                        {folderSubjects.map(subject => (
                          <NavItem 
                            key={subject.id}
                            icon={Icons[subject.iconName] || Icons.Book}
                            label={subject.name}
                            active={activeSubjectId === subject.id}
                            onClick={() => setActiveSubjectId(subject.id)}
                            color={subject.color}
                          />
                        ))}
                      </motion.div>
                    )}
                  </div>
                );
              })}

              {uncategorized.length > 0 && (
                <div className="pt-4 space-y-1">
                  <div className="px-3 py-2 text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">Loose Subjects</div>
                  {uncategorized.map(subject => (
                    <NavItem 
                      key={subject.id}
                      icon={Icons[subject.iconName] || Icons.Book}
                      label={subject.name}
                      active={activeSubjectId === subject.id}
                      onClick={() => setActiveSubjectId(subject.id)}
                      color={subject.color}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-3xl bg-gradient-to-br from-accent-primary/10 via-accent-secondary/5 to-transparent p-5 border border-accent-primary/10 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 h-20 w-20 bg-accent-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            <p className="text-[10px] font-black text-accent-primary uppercase tracking-widest mb-3">Weekly Target</p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-black text-text-primary tracking-tighter">85<span className="text-lg opacity-40">%</span></span>
              <span className="text-[11px] text-text-secondary font-bold mb-1 opacity-60">17/20h</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-background-secondary border border-border/50 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full" 
              />
            </div>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-4xl bg-background-primary shadow-premium border border-border overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
               <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">
                      {modal.type === 'addFolder' ? 'Create Folder' : 'New Subject'}
                    </h2>
                    <button onClick={() => setModal(null)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-background-secondary border border-border text-text-muted hover:text-text-primary transition-all">
                      <Icons.X size={18} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleModalSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Name</label>
                      <input 
                        className="w-full h-12 px-4 bg-background-secondary border border-border rounded-xl text-sm font-bold outline-none focus:border-accent-primary transition-all placeholder:font-normal" 
                        placeholder={modal.type === 'addFolder' ? "e.g. University" : "e.g. Physics"}
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        autoFocus
                        required
                      />
                    </div>

                    {modal.type === 'addFolder' ? (
                       <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Symbol</label>
                        <div className="grid grid-cols-5 gap-2">
                           {FOLDER_EMOJIS.map(emoji => (
                             <button
                               key={emoji}
                               type="button"
                               onClick={() => setFormData({ ...formData, emoji })}
                               className={cn(
                                 "h-10 w-10 flex items-center justify-center text-xl rounded-xl border transition-all",
                                 formData.emoji === emoji ? "bg-accent-primary text-white border-accent-primary" : "bg-background-secondary border-border"
                               )}
                             >{emoji}</button>
                           ))}
                        </div>
                       </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Location</label>
                          <select 
                            className="w-full h-12 px-4 bg-background-secondary border border-border rounded-xl text-sm font-bold appearance-none outline-none focus:border-accent-primary"
                            value={formData.folderId}
                            onChange={e => setFormData({ ...formData, folderId: e.target.value })}
                          >
                            <option value="">Uncategorized</option>
                            {folders.map(f => <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Visual Icon</label>
                          <div className="grid grid-cols-5 gap-2">
                            {ICON_OPTIONS.map(name => {
                              const IconComp = Icons[name];
                              return (
                                <button
                                  key={name}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, iconName: name })}
                                  className={cn(
                                    "h-10 w-10 flex items-center justify-center rounded-xl border transition-all",
                                    formData.iconName === name ? "bg-accent-primary text-white border-accent-primary" : "bg-background-secondary border-border text-text-muted"
                                  )}
                                ><IconComp size={18} /></button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="pt-4 flex gap-3">
                      <button type="button" onClick={() => setModal(null)} className="flex-1 h-12 rounded-xl text-sm font-bold text-text-muted hover:bg-background-tertiary transition-all">Cancel</button>
                      <button type="submit" className="flex-1 h-12 rounded-xl bg-accent-primary text-white font-bold shadow-lg shadow-accent-primary/25 hover:opacity-90 active:scale-95 transition-all">Confirm</button>
                    </div>
                  </form>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
