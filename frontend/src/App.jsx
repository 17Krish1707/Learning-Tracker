import React, { useState, useEffect } from 'react';
import { Layers, Shield, Zap, Globe } from 'lucide-react';
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
      <div className="min-h-screen bg-background-primary flex flex-col">
        <Header
          streak={0}
          profile={{ theme: profile.theme, avatar: '🎓', name: 'Guest' }}
          notifications={[]}
          onMarkAllRead={() => {}}
          onOpenProfile={() => {}}
          onToggleTheme={handleToggleTheme}
        />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-lg animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-accent-primary to-accent-secondary text-white shadow-2xl shadow-accent-primary/20 mb-6 mx-auto">
                <Layers size={40} />
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-text-primary mb-4">StudyTrack.</h1>
              <p className="text-lg text-text-secondary">Elevate your learning with professional tracking and insights.</p>
            </div>

            <div className="bg-background-primary rounded-[32px] border border-border shadow-premium p-10 text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary">Ready to begin?</h2>
                <p className="text-sm text-text-muted leading-relaxed">
                  Your subjects, topics, and study sessions are saved securely in the cloud.
                </p>
              </div>
              <GoogleSignInButton />
              <div className="pt-6 border-t border-border/50 flex items-center justify-center gap-8 opacity-60">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted">
                  <Shield size={14} /> Secure
                </div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted">
                  <Zap size={14} /> Fast
                </div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted">
                  <Globe size={14} /> Cloud
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background-primary overflow-hidden">
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

      <div className="flex flex-1 overflow-hidden">
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
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto bg-background-secondary/30 p-6 lg:p-10">
          {dataLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-accent-primary/20 animate-pulse" />
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Syncing…</p>
              </div>
            </div>
          )}

          {!dataLoading && (
            <>
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
            </>
          )}
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