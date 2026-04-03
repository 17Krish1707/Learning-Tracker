import React, { useState } from 'react';
import { Target, Clock, CheckCircle2, MoreHorizontal } from 'lucide-react';
import TopicList from './TopicList';
import AddTopic from './AddTopic';
import './Dashboard.css';

function Dashboard({ subject, topics, onStatusChange,onEditTopic, onAddTopic, onLogTime, onDeleteTopic }) {
  const [showAddTopic, setShowAddTopic] = useState(false);

  if (!subject) {
    return (
      <div className="dashboard animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
        <div className="brand-icon-wrapper pm-app-logo-custom" style={{ margin: '0 auto 24px', width: '80px', height: '80px' }}>
          <Target size={40} color="white" />
        </div>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Welcome to StudyTrack</h2>
        <span className="priority-badge" style={{ color: 'var(--accent-secondary)', borderColor: 'var(--accent-secondary)', marginBottom: '24px', display: 'inline-block', fontSize: '1rem', padding: '6px 12px' }}>v2.0 Power Edition</span>
        
        <p style={{ maxWidth: '500px', margin: '0 auto 32px', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Your ultimate academic companion. We combine gorgeous, distraction-free aesthetics with powerful productivity metrics so you can achieve your learning goals effortlessly.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '600px', width: '100%' }}>
          <div className="card glass-panel" style={{ textAlign: 'left', padding: '20px' }}>
            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '1.1rem' }}>📚 Build Your Library</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Create organized folders and add subjects to keep your curriculum structured.</p>
          </div>
          <div className="card glass-panel" style={{ textAlign: 'left', padding: '20px' }}>
            <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '8px', fontSize: '1.1rem' }}>⏱️ Track Your Progress</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Log study hours, complete topic milestones, and maintain a blazing hot learning streak.</p>
          </div>
        </div>
        
        <p style={{ marginTop: '40px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Get started by adding a Subject from the sidebar!
        </p>
      </div>
    );
  }

  const totalTimeSpent = topics.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0);
  const completedTopics = topics.filter(t => t.status === 'Completed').length;
  const progressPercent = topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0;

  const formatHours = (minutes) => {
    return (minutes / 60).toFixed(1);
  };

  return (
    <div className="dashboard animate-fade-in">
      <div className="overview-cards">
        <div className="card glass-panel flex-1">
          <div className="card-header">
            <div>
              <h2 className="card-title" style={{ color: subject.color }}>{subject.name} Progress</h2>
              <p className="card-subtitle">Your overall journey</p>
            </div>
            <div className="progress-circle">
              <span className="progress-value">{progressPercent}%</span>
            </div>
          </div>
          
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progressPercent}%`, backgroundColor: subject.color }} 
            />
          </div>
          <div className="stats-row">
            <span>{completedTopics} / {topics.length} Completed</span>
          </div>
        </div>

        <div className="card glass-panel">
          <div className="stat-icon-bg">
            <Clock size={24} color="var(--accent-secondary)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Hours Studied</span>
            <span className="stat-value">{formatHours(totalTimeSpent)}h</span>
          </div>
        </div>
        
        <div className="card glass-panel">
          <div className="stat-icon-bg">
            <Target size={24} color="var(--success)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Remaining Topics</span>
            <span className="stat-value">{topics.length - completedTopics}</span>
          </div>
        </div>
      </div>

      <div className="topics-section">
        <div className="section-header">
          <h3>Topics</h3>
          <button className="btn-primary" onClick={() => setShowAddTopic(true)}>
            + Add Topic
          </button>
        </div>

        {showAddTopic && (
          <AddTopic onAdd={onAddTopic} onClose={() => setShowAddTopic(false)} />
        )}

        <TopicList 
          topics={topics} 
          onStatusChange={onStatusChange}
          onLogTime={onLogTime}
          onDeleteTopic={onDeleteTopic}
          onEditTopic={onEditTopic}
        />
      </div>
    </div>
  );
}

export default Dashboard;
