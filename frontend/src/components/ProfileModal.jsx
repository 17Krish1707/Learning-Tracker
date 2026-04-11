import React, { useState } from 'react';
import { 
  X, User, BookOpen, Settings, Info, Check, LogOut, 
  Shield, Zap, Globe, Sun, Moon, Upload 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { authAPI } from '../services/api';

const AVATAR_OPTIONS = ['🎓', '🧑‍💻', '📚', '🦊', '🐼', '🚀', '🎯', '⚡'];

const TABS = [
  { id: 'Account', icon: User, label: 'Account' },
  { id: 'Study', icon: BookOpen, label: 'Study' },
  { id: 'Preferences', icon: Settings, label: 'Preferences' },
  { id: 'About', icon: Info, label: 'About' }
];

function ProfileModal({ profile, onSave, onClose, onToggleTheme, initialTab = 'Account' }) {
  const { updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      const updates = { 
        name: form.name, 
        avatar: form.avatar,
        picture: form.picture,
        studyGoal: form.studyGoal,
        weeklyTarget: form.weeklyTarget
      };
      
      await authAPI.updateMe(updates);
      updateUser(updates); // Update local context
      onSave(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-background-primary rounded-4xl border border-border shadow-premium overflow-hidden flex flex-col md:flex-row h-full max-h-[600px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-background-secondary/50 border-r border-border p-6 flex flex-col">
          <div className="flex items-center gap-4 mb-10 min-w-0">
            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-accent-primary/20 shrink-0 overflow-hidden", !(form.picture || (form.avatar && form.avatar.startsWith('http'))) && "bg-gradient-to-tr from-accent-primary to-accent-secondary")}>
              {form.picture ? (
                <img src={form.picture} alt="" className="h-full w-full object-cover" />
              ) : form.avatar?.startsWith('http') ? (
                <img src={form.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                form.avatar
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-text-primary truncate">{form.name || 'Your Profile'}</h2>
              <p className="text-xs text-text-muted truncate">{form.email}</p>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                  activeTab === tab.id 
                    ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/25" 
                    : "text-text-muted hover:bg-background-tertiary hover:text-text-primary"
                )}
              >
                <tab.icon size={18} className={cn("shrink-0", activeTab === tab.id ? "" : "group-hover:text-accent-primary")} />
                {tab.label}
              </button>
            ))}
          </nav>

          <button className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors mt-auto">
             <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 md:p-8 flex-1 overflow-y-auto">
             <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, x: 10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -10 }}
                 transition={{ duration: 0.2 }}
                 className="space-y-8"
               >
                 {activeTab === 'Account' && (
                    <div className="space-y-6">
                      <section>
                        <header className="mb-4 flex items-center justify-between">
                          <div>
                             <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em] block mb-1">Look & Identity</label>
                             <p className="text-[10px] text-text-muted opacity-50 italic">Choose an emoji or upload an image.</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => document.getElementById('profile-upload').click()}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-primary/10 text-accent-primary text-[10px] font-black uppercase tracking-widest hover:bg-accent-primary hover:text-white transition-all border border-accent-primary/20"
                          >
                             <Upload size={12} /> Upload
                          </button>
                          <input 
                            id="profile-upload" 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={async (e) => {
                               const file = e.target.files[0];
                               if (file) {
                                 const reader = new FileReader();
                                 reader.onloadend = () => {
                                   update('picture', reader.result);
                                   update('avatar', ''); 
                                 };
                                 reader.readAsDataURL(file);
                               }
                            }}
                          />
                        </header>
                        
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-6">
                          {AVATAR_OPTIONS.map(a => (
                            <button
                              key={a}
                              onClick={() => {
                                update('avatar', a);
                                update('picture', ''); 
                              }}
                              className={cn(
                                "h-10 w-10 flex items-center justify-center text-xl rounded-xl border-2 transition-all hover:scale-110 active:scale-95",
                                form.avatar === a && !form.picture
                                  ? "border-accent-primary bg-accent-primary/5 shadow-soft" 
                                  : "border-transparent bg-background-tertiary"
                              )}
                            >{a}</button>
                          ))}
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block pl-1">Image URL (Optional)</label>
                           <input 
                             className="w-full h-12 px-4 bg-background-secondary border border-border rounded-xl text-sm font-bold outline-none focus:border-accent-primary transition-all placeholder:font-normal placeholder:opacity-50" 
                             value={form.picture?.startsWith('data:image') ? 'Uploaded Local File' : (form.picture || '')} 
                             onChange={e => {
                               update('picture', e.target.value);
                               if(e.target.value) update('avatar', ''); 
                             }} 
                             placeholder="https://..." 
                             disabled={form.picture?.startsWith('data:image')}
                           />
                           {form.picture?.startsWith('data:image') && (
                             <button 
                               type="button" 
                               onClick={() => update('picture', '')}
                               className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1 hover:underline"
                             >Remove Uploaded Image</button>
                           )}
                        </div>
                      </section>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block pl-1">Full Name</label>
                          <input 
                            className="w-full h-12 px-4 bg-background-secondary border border-border rounded-xl text-sm font-bold outline-none focus:border-accent-primary transition-colors" 
                            value={form.name} 
                            onChange={e => update('name', e.target.value)} 
                            placeholder="Your name" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block pl-1">Email</label>
                          <input 
                            className="w-full h-12 px-4 bg-background-secondary border border-border rounded-xl text-sm font-bold opacity-60 cursor-not-allowed" 
                            value={form.email} 
                            disabled
                            type="email" 
                          />
                        </div>
                      </div>
                    </div>
                 )}

                 {activeTab === 'Study' && (
                   <div className="space-y-8">
                     <div className="space-y-4 pl-1">
                       <div className="flex justify-between items-end">
                         <label className="text-xs font-bold text-text-muted uppercase tracking-widest block">Daily Deep Work Goal</label>
                         <span className="text-sm font-bold text-accent-primary">{form.studyGoal >= 60 ? `${(form.studyGoal/60).toFixed(1)}h` : `${form.studyGoal}m`}</span>
                       </div>
                       <input 
                         type="range" min={15} max={480} step={15} value={form.studyGoal}
                         onChange={e => update('studyGoal', Number(e.target.value))} 
                         className="w-full accent-accent-primary cursor-pointer" 
                       />
                     </div>

                     <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: 'Streak', value: '5 days', icon: '🔥', color: 'orange' },
                          { label: 'Studied', value: '2.8h', icon: '⏱', color: 'indigo' },
                          { label: 'Milestones', value: '1', icon: '✅', color: 'emerald' },
                        ].map((stat, i) => (
                          <div key={i} className="p-4 rounded-2xl bg-background-secondary border border-border text-center">
                            <span className="text-2xl mb-1 block">{stat.icon}</span>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">{stat.label}</p>
                            <p className="text-sm font-bold text-text-primary">{stat.value}</p>
                          </div>
                        ))}
                     </div>
                   </div>
                 )}

                 {activeTab === 'Preferences' && (
                   <div className="space-y-6">
                     <section>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 block">Theme Preference</label>
                        <div className="grid grid-cols-2 gap-3">
                           <button
                             onClick={() => { if (form.theme !== 'dark') onToggleTheme(); update('theme', 'dark'); }}
                             className={cn(
                               "flex items-center justify-center gap-2 h-12 rounded-xl border text-sm font-bold transition-all",
                               form.theme === 'dark' 
                                 ? "bg-accent-primary text-white border-accent-primary shadow-md" 
                                 : "bg-background-tertiary text-text-secondary border-transparent hover:border-border"
                             )}
                           >
                             🌙 Night
                           </button>
                           <button
                             onClick={() => { if (form.theme !== 'light') onToggleTheme(); update('theme', 'light'); }}
                             className={cn(
                               "flex items-center justify-center gap-2 h-12 rounded-xl border text-sm font-bold transition-all",
                               form.theme === 'light' 
                                 ? "bg-accent-primary text-white border-accent-primary shadow-md" 
                                 : "bg-background-tertiary text-text-secondary border-transparent hover:border-border"
                             )}
                           >
                             ☀️ Day
                           </button>
                        </div>
                     </section>

                     <div className="space-y-1">
                        {[
                          { id: 'notifications', title: 'Smart Alerts', desc: 'Deadlines & streak reminders', icon: Shield },
                          { id: 'soundEffects', title: 'Haptic Feedback', desc: 'Subtle sound cues on actions', icon: Zap },
                        ].map((pref) => (
                          <div key={pref.id} className="flex items-center justify-between p-3 hover:bg-background-secondary rounded-xl transition-colors">
                            <div className="flex items-center gap-3">
                               <div className="h-10 w-10 rounded-lg bg-background-tertiary flex items-center justify-center text-accent-primary">
                                  <pref.icon size={20} />
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-text-primary">{pref.title}</p>
                                  <p className="text-xs text-text-muted">{pref.desc}</p>
                               </div>
                            </div>
                            <button 
                              className={cn(
                                "relative w-11 h-6 rounded-full transition-colors outline-none",
                                form[pref.id] ? "bg-accent-primary" : "bg-border-color"
                              )}
                              onClick={() => update(pref.id, !form[pref.id])}
                            >
                              <div className={cn(
                                "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm",
                                form[pref.id] && "translate-x-5"
                              )} />
                            </button>
                          </div>
                        ))}
                     </div>
                   </div>
                 )}

                 {activeTab === 'About' && (
                   <div className="text-center py-4">
                      <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-accent-primary to-accent-secondary text-white flex items-center justify-center text-3xl shadow-xl mx-auto mb-6">
                        📖
                      </div>
                      <h3 className="text-2xl font-black text-text-primary mb-2">StudyTrack.</h3>
                      <p className="text-sm text-text-muted max-w-sm mx-auto mb-8">Professional learning commander for elite students and knowledge workers.</p>
                      
                      <div className="flex justify-center gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-background-tertiary rounded-xl text-xs font-bold hover:bg-border-color transition-colors"><Globe size={14} /> Website</button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-background-tertiary rounded-xl text-xs font-bold hover:bg-border-color transition-colors">⭐️ Support</button>
                      </div>
                      <p className="text-[10px] text-text-muted mt-10 uppercase font-black tracking-widest">Built for Excellence • v3.0</p>
                   </div>
                 )}
               </motion.div>
             </AnimatePresence>
          </div>

          <div className="p-6 border-t border-border flex items-center justify-end gap-3 bg-background-secondary/30">
            <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-text-muted hover:text-text-primary transition-colors" onClick={onClose}>
              Discard
            </button>
            <button 
              onClick={handleSave}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all",
                saved ? "bg-success" : "bg-accent-primary shadow-lg shadow-accent-primary/25 hover:opacity-90 active:scale-95"
              )}
            >
              {saved ? <Check size={18} /> : 'Save Changes'}
            </button>
          </div>
        </div>

        <button className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary transition-colors" onClick={onClose}>
          <X size={20} />
        </button>
      </motion.div>
    </div>
  );
}

export default ProfileModal;
