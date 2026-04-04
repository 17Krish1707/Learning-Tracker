import React, { useState } from 'react';
import TopicItem from './TopicItem';
import { Search, Filter } from 'lucide-react';
import './TopicList.css';

function TopicList({ topics, onStatusChange, onLogTime, onDeleteTopic, onEditTopic }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');

  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="topic-list-container glass-panel">
      <div className="topic-list-actions">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search topics..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="filter-box">
          <Filter size={18} className="filter-icon" />
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input-field filter-select"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>
      
      <div className="topic-list">
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
          <div className="empty-state">
            <p>No topics found. Try adjusting your filters or adding a new topic.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopicList;
