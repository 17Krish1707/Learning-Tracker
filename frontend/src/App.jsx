import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProfileModal from './components/ProfileModal';
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
  const [streak, setStreak] = useState(5);
  const [profile, setProfile] = useState(initialProfile);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'n1', type: 'deadline', message: 'Arrays & Strings deadline in 7 days', time: '2m ago', read: false },
    { id: 'n2', type: 'streak', message: '🔥 5-day streak! Keep it up!', time: '1h ago', read: false },
    { id: 'n3', type: 'complete', message: 'Arrays & Strings marked as Completed', time: '3h ago', read: true },
  ]);
  const { user, loading } = useAuth();

  const activeTopics = topics.filter(t => t.subjectId === activeSubjectId);
  const activeSubject = subjects.find(s => s.id === activeSubjectId);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile.theme);
  }, [profile.theme]);

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
    // Move subjects in this folder to uncategorized
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
      <div className="app-container">
        <Header streak={0} profile={{ avatar:'🎓', name:'Guest' }} notifications={[]} onMarkAllRead={()=>{}} onOpenProfile={()=>{}} />
        <div className="landing-gate">
          <div className="gate-card glass-panel">
            <span style={{ fontSize:'3rem' }}>📖</span>
            <h1>StudyTrack</h1>
            <p>Sign in with Google to start tracking your learning journey.</p>
            <GoogleSignInButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    
    <div className="app-container">
      <Header streak={streak} profile={profile} notifications={notifications} onMarkAllRead={markAllRead} onOpenProfile={() => setShowProfile(true)} onToggleTheme={handleToggleTheme} />
      <div className="main-content">
        <Sidebar
          folders={folders}
          subjects={subjects}
          activeSubjectId={activeSubjectId}
          setActiveSubjectId={setActiveSubjectId}
          onAddFolder={handleAddFolder}
          onEditFolder={handleEditFolder}
          onDeleteFolder={handleDeleteFolder}
          onAddSubject={handleAddSubject}
          onEditSubject={handleEditSubject}
          onDeleteSubject={handleDeleteSubject}
          profile={profile}
          onOpenProfile={() => setShowProfile(true)}
        />
        <div className="content-area">
          <Dashboard
            subject={activeSubject}
            topics={activeTopics}
            onStatusChange={handleStatusChange}
            onAddTopic={handleAddTopic}
            onEditTopic={handleEditTopic}
            onLogTime={handleLogTime}
            onDeleteTopic={handleDeleteTopic}
          />
        </div>
      </div>
      {showProfile && <ProfileModal profile={profile} onSave={handleSaveProfile} onClose={() => setShowProfile(false)} />}
    </div>
  );
}

export default App;