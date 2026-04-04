import React, { useState } from 'react';
import { Calendar, Clock, Trash2, CheckCircle2, Circle, AlertCircle, Pencil, FileText, Check, X, Timer, MoreVertical } from 'lucide-react';
import StudyLogger from './StudyLogger';

function TopicItem({ topic, index, onStatusChange, onLogTime, onDeleteTopic, onEditTopic }) {
  const [showLogger, setShowLogger] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(topic.notes || '');

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
      case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'Low': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      default: return 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-900/30';
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
    <div className="group relative p-4 lg:p-6 border-b border-border-color last:border-0 hover:bg-background-secondary/50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="flex items-start gap-4 lg:gap-6">
        <button 
          onClick={toggleStatus}
          className={`shrink-0 mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
            topic.status === 'Completed' 
              ? 'bg-success border-success text-white' 
              : topic.status === 'In Progress'
                ? 'border-accent-primary text-accent-primary'
                : 'border-border-color text-text-muted hover:border-text-muted'
          }`}
        >
          {topic.status === 'Completed' && <Check size={14} strokeWidth={3} />}
          {topic.status === 'In Progress' && <div className="h-2 w-2 rounded-full bg-accent-primary animate-pulse" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            {isEditingTitle ? (
              <input
                className="flex-1 bg-background-primary border border-accent-primary rounded-lg px-2 py-0.5 text-lg font-semibold outline-none"
                defaultValue={topic.title}
                autoFocus
                onBlur={e => { onEditTopic(topic.id, { title: e.target.value }); setIsEditingTitle(false); }}
                onKeyDown={e => {
                  if (e.key === 'Enter') { onEditTopic(topic.id, { title: e.target.value }); setIsEditingTitle(false); }
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
              />
            ) : (
              <h4 
                className={`text-lg font-semibold truncate transition-colors cursor-pointer ${topic.status === 'Completed' ? 'text-text-muted line-through' : 'text-text-primary'}`}
                onDoubleClick={() => setIsEditingTitle(true)}
              >
                {topic.title}
              </h4>
            )}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityStyles(topic.priority)}`}>
              {topic.priority}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-text-muted mb-3">
            {topic.deadline && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {new Date(topic.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Timer size={14} />
              {topic.timeSpent || 0}m logged
            </span>
            <button onClick={() => setIsEditingNotes(true)} className="flex items-center gap-1.5 hover:text-accent-primary transition-colors">
              <FileText size={14} />
              {topic.notes ? 'Edit Notes' : 'Add Note'}
            </button>
          </div>

          {topic.notes && !isEditingNotes && (
            <p className="text-sm text-text-secondary line-clamp-2 bg-background-tertiary/50 p-2 rounded-lg border border-border-color/50 italic mb-3">
              "{topic.notes}"
            </p>
          )}

          {isEditingNotes && (
            <div className="mb-4">
              <textarea
                className="w-full h-24 p-3 text-sm bg-background-primary border border-border-color rounded-xl outline-none focus:border-accent-primary transition-colors resize-none"
                value={notesText}
                onChange={e => setNotesText(e.target.value)}
                placeholder="Share your thoughts or keep track of details..."
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setIsEditingNotes(false)} className="px-3 py-1 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors">Cancel</button>
                <button onClick={() => { onEditTopic(topic.id, { notes: notesText }); setIsEditingNotes(false); }} className="px-3 py-1 text-xs font-semibold bg-accent-primary text-white rounded-lg hover:opacity-90 transition-opacity">Save Note</button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setShowLogger(!showLogger)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showLogger ? 'bg-background-tertiary text-text-primary' : 'bg-background-secondary border border-border-color hover:border-accent-primary text-text-secondary hover:text-accent-primary'
            }`}
          >
            <Clock size={14} /> {showLogger ? 'Close' : 'Log Time'}
          </button>
          <button 
            onClick={() => onDeleteTopic(topic.id)}
            className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {showLogger && (
        <div className="mt-4 p-4 rounded-2xl bg-background-secondary border border-border-color animate-fade-in shadow-inner">
          <StudyLogger topic={topic} onLogTime={onLogTime} onClose={() => setShowLogger(false)} />
        </div>
      )}
    </div>
  );
}

export default TopicItem;
