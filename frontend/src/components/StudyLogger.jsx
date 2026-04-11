import React, { useState } from 'react';
import { Clock, Check, X } from 'lucide-react';
 
function StudyLogger({ topic, onLogTime, onClose }) {
  const [minutes, setMinutes] = useState('');
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const mins = Number(minutes);
    if (!mins || isNaN(mins) || mins <= 0) {
      setError('Please enter a valid number of minutes.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onLogTime(topic.id, mins, date);
      setMinutes('');
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'Failed to save log.');
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Clock size={16} className="text-accent-primary" />
        <span className="text-sm font-bold text-text-primary">Log Study Time</span>
        {onClose && (
          <button type="button" onClick={onClose} className="ml-auto p-1 rounded-lg hover:bg-background-tertiary text-text-muted transition-colors">
            <X size={16} />
          </button>
        )}
      </div>
 
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Date</label>
          <input
            type="date"
            className="w-full h-10 px-3 bg-background-primary border border-border rounded-xl text-sm text-text-primary outline-none focus:border-accent-primary transition-all"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Minutes</label>
          <input
            type="number"
            className="w-full h-10 px-3 bg-background-primary border border-border rounded-xl text-sm text-text-primary outline-none focus:border-accent-primary transition-all"
            placeholder="e.g. 45"
            value={minutes}
            onChange={e => setMinutes(e.target.value)}
            min="1"
            max="1440"
            required
            autoFocus
          />
        </div>
      </div>
 
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
 
      <div className="flex justify-end gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-9 rounded-xl text-sm font-semibold text-text-muted hover:bg-background-tertiary transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 h-9 rounded-xl bg-accent-primary text-white font-semibold text-sm shadow-lg shadow-accent-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? (
            <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          ) : (
            <Check size={16} />
          )}
          {saving ? 'Saving…' : 'Save Log'}
        </button>
      </div>
    </form>
  );
}
 
export default StudyLogger;