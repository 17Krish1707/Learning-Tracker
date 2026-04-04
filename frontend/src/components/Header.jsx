import React, { useState, useRef, useEffect } from 'react';
import { Bell, Flame, User, Moon, Sun, Layers } from 'lucide-react';
import './Header.css';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';
import UserMenu from './UserMenu';

function Header({ streak, profile, notifications, onMarkAllRead, onOpenProfile, onToggleTheme }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const ref = useRef(null);
  const unread = notifications.filter(n => !n.read).length;
  const { user, loading } = useAuth();  
  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const typeColor = { deadline: '#ff5c5c', streak: '#f59e0b', complete: '#10b981', time: '#5c5cff', info: '#888' };

  return (
    <header className="header glass-panel">
      <div className="header-brand">
        <div className="brand-icon-wrapper">
          <Layers size={22} color="white" />
        </div>
        <h1 className="brand-name">StudyTrack</h1>
      </div>

      <div className="header-actions">
        {/* Streak */}
        <div className="streak-badge">
          <Flame size={16} color="#f59e0b" />
          <span>{streak} day streak</span>
        </div>

        {/* Theme Toggle */}
        <button 
          className="icon-btn theme-toggle" 
          onClick={onToggleTheme}
          title={`Switch to ${profile.theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {profile.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification bell */}
        {user && (
          <div className="notif-wrapper" ref={ref}>
            <button
              className="icon-btn notif-btn"
              onClick={() => { setShowNotifs(v => !v); if (!showNotifs) onMarkAllRead(); }}
            >
              <Bell size={18} />
              {unread > 0 && <span className="notif-badge">{unread}</span>}
            </button>

            {showNotifs && (
              <div className="notif-dropdown glass-panel">
                <div className="notif-header">
                  <span>Notifications</span>
                  <button className="notif-clear" onClick={onMarkAllRead}>Mark all read</button>
                </div>
                <div className="notif-list">
                  {notifications.length === 0
                    ? <p className="notif-empty">No notifications</p>
                    : notifications.map(n => (
                      <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
                        <div className="notif-dot" style={{ backgroundColor: typeColor[n.type] || '#888' }} />
                        <div className="notif-content">
                          <p className="notif-msg">{n.message}</p>
                          <span className="notif-time">{n.time}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Auth: sign-in button OR user menu */}
        {loading ? (
          <div className="auth-loading" />
        ) : user ? (
          <UserMenu onOpenProfile={onOpenProfile} />
        ) : (
          <GoogleSignInButton />
        )}
      </div>
    </header>
    
  );
  
}


export default Header;  