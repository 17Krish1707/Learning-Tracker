import React, { useState } from 'react';
import TopicItem from './TopicItem';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

function TopicList({ topics, onStatusChange, onLogTime, onDeleteTopic, onEditTopic }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');

  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 px-6 py-4 bg-background-secondary/20 border-b border-border-color">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input 
            type="text" 
            placeholder="Search within curriculum..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-background-primary border border-border-color rounded-xl text-sm outline-none focus:border-accent-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full h-10 pl-9 pr-8 bg-background-primary border border-border-color rounded-xl text-sm outline-none focus:border-accent-primary appearance-none cursor-pointer transition-all"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
              <Filter size={14} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-border-color">
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic, index) => (
            <TopicItem 
              key={topic.id} 
              topic={topic}
              index={index}
              onStatusChange={onStatusChange}
              onLogTime={onLogTime}
              onDeleteTopic={onDeleteTopic}
              onEditTopic={onEditTopic}
            />
          ))
        ) : (
          <div className="py-20 text-center">
             <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-background-tertiary text-text-muted mb-4">
                <Search size={24} />
             </div>
             <p className="text-text-secondary font-medium">No results matching "{searchTerm}"</p>
             <p className="text-sm text-text-muted mt-1">Try a different keyword or priority filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopicList;
