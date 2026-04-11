import React, { useState } from 'react';
import { X, PlusCircle, Check, Calendar, Flag, FileText } from 'lucide-react';

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
    <div className="bg-background-primary rounded-2xl border border-border-color shadow-lg animate-fade-in overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-color bg-background-secondary/30">
        <h4 className="text-lg font-bold text-text-primary">Add New Topic</h4>
        <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-background-tertiary text-text-muted transition-colors">
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
               <FileText size={14} /> Topic Title
            </label>
            <input 
              type="text" 
              name="title"
              className="w-full h-11 px-4 bg-background-secondary border border-border-color rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary transition-all outline-none" 
              placeholder="e.g. Dynamic Programming Basics"
              value={formData.title}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
               <Flag size={14} /> Priority Level
            </label>
            <div className="relative">
              <select 
                name="priority"
                className="w-full h-11 px-4 bg-background-secondary border border-border-color rounded-xl text-sm text-text-primary outline-none focus:border-accent-primary appearance-none cursor-pointer transition-all"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                 <PlusCircle size={14} className="rotate-45" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
               <Calendar size={14} /> Target Deadline
            </label>
            <input 
              type="date" 
              name="deadline"
              className="w-full h-11 px-4 bg-background-secondary border border-border-color rounded-xl text-sm text-text-primary outline-none focus:border-accent-primary transition-all" 
              value={formData.deadline}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
               <PlusCircle size={14} /> Brief Context
            </label>
            <input 
              type="text" 
              name="notes"
              className="w-full h-11 px-4 bg-background-secondary border border-border-color rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary transition-all outline-none" 
              placeholder="Any quick references or goals..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button type="button" onClick={onClose} className="px-5 h-11 rounded-xl text-sm font-semibold text-text-secondary hover:bg-background-tertiary transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-2 px-6 h-11 rounded-xl bg-accent-primary text-white font-semibold shadow-lg shadow-accent-primary/20 hover:opacity-90 active:scale-95 transition-all">
            <Check size={18} />
            Create Topic
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddTopic;
