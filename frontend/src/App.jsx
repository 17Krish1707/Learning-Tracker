import React, { useState, useEffect } from 'react';
import { Layers, Shield, Zap, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProfileModal from './components/ProfileModal';
import Statistics from './components/Statistics';
import History from './components/History';
import { useAuth } from './context/AuthContext';
import { useData } from './hooks/useData';
import GoogleSignInButton from './components/GoogleSignInButton';

const defaultProfile = {
  name: '', email: '', avatar: '🎓', theme: 'dark',
  studyGoal: 120, weeklyTarget: 5, notifications: true,
  soundEffects: false, language: 'English', timezone: 'Asia/Kolkata',
};

function App() {
  const { user, loading: authLoading } = useAuth();

  const {
    folders, subjects, topics, streak, loading: dataLoading,
    loadTopics,
    addFolder, editFolder, deleteFolder,
    addSubject, editSubject, deleteSubject,
    addTopic, editTopic, deleteTopic, logTime,
  } = useData(user);

  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [activeView, setActiveView]           = useState('dashboard');
  const [profile, setProfile]                 = useState(defaultProfile);
  const [showProfile, setShowProfile]         = useState(false);
  const [isSidebarOpen, setIsSidebarOpen]     = useState(false);
  const [globalSearch, setGlobalSearch]       = useState('');
  const [notifications, setNotifications]     = useState([]);

  // ── Sync profile with user data from auth ──────────────────────────────
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name:        user.name        || prev.name,
        email:       user.email       || prev.email,
        avatar:      user.picture     || user.avatar || prev.avatar,
        studyGoal:   user.studyGoal   ?? prev.studyGoal,
        weeklyTarget:user.weeklyTarget ?? prev.weeklyTarget,
      }));
    }
  }, [user]);

  // ── Apply theme ────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile.theme);
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.theme]);

  // ── When a subject becomes active, lazy-load its topics ────────────────
  useEffect(() => {
    if (activeSubjectId) loadTopics(activeSubjectId);
  }, [activeSubjectId, loadTopics]);

  const addNotification = (message, type = 'info') => {
    setNotifications(prev =>
      [{ id: Date.now().toString(), type, message, time: 'just now', read: false }, ...prev].slice(0, 20)
    );
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearNotifications = () => setNotifications([]);
  const deleteNotification = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  // ─── Folder handlers ───────────────────────────────────────────────────
  const handleAddFolder = async (data) => {
    try {
      await addFolder(data);
      addNotification(`📁 Folder "${data.name}" created`, 'info');
    } catch (e) { addNotification(e.message, 'danger'); }
  };

  const handleEditFolder = async (id, data) => {
    try { await editFolder(id, data); }
    catch (e) { addNotification(e.message, 'danger'); }
  };

  const handleDeleteFolder = async (id) => {
    try {
      await deleteFolder(id);
      addNotification('🗑 Folder deleted, subjects moved to Uncategorized', 'info');
    } catch (e) { addNotification(e.message, 'danger'); }
  };

  // ─── Subject handlers ──────────────────────────────────────────────────
  const handleAddSubject = async (data) => {
    try {
      const s = await addSubject(data);
      addNotification(`📚 Subject "${data.name}" added`, 'info');
      setActiveSubjectId(s._id || s.id);
      setActiveView('subject');
    } catch (e) { addNotification(e.message, 'danger'); }
  };

  const handleEditSubject = async (id, data) => {
    try { await editSubject(id, data); }
    catch (e) { addNotification(e.message, 'danger'); }
  };

  const handleDeleteSubject = async (id) => {
    try {
      const s = subjects.find(s => s.id === id);
      await deleteSubject(id);
      if (activeSubjectId === id) {
        const remaining = subjects.filter(s => s.id !== id);
        setActiveSubjectId(remaining[0]?.id || null);
        setActiveView('dashboard');
      }
      addNotification(`🗑 Subject "${s?.name}" deleted`, 'info');
    } catch (e) { addNotification(e.message, 'danger'); }
  };

  // ─── Topic handlers ────────────────────────────────────────────────────
  const handleAddTopic = async (data) => {
    try {
      await addTopic(activeSubjectId, data);
      addNotification(`📌 Topic "${data.title}" added`, 'info');
    } catch (e) { addNotification(e.message, 'danger'); }
  };

  const handleEditTopic = async (topicId, updates) => {
    try { await editTopic(topicId, activeSubjectId, updates); }
    catch (e) { addNotification(e.message, 'danger'); }
  };

  const handleStatusChange = async (topicId, newStatus) => {
    const activeTopics = topics[activeSubjectId] || [];
    const topic = activeTopics.find(t => t.id === topicId);
    try {
      await editTopic(topicId, activeSubjectId, { status: newStatus });
      if (newStatus === 'Completed')
        addNotification(`✅ "${topic?.title}" marked as Completed`, 'complete');
    } catch (e) { addNotification(e.message, 'danger'); }
  };

  const handleLogTime = async (topicId, minutes, date) => {
    const activeTopics = topics[activeSubjectId] || [];
    const topic = activeTopics.find(t => t.id === topicId);
    try {
      await logTime(topicId, activeSubjectId, minutes, date);
      addNotification(`⏱ Logged ${minutes}m on "${topic?.title}"`, 'time');
    } catch (e) { addNotification(e.message, 'danger'); }
  };

  const handleDeleteTopic = async (topicId) => {
    const activeTopics = topics[activeSubjectId] || [];
    const topic = activeTopics.find(t => t.id === topicId);
    try {
      await deleteTopic(topicId, activeSubjectId);
      addNotification(`🗑 "${topic?.title}" deleted`, 'info');
    } catch (e) { addNotification(e.message, 'danger'); }
  };

  const handleSaveProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    addNotification('✨ Profile updated', 'info');
  };

  const handleToggleTheme = () => {
    setProfile(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  // ── Derived data ───────────────────────────────────────────────────────
  const activeSubject     = subjects.find(s => s.id === activeSubjectId) || null;
  const rawActiveTopics   = (topics[activeSubjectId] || []);
  const activeTopics      = rawActiveTopics.filter(t =>
    t.title.toLowerCase().includes(globalSearch.toLowerCase())
  );
  const allTopics         = Object.values(topics).flat();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary animate-pulse" />
          <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col h-screen bg-background-primary overflow-hidden selection:bg-accent-primary selection:text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.1),transparent_50%)]" />
        <Header
          streak={0}
          profile={{ theme: profile.theme, avatar: '🎓', name: 'Guest' }}
          notifications={[]}
          onMarkAllRead={() => {}}
          onOpenProfile={() => {}}
          onToggleTheme={handleToggleTheme}
        />
        <main className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-xl animate-fade-in">
            <div className="text-center mb-16">
              <div className="inline-flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-gradient-to-tr from-accent-primary to-accent-highlight text-white shadow-premium mb-10 mx-auto group">
                <Layers size={48} className="group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h1 className="text-6xl font-black tracking-tighter text-text-primary mb-6 leading-[0.9]">Intelligence<br/>Tracking.</h1>
              <p className="text-xl text-text-secondary font-medium tracking-tight opacity-70 leading-relaxed max-w-sm mx-auto italic">Professional temporal management and cognitive growth analysis.</p>
            </div>

            <div className="bg-background-primary/40 backdrop-blur-3xl rounded-[3rem] border border-border/60 shadow-premium p-12 text-center space-y-12">
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight italic leading-none">Authentication Required</h2>
                <div className="h-px w-12 bg-accent-primary mx-auto opacity-40" />
                <p className="text-[13px] text-text-muted font-bold tracking-wide opacity-60 px-6 leading-relaxed">
                  Join the elite network to synchronize your academic and technical progression across the global infrastructure.
                </p>
              </div>
              
              <div className="flex justify-center transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                <GoogleSignInButton />
              </div>

              <div className="pt-10 border-t border-border/30 flex items-center justify-center gap-12 opacity-40">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">
                  <Shield size={16} className="text-accent-primary" /> Secure
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">
                  <Zap size={16} className="text-accent-primary" /> Rapid
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">
                  <Globe size={16} className="text-accent-primary" /> Neural
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background-primary overflow-hidden selection:bg-accent-primary selection:text-white font-sans tracking-tight">
      <Header
        streak={streak}
        profile={profile}
        notifications={notifications}
        onMarkAllRead={markAllRead}
        onClearNotifications={clearNotifications}
        onDeleteNotification={deleteNotification}
        onOpenProfile={(tab = 'Account') => setShowProfile(tab)}
        onToggleTheme={handleToggleTheme}
        searchTerm={globalSearch}
        onSearchChange={setGlobalSearch}
        onMenuToggle={() => setIsSidebarOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          folders={folders}
          subjects={subjects}
          activeSubjectId={activeSubjectId}
          setActiveSubjectId={(id) => {
            setActiveSubjectId(id);
            setActiveView(id ? 'subject' : 'dashboard');
            setIsSidebarOpen(false);
          }}
          activeView={activeView}
          setActiveView={(view) => { setActiveView(view); setActiveSubjectId(null); setIsSidebarOpen(false); }}
          onAddFolder={handleAddFolder}
          onEditFolder={handleEditFolder}
          onDeleteFolder={handleDeleteFolder}
          onAddSubject={handleAddSubject}
          onEditSubject={handleEditSubject}
          onDeleteSubject={handleDeleteSubject}
          profile={profile}
          topics={allTopics}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />


        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_0%_0%,rgba(124,58,237,0.03),transparent_40%)] p-6 lg:p-12 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            {dataLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-background-primary/80 backdrop-blur-3xl"
              >
                <div className="flex flex-col items-center gap-8">
                  <div className="relative h-20 w-20">
                    <div className="absolute inset-0 rounded-[2rem] bg-accent-primary/20 animate-ping" />
                    <div className="relative h-20 w-20 rounded-[2rem] bg-accent-primary flex items-center justify-center text-white shadow-premium animate-pulse">
                      <Layers size={40} />
                    </div>
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-[12px] font-black text-text-primary uppercase tracking-[0.5em] animate-pulse">Synchronizing Core</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">Initializing temporal databases</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-[1600px] mx-auto w-full"
              >
                {activeView === 'stats' ? (
                  <Statistics />
                ) : activeView === 'history' ? (
                  <History />
                ) : (
                  <Dashboard
                    subject={activeSubject}
                    topics={activeTopics}
                    allTopics={allTopics}
                    profile={profile}
                    onStatusChange={handleStatusChange}
                    onAddTopic={handleAddTopic}
                    onEditTopic={handleEditTopic}
                    onLogTime={handleLogTime}
                    onDeleteTopic={handleDeleteTopic}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {showProfile && (
        <ProfileModal
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setShowProfile(false)}
          onToggleTheme={handleToggleTheme}
          initialTab={typeof showProfile === 'string' ? showProfile : 'Account'}
        />
      )}
    </div>
  );
}

export default App;