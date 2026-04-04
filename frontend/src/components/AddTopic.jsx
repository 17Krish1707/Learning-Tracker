import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import './AddTopic.css';

function AddTopic({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    priority: 'Medium',
    deadline: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onAdd(formData);
    onClose();
  };

  return (
    <div className="add-topic-container glass-panel animate-fade-in">
      <div className="add-topic-header">
        <h4>Add New Topic</h4>
        <button type="button" className="icon-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="add-topic-form">
        <div className="form-row">
          <div className="form-group flex-2">
            <label>Topic Title</label>
            <input 
              type="text" 
              name="title"
              className="input-field" 
              placeholder="e.g. Binary Search"
              value={formData.title}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          <div className="form-group flex-1">
            <label>Priority</label>
            <select 
              name="priority"
              className="input-field"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label>Deadline (Optional)</label>
            <input 
              type="date" 
              name="deadline"
              className="input-field" 
              value={formData.deadline}
              onChange={handleChange}
            />
          </div>
          <div className="form-group flex-2">
            <label>Notes (Optional)</label>
            <input 
              type="text" 
              name="notes"
              className="input-field" 
              placeholder="Any quick notes..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex-center-gap">
            <PlusCircle size={18} />
            Create Topic
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddTopic;
