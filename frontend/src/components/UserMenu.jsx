import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings, ChevronDown } from 'lucide-react';
import './UserMenu.css';

export default function UserMenu({ onOpenProfile }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="um-wrapper" ref={ref}>
      <button className="um-trigger" onClick={() => setOpen(v => !v)}>
        {user.picture ? (
          <img src={user.picture} alt={user.name} className="um-avatar-img" referrerPolicy="no-referrer" />
        ) : (
          <span className="um-avatar-emoji">{user.avatar || '🎓'}</span>
        )}
        <span className="um-name">{user.name?.split(' ')[0]}</span>
        <ChevronDown size={14} className={`um-chevron ${open ? 'open' : ''}`} />
      </button>

      {open && (
        <div className="um-dropdown glass-panel">
          <div className="um-user-info">
            {user.picture
              ? <img src={user.picture} alt={user.name} className="um-info-avatar" referrerPolicy="no-referrer" />
              : <span className="um-info-emoji">{user.avatar || '🎓'}</span>
            }
            <div>
              <p className="um-info-name">{user.name}</p>
              <p className="um-info-email">{user.email}</p>
            </div>
          </div>

          <div className="um-divider" />

          <button className="um-item" onClick={() => { onOpenProfile(); setOpen(false); }}>
            <Settings size={14} /> Profile Settings
          </button>
          <button className="um-item danger" onClick={() => { logout(); setOpen(false); }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}