import React, { useState } from 'react';
import { Play, Check } from 'lucide-react';
import './StudyLogger.css';

function StudyLogger({ topic, onLogTime, onClose }) {
  const [minutes, setMinutes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!minutes || isNaN(minutes) || Number(minutes) <= 0) return;
    
    onLogTime(topic.id, Number(minutes));
    setMinutes('');
    if (onClose) onClose();
  };

  return (
    <form className="study-logger" onSubmit={handleSubmit}>
      <div className="logger-inputs">
        <div className="input-group">
          <label>Date</label>
          <input 
            type="date" 
            className="input-field" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Time Spent (minutes)</label>
          <input 
            type="number" 
            className="input-field" 
            placeholder="e.g. 45"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            min="1"
            required
          />
        </div>
      </div>
      
      <div className="logger-actions">
        <button type="submit" className="btn-primary log-submit-btn">
          <Check size={18} />
          Save Log
        </button>
      </div>
    </form>
  );
}

export default StudyLogger;
