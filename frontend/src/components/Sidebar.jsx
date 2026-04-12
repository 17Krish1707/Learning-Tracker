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
  profile, topics = [],
  isOpen, onClose
}) {
  const [collapsedFolders, setCollapsedFolders] = useState({});
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({ name: '', folderId: '', iconName: 'Book', color: '#6366f1', emoji: '📁' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Operational Target Calculation
  const totalTopics = topics.length;
  const completedTopics = topics.filter(t => t.status === 'Completed').length;
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const toggleFolder = (id) => setCollapsedFolders(prev => ({ ...prev, [id]: !prev[id] }));

  const subjectsByFolder = (folderId) => subjects.filter(s => s.folderId === folderId);
  const uncategorized = subjects.filter(s => !s.folderId || !folders.find(f => f.id === s.folderId));

  const handleOpenModal = (type, existingData = null) => {
    setModal({ type, existingData });
    setIsDropdownOpen(false);
    setFormData(existingData || (type === 'addFolder' ? { name: '', emoji: '📁', color: '#6366f1' } : { name: '', folderId: '', iconName: 'Book', color: '#6366f1' }));
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (modal.type === 'addFolder') onAddFolder(formData);
    else if (modal.type === 'addSubject') onAddSubject(formData);
    else if (modal.type === 'editSubject') onEditSubject(modal.existingData.id, formData);
    setModal(null);
  };

  const handleDragStart = (e, subjectId) => {
    e.dataTransfer.setData('subjectId', subjectId);
  };

  const handleDrop = (e, folderId) => {
    e.preventDefault();
    const subjectId = e.dataTransfer.getData('subjectId');
    if (subjectId && onEditSubject) {
      onEditSubject(subjectId, { folderId });
    }
  };

  const NavItem = ({ icon: Icon, label, active, onClick, onEdit, onDelete, badge, color, draggable, onDragStart }) => (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      className="relative group/nav"
    >
      <div className={cn(
        "group flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold transition-all mb-1",
        active
          ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/25 scale-[1.02]'
          : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
      )}>
        <button
          onClick={onClick}
          className="flex flex-1 items-center gap-3 text-left overflow-hidden"
        >
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl transition-all shadow-sm shrink-0",
            active ? 'bg-white/20' : 'bg-background-secondary border border-border group-hover:scale-110'
          )} style={color ? (active ? {
            color: 'white',
            backgroundColor: `${color}40`,
            borderColor: 'white/20'
          } : { 
            backgroundColor: `${color}25`, 
            color: color, 
            borderColor: `${color}40`,
            boxShadow: `0 4px 12px ${color}15`
          }) : {}}>
            <Icon size={15} strokeWidth={2.5} />
          </div>
          <span className="truncate tracking-tight">{label}</span>
        </button>

        <div className="flex items-center gap-1 ml-2">
          {onEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className={cn(
                "p-1.5 rounded-lg opacity-0 group-hover/nav:opacity-100 transition-all hover:bg-white/10",
                active ? "text-white/60 hover:text-white" : "text-text-muted hover:text-accent-primary hover:bg-accent-primary/5"
              )}
            >
              <Icons.Settings2 size={12} />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className={cn(
                "p-1.5 rounded-lg opacity-0 group-hover/nav:opacity-100 transition-all hover:bg-white/10",
                active ? "text-white/60 hover:text-red-300" : "text-text-muted hover:text-red-500 hover:bg-red-500/5"
              )}
            >
              <Icons.Trash2 size={12} />
            </button>
          )}
          {badge !== undefined && (
            <span className={cn(
              "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black",
              active ? 'bg-white/30 text-white' : 'bg-background-tertiary text-text-muted'
            )}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
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
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] w-80 bg-background-primary/40 backdrop-blur-3xl border-r border-border/60 flex flex-col transition-all duration-500 transform lg:translate-x-0 lg:static lg:flex lg:h-full shadow-premium",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-10 space-y-12 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between lg:hidden mb-12">
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-accent-primary opacity-60">StudyTrack</span>
            <button onClick={onClose} className="p-3 rounded-2xl bg-background-tertiary text-text-muted hover:text-text-primary transition-all shadow-soft"><Icons.X size={20} /></button>
          </div>

          <div className="space-y-4">
            <div className="px-5 text-[10px] font-black uppercase tracking-[0.4em] text-text-muted mb-6 opacity-30 italic">Navigation</div>
            <div className="space-y-2">
              <NavItem
                icon={Icons.LayoutDashboard}
                label="Dashboard"
                active={activeView === 'dashboard'}
                onClick={() => { setActiveSubjectId(null); setActiveView('dashboard'); onClose(); }}
              />
              <NavItem
                icon={Icons.BarChart3}
                label="Stats"
                active={activeView === 'stats'}
                onClick={() => { setActiveView('stats'); onClose(); }}
              />
              <NavItem
                icon={Icons.Clock}
                label="History"
                active={activeView === 'history'}
                onClick={() => { setActiveView('history'); onClose(); }}
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between px-5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted opacity-30 italic">Subjects</h3>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal('addFolder')} className="h-8 w-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-accent-primary/10 hover:text-accent-primary transition-all border border-transparent hover:border-accent-primary/20">
                  <Icons.FolderPlus size={16} />
                </button>
                <button onClick={() => handleOpenModal('addSubject')} className="h-8 w-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-accent-primary/10 hover:text-accent-primary transition-all border border-transparent hover:border-accent-primary/20">
                  <Icons.Plus size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {folders.map(folder => {
                const folderSubjects = subjectsByFolder(folder.id);
                const isCollapsed = collapsedFolders[folder.id];
                return (
                  <div key={folder.id} className="space-y-2">
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-accent-primary/5'); }}
                      onDragLeave={(e) => { e.currentTarget.classList.remove('bg-accent-primary/5'); }}
                      onDrop={(e) => { handleDrop(e, folder.id); e.currentTarget.classList.remove('bg-accent-primary/5'); }}
                      className="flex w-full items-center gap-4 rounded-[1.5rem] px-5 py-3 text-sm font-black text-text-secondary hover:bg-background-tertiary/60 transition-all group overflow-hidden border border-transparent hover:border-border/40"
                    >
                      <Icons.ChevronDown size={14} className={cn("transition-transform duration-500 text-accent-primary opacity-40 group-hover:opacity-100", isCollapsed && "-rotate-90")} />
                      <span className="text-xl leading-none group-hover:scale-110 transition-transform">{folder.emoji}</span>
                      <span className="flex-1 text-left truncate tracking-tight italic uppercase text-[11px] font-black">{folder.name}</span>
                      <span className="text-[10px] font-black opacity-30 px-2.5 py-1 rounded-xl bg-background-tertiary border border-border/40 group-hover:opacity-100 transition-opacity">{folderSubjects.length}</span>
                    </button>
                    {!isCollapsed && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="pl-6 space-y-1 border-l-2 border-border/20 ml-7 my-2">
                        {folderSubjects.map(subject => (
                          <NavItem
                            key={subject.id}
                            icon={Icons[subject.iconName] || Icons.Book}
                            label={subject.name}
                            active={activeSubjectId === subject.id}
                            onClick={() => { setActiveSubjectId(subject.id); onClose(); }}
                            onEdit={() => handleOpenModal('editSubject', subject)}
                            onDelete={() => { if(confirm(`Delete ${subject.name}?`)) onDeleteSubject(subject.id); }}
                            color={subject.color}
                            draggable
                            onDragStart={(e) => handleDragStart(e, subject.id)}
                          />
                        ))}
                      </motion.div>
                    )}
                  </div>
                );
              })}

                <div 
                  className={cn(
                    "pt-6 space-y-2 transition-all rounded-[2rem] group/uncat p-2",
                    "hover:bg-accent-primary/[0.02] border border-transparent hover:border-dashed hover:border-accent-primary/10"
                  )}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, null)}
                >
                  <div className="flex items-center justify-between px-4 py-2">
                    <div className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] opacity-30 italic">Untracked</div>
                    <Icons.ArrowDownLeft size={10} className="text-accent-primary opacity-0 group-hover/uncat:opacity-100 transition-opacity" />
                  </div>
                  {uncategorized.map(subject => (
                    <NavItem
                      key={subject.id}
                      icon={Icons[subject.iconName] || Icons.Book}
                      label={subject.name}
                      active={activeSubjectId === subject.id}
                      onClick={() => { setActiveSubjectId(subject.id); onClose(); }}
                      onEdit={() => handleOpenModal('editSubject', subject)}
                      onDelete={() => { if(confirm(`Delete ${subject.name}?`)) onDeleteSubject(subject.id); }}
                      color={subject.color}
                      draggable
                      onDragStart={(e) => handleDragStart(e, subject.id)}
                    />
                  ))}
                </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-border/40">
          <div className="rounded-[2.5rem] bg-gradient-to-br from-accent-primary/10 via-accent-secondary/5 to-transparent p-8 border border-accent-primary/10 relative overflow-hidden group shadow-soft backdrop-blur-md">
            <div className="absolute -right-8 -top-8 h-32 w-32 bg-accent-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center justify-between mb-4">
               <p className="text-[11px] font-black text-accent-primary uppercase tracking-[0.3em]">Course Progress</p>
               <Icons.Zap size={14} className="text-accent-primary animate-pulse" />
            </div>
            <div className="flex items-end justify-between mb-4">
              <span className="text-4xl font-black text-text-primary tracking-tighter">{progressPercent}<span className="text-xl opacity-30 ml-1">%</span></span>
              <span className="text-[10px] text-text-muted font-bold mb-1 italic opacity-60">Completion Rate</span>
            </div>
            <div className="h-2 w-full rounded-full bg-background-secondary/50 border border-white/5 overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="h-full bg-gradient-to-r from-accent-primary to-accent-highlight rounded-full relative"
              >
                 <div className="absolute top-0 right-0 h-full w-4 bg-white/20 blur-sm" />
              </motion.div>
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
                <div className="flex items-center justify-between mb-10">
                  <div className="flex flex-col">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-text-primary via-accent-primary to-text-secondary uppercase tracking-[-0.04em] leading-none mb-1">
                      {modal.type === 'addFolder' ? 'Create Folder' : modal.type === 'editSubject' ? 'Edit Subject' : 'New Subject'}
                    </h2>
                    <div className="h-1 w-8 bg-accent-primary rounded-full opacity-50" />
                  </div>
                  <button onClick={() => setModal(null)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-background-tertiary/60 border border-border/40 text-text-muted hover:text-text-primary transition-all hover:scale-110 active:scale-95 shadow-soft hover:border-accent-primary/20">
                    <Icons.X size={20} />
                  </button>
                </div>

                <form onSubmit={handleModalSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.25em] px-1 opacity-50 italic">Identification</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-primary opacity-40 group-focus-within:opacity-100 transition-opacity">
                        <Icons.Tag size={16} />
                      </div>
                      <input
                        className="w-full h-14 pl-12 pr-4 bg-background-tertiary border border-border/40 rounded-2xl text-base font-bold text-text-primary outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all placeholder:text-text-muted/40 placeholder:font-medium shadow-inner"
                        placeholder={modal.type === 'addFolder' ? "e.g. Computer Science" : "e.g. Advanced Physics"}
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  {modal.type === 'addFolder' ? (
                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.25em] px-1 opacity-50 italic">Iconology</label>
                      <div className="grid grid-cols-5 gap-3">
                        {FOLDER_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setFormData({ ...formData, emoji })}
                            className={cn(
                              "h-12 w-12 flex items-center justify-center text-2xl rounded-2xl border-2 transition-all",
                              formData.emoji === emoji 
                                ? "bg-accent-primary/10 border-accent-primary shadow-lg shadow-accent-primary/10 scale-110" 
                                : "bg-background-secondary border-border/40 hover:border-accent-primary/30"
                            )}
                          >{emoji}</button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.25em] px-1 opacity-50 italic">Classification & Visuals</label>
                        <div className="flex items-center gap-6">
                          <div className="flex-1 relative">
                            <button
                              type="button"
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              className="w-full h-14 pl-12 pr-10 bg-background-tertiary border border-border/40 rounded-2xl text-[13px] font-black outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all cursor-pointer uppercase tracking-tight text-text-primary shadow-inner flex items-center justify-between text-left group"
                            >
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-primary opacity-40 group-hover:opacity-100 transition-opacity">
                                <Icons.Folder size={16} />
                              </div>
                              <span className="truncate">
                                {formData.folderId 
                                  ? folders.find(f => f.id === formData.folderId)?.emoji + " " + folders.find(f => f.id === formData.folderId)?.name
                                  : "📁 Uncategorized"}
                              </span>
                              <Icons.ChevronDown size={14} className={cn("text-text-muted/40 transition-transform duration-300", isDropdownOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                              {isDropdownOpen && (
                                <>
                                  <div className="fixed inset-0 z-[60]" onClick={() => setIsDropdownOpen(false)} />
                                  <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute left-0 right-0 mt-2 bg-background-secondary border border-border/60 rounded-2xl shadow-premium overflow-hidden z-[70] backdrop-blur-3xl"
                                  >
                                    <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                                      <button
                                        type="button"
                                        onClick={() => { setFormData({ ...formData, folderId: '' }); setIsDropdownOpen(false); }}
                                        className={cn(
                                          "w-full px-4 py-3 rounded-xl text-left text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3",
                                          !formData.folderId ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:bg-background-tertiary hover:text-text-primary"
                                        )}
                                      >
                                        <div className="h-2 w-2 rounded-full bg-current opacity-40" />
                                        Uncategorized
                                      </button>
                                      {folders.map(f => (
                                        <button
                                          key={f.id}
                                          type="button"
                                          onClick={() => { setFormData({ ...formData, folderId: f.id }); setIsDropdownOpen(false); }}
                                          className={cn(
                                            "w-full px-4 py-3 rounded-xl text-left text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3",
                                            formData.folderId === f.id ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:bg-background-tertiary hover:text-text-primary"
                                          )}
                                        >
                                          <span className="text-sm">{f.emoji}</span>
                                          <span className="truncate">{f.name}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                          
                          <div className="shrink-0 flex flex-col items-center gap-2">
                            <div 
                              className="h-14 w-14 rounded-[1.25rem] flex items-center justify-center border-2 shadow-premium transition-all duration-500 animate-fade-in"
                              style={{ 
                                backgroundColor: `${formData.color}15`, 
                                color: formData.color,
                                borderColor: `${formData.color}30`,
                                boxShadow: `0 12px 24px ${formData.color}20`
                              }}
                            >
                              {(() => {
                                const PreviewIcon = Icons[formData.iconName] || Icons.Book;
                                return <PreviewIcon size={24} strokeWidth={2.5} />;
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.25em] px-1 opacity-50 italic">Choose Icon</label>
                        <div className="grid grid-cols-5 gap-3">
                        {ICON_OPTIONS.map(name => {
                            const IconComp = Icons[name];
                            return (
                              <button
                                key={name}
                                type="button"
                                onClick={() => setFormData({ ...formData, iconName: name })}
                                className={cn(
                                  "h-12 w-12 flex items-center justify-center rounded-2xl border-2 transition-all",
                                  formData.iconName === name 
                                    ? "bg-accent-primary text-white border-accent-primary shadow-xl shadow-accent-primary/20 scale-110" 
                                    : "bg-background-secondary border-border/40 text-text-muted hover:border-accent-primary/40 hover:text-text-primary"
                                )}
                              ><IconComp size={20} strokeWidth={2.5} /></button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.25em] px-1 opacity-50 italic">Choose Color</label>
                        <div className="flex flex-wrap gap-3">
                          {COLOR_OPTIONS.map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setFormData({ ...formData, color })}
                              className={cn(
                                "h-8 w-8 rounded-xl transition-all border-2 flex items-center justify-center relative",
                                formData.color === color ? "border-white scale-110 shadow-lg ring-4 ring-white/10" : "border-transparent opacity-60 hover:opacity-100 hover:scale-110"
                              )}
                              style={{ backgroundColor: color }}
                            >
                              {formData.color === color && <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />}
                            </button>
                          ))}
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
