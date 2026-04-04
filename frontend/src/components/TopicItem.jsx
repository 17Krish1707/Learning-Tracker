import React, { useState } from 'react';
import { Calendar, Clock, Trash2, CheckCircle2, Circle, AlertCircle, Pencil, FileText, Check, X } from 'lucide-react';
import StudyLogger from './StudyLogger';
import './TopicItem.css';

function TopicItem({ topic, index, onStatusChange, onLogTime, onDeleteTopic, onEditTopic }) {
  const [showLogger, setShowLogger] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(topic.notes || '');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'var(--danger)';
      case 'Medium': return 'var(--warning)';
      case 'Low': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 size={24} className="status-icon completed" />;
      case 'In Progress':
        return <Clock size={24} className="status-icon in-progress" />;
      default:
        return <Circle size={24} className="status-icon not-started" />;
    }
  };

  const toggleStatus = () => {
    const nextStatus = {
      'Not Started': 'In Progress',
      'In Progress': 'Completed',
      'Completed': 'Not Started'
    };
    onStatusChange(topic.id, nextStatus[topic.status]);
  };

  return (
    <div className={`topic-item-row animate-fade-in`} style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="topic-main">
        <button className="status-btn" onClick={toggleStatus}>
          {getStatusIcon(topic.status)}
        </button>

        <div className="topic-content">
          <div className="topic-title-row">
            {editingId === topic.id ? (
              <input
                className="topic-inline-edit"
                defaultValue={topic.title}
                autoFocus
                onBlur={e => { onEditTopic(topic.id, { title: e.target.value }); setEditingId(null); }}
                onKeyDown={e => {
                  if (e.key === 'Enter') { onEditTopic(topic.id, { title: e.target.value }); setEditingId(null); }
                  if (e.key === 'Escape') setEditingId(null);
                }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span className="topic-title" onDoubleClick={() => setEditingId(topic.id)}>
                {topic.title}
              </span>
            )}

            <button className="topic-edit-btn icon-btn-small" onClick={() => setEditingId(topic.id)} title="Rename">
              <Pencil size={12} />
            </button>
            <span
              className="priority-badge"
              style={{ color: getPriorityColor(topic.priority), borderColor: getPriorityColor(topic.priority) }}
            >
              {topic.priority}
            </span>
          </div>

          <div className="topic-meta">
            {topic.deadline && (
              <span className="meta-item">
                <Calendar size={14} />
                {new Date(topic.deadline).toLocaleDateString()}
              </span>
            )}
            <span className="meta-item">
              <Clock size={14} />
              {topic.timeSpent || 0} mins logged
            </span>
            {topic.notes ? (
              <span className="meta-item notes-hint" onClick={() => setIsEditingNotes(true)} style={{ cursor: 'pointer' }} title="Click to edit notes">
                <FileText size={14} />
                Edit Notes
              </span>
            ) : (
              <span className="meta-item notes-hint" onClick={() => setIsEditingNotes(true)} style={{ cursor: 'pointer', opacity: 0.6 }} title="Click to add notes">
                <FileText size={14} />
                Add Note
              </span>
            )}
          </div>
          
          {topic.notes && !isEditingNotes && (
            <div className="topic-notes-display">
              <p>{topic.notes}</p>
            </div>
          )}

          {isEditingNotes && (
            <div className="topic-notes-editor animate-fade-in">
              <textarea
                className="topic-notes-input"
                value={notesText}
                onChange={e => setNotesText(e.target.value)}
                placeholder="Type your notes here..."
                autoFocus
              />
              <div className="topic-notes-actions">
                <button className="icon-btn-small" onClick={() => setIsEditingNotes(false)} title="Cancel">
                  <X size={14} />
                </button>
                <button className="icon-btn-small" style={{ color: 'var(--success)' }} 
                  onClick={() => { onEditTopic(topic.id, { notes: notesText }); setIsEditingNotes(false); }} title="Save">
                  <Check size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="topic-actions">
        <button
          className="btn-secondary log-time-btn"
          onClick={() => setShowLogger(!showLogger)}
        >
          {showLogger ? 'Close' : 'Log Time'}
        </button>
        <button
          className="icon-btn delete-btn"
          onClick={() => onDeleteTopic(topic.id)}
        >
          <Trash2 size={18} />
        </button>
      </div>

      {showLogger && (
        <div className="logger-dropdown">
          <StudyLogger topic={topic} onLogTime={onLogTime} onClose={() => setShowLogger(false)} />
        </div>
      )}
    </div>

  );
}

export default TopicItem;
