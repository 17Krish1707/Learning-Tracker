import React, { useState } from 'react';
import { Layers, Shield, Zap, Globe } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProfileModal from './components/ProfileModal';
import Statistics from './components/Statistics';
import History from './components/History';
import { useAuth } from './context/AuthContext';
import GoogleSignInButton from './components/GoogleSignInButton';

const initialFolders = [
  { id: 'f1', name: 'Academics', emoji: '🎓', color: '#7c6ff7' },
  { id: 'f2', name: 'Coding', emoji: '💻', color: '#10b981' },
];

const initialSubjects = [
  { id: 'sub1', name: 'DSA', color: '#ff5c5c', iconName: 'Code2', folderId: 'f2' },
  { id: 'sub2', name: 'Java', color: '#5c5cff', iconName: 'Coffee', folderId: 'f2' },
  { id: 'sub3', name: 'DBMS', color: '#10b981', iconName: 'Database', folderId: 'f1' },
  { id: 'sub4', name: 'OS', color: '#f59e0b', iconName: 'Cpu', folderId: 'f1' },
];

const initialTopics = [
  { id: 't1', subjectId: 'sub1', title: 'Arrays & Strings', status: 'Completed', priority: 'High', deadline: '2026-04-10', notes: 'Important base topic.', timeSpent: 120 },
  { id: 't2', subjectId: 'sub1', title: 'Linked Lists', status: 'In Progress', priority: 'High', deadline: '2026-04-15', notes: 'Understand tortoise and hare.', timeSpent: 45 },
  { id: 't3', subjectId: 'sub2', title: 'OOP Concepts', status: 'Not Started', priority: 'Medium', deadline: '2026-04-20', notes: '', timeSpent: 0 },
];

const initialProfile = {
  name: 'Student', email: 'student@email.com', avatar: '🎓', theme: 'dark',
  studyGoal: 120, weeklyTarget: 5, notifications: true, soundEffects: false, language: 'English', timezone: 'Asia/Kolkata',
};

function App() {
  const [folders, setFolders] = useState(initialFolders);
  const [subjects, setSubjects] = useState(initialSubjects);
  const [topics, setTopics] = useState(initialTopics);
  const [activeSubjectId, setActiveSubjectId] = useState(initialSubjects[0].id);
  const [activeView, setActiveView] = useState('dashboard');
  const [streak, setStreak] = useState(5);
  const [profile, setProfile] = useState(initialProfile);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'n1', type: 'deadline', message: 'Arrays & Strings deadline in 7 days', time: '2m ago', read: false },
    { id: 'n2', type: 'streak', message: '🔥 5-day streak! Keep it up!', time: '1h ago', read: false },
    { id: 'n3', type: 'complete', message: 'Arrays & Strings marked as Completed', time: '3h ago', read: true },
  ]);
  const [globalSearch, setGlobalSearch] = useState('');
  const { user, loading } = useAuth();

  const activeTopics = topics
    .filter(t => t.subjectId === activeSubjectId)
    .filter(t => t.title.toLowerCase().includes(globalSearch.toLowerCase()));

  const activeSubject = subjects.find(s => s.id === activeSubjectId);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile.theme);
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.theme]);

  // Sync user state with profile state
  React.useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        avatar: user.picture || prev.avatar
      }));
    }
  }, [user]);

  const addNotification = (message, type = 'info') => {
    setNotifications(prev => [{ id: Date.now().toString(), type, message, time: 'just now', read: false }, ...prev].slice(0, 20));
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  // --- Folder handlers ---
  const handleAddFolder = (folder) => {
    const id = 'f' + Date.now();
    setFolders(prev => [...prev, { ...folder, id }]);
    addNotification(`📁 Folder "${folder.name}" created`, 'info');
  };
  const handleEditFolder = (folderId, updates) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, ...updates } : f));
  };
  const handleDeleteFolder = (folderId) => {
    setSubjects(prev => prev.map(s => s.folderId === folderId ? { ...s, folderId: null } : s));
    setFolders(prev => prev.filter(f => f.id !== folderId));
    addNotification('🗑 Folder deleted, subjects moved to Uncategorized', 'info');
  };

  // --- Subject handlers ---
  const handleAddSubject = (newSubject) => {
    const id = 'sub' + Date.now();
    setSubjects(prev => [...prev, { ...newSubject, id }]);
    addNotification(`📚 Subject "${newSubject.name}" added`, 'info');
  };
  const handleEditSubject = (subjectId, updates) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, ...updates } : s));
  };
  const handleDeleteSubject = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    setTopics(prev => prev.filter(t => t.subjectId !== subjectId));
    if (activeSubjectId === subjectId) {
      const remaining = subjects.filter(s => s.id !== subjectId);
      setActiveSubjectId(remaining[0]?.id || null);
    }
    addNotification(`🗑 Subject "${subject?.name}" deleted`, 'info');
  };

  // --- Topic handlers ---
  const handleStatusChange = (topicId, newStatus) => {
    const topic = topics.find(t => t.id === topicId);
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, status: newStatus } : t));
    if (newStatus === 'Completed') addNotification(`✅ "${topic.title}" marked as Completed`, 'complete');
  };
  const handleAddTopic = (newTopic) => {
    setTopics(prev => [...prev, { ...newTopic, id: Date.now().toString(), timeSpent: 0, status: 'Not Started', subjectId: activeSubjectId }]);
    addNotification(`📌 New topic "${newTopic.title}" added`, 'info');
  };
  const handleEditTopic = (topicId, updates) => {
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, ...updates } : t));
  };
  const handleLogTime = (topicId, additionalTime) => {
    const topic = topics.find(t => t.id === topicId);
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, timeSpent: (t.timeSpent || 0) + additionalTime } : t));
    setStreak(prev => prev + 1);
    addNotification(`⏱ Logged ${additionalTime}m on "${topic.title}"`, 'time');
  };
  const handleDeleteTopic = (topicId) => {
    const topic = topics.find(t => t.id === topicId);
    setTopics(prev => prev.filter(t => t.id !== topicId));
    addNotification(`🗑 "${topic.title}" deleted`, 'info');
  };

  const handleSaveProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    addNotification('✨ Profile updated successfully', 'info');
  };

  const handleToggleTheme = () => {
    const newTheme = profile.theme === 'dark' ? 'light' : 'dark';
    setProfile(prev => ({ ...prev, theme: newTheme }));
  };

  if (loading) return <div className="app-loading">Loading…</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-background-primary flex flex-col">
        <Header streak={0} profile={{ theme: profile.theme, avatar:'🎓', name:'Guest' }} notifications={[]} onMarkAllRead={()=>{}} onOpenProfile={()=>{}} onToggleTheme={handleToggleTheme} />
        <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-background-primary to-background-secondary">
          <div className="w-full max-w-lg animate-fade-in">
            <div className="text-center mb-12">
               <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-accent-primary to-accent-secondary text-white shadow-2xl shadow-accent-primary/20 mb-6 mx-auto group hover:scale-110 transition-transform cursor-default">
                  <Layers size={40} />
               </div>
               <h1 className="text-5xl font-extrabold tracking-tight text-text-primary mb-4">StudyTrack.</h1>
               <p className="text-lg text-text-secondary">Elevate your learning experience with professional tracking and insights.</p>
            </div>
            
            <div className="bg-background-primary rounded-[32px] border border-border-color shadow-premium p-10 text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary">Ready to begin?</h2>
                <p className="text-sm text-text-muted leading-relaxed">Join thousands of students who are achieving their goals with our state-of-the-art tools.</p>
              </div>

              <GoogleSignInButton />

              <div className="pt-6 border-t border-border-color/50 flex items-center justify-center gap-8 opacity-60">
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
        onOpenProfile={(tab = 'Account') => { setShowProfile(tab); }} 
        onToggleTheme={handleToggleTheme} 
        searchTerm={globalSearch}
        onSearchChange={setGlobalSearch}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          folders={folders}
          subjects={subjects}
          activeSubjectId={activeSubjectId}
          setActiveSubjectId={(id) => { setActiveSubjectId(id); setActiveView(id === null ? 'dashboard' : 'subject'); }}
          activeView={activeView}
          setActiveView={setActiveView}
          onAddFolder={handleAddFolder}
          onEditFolder={handleEditFolder}
          onDeleteFolder={handleDeleteFolder}
          onAddSubject={handleAddSubject}
          onEditSubject={handleEditSubject}
          onDeleteSubject={handleDeleteSubject}
          profile={profile}
        />
        <main className="flex-1 overflow-y-auto bg-background-secondary/30 p-6 lg:p-10">
          {activeView === 'stats' ? (
            <Statistics />
          ) : activeView === 'history' ? (
            <History />
          ) : (
            <Dashboard
              subject={activeSubject}
              topics={activeTopics}
              onStatusChange={handleStatusChange}
              onAddTopic={handleAddTopic}
              onEditTopic={handleEditTopic}
              onLogTime={handleLogTime}
              onDeleteTopic={handleDeleteTopic}
            />
          )}
        </main>
      </div>
      {showProfile && <ProfileModal profile={profile} onSave={handleSaveProfile} onClose={() => setShowProfile(false)} onToggleTheme={handleToggleTheme} initialTab={typeof showProfile === 'string' ? showProfile : 'Account'} />}
    </div>
  );
}

export default App;