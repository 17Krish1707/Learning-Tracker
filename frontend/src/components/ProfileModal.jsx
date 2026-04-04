import React, { useState } from 'react';
import { X } from 'lucide-react';
import './ProfileModal.css';

const AVATAR_OPTIONS = ['🎓', '🧑‍💻', '📚', '🦊', '🐼', '🚀', '🎯', '⚡'];
const TABS = ['Account', 'Study', 'Preferences', 'About'];

function ProfileModal({ profile, onSave, onClose }) {
  const [activeTab, setActiveTab] = useState('Account');
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-modal glass-panel" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="pm-header">
          <div className="pm-header-left">
            <span className="pm-avatar-display">{form.avatar}</span>
            <div>
              <h2 className="pm-title">{form.name || 'Your Profile'}</h2>
              <p className="pm-subtitle">{form.email}</p>
            </div>
          </div>
          <button className="icon-btn-small" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div className="pm-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`pm-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >{tab}</button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pm-body">

          {activeTab === 'Account' && (
            <div className="pm-section">
              <label className="pm-label">Avatar</label>
              <div className="avatar-picker">
                {AVATAR_OPTIONS.map(a => (
                  <button
                    key={a}
                    className={`avatar-opt ${form.avatar === a ? 'selected' : ''}`}
                    onClick={() => update('avatar', a)}
                  >{a}</button>
                ))}
              </div>

              <label className="pm-label">Display Name</label>
              <input className="pm-input" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your name" />

              <label className="pm-label">Email</label>
              <input className="pm-input" value={form.email} onChange={e => update('email', e.target.value)} placeholder="your@email.com" type="email" />

              <label className="pm-label">Timezone</label>
              <select className="pm-input" value={form.timezone} onChange={e => update('timezone', e.target.value)}>
                <option>Asia/Kolkata</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
                <option>Asia/Tokyo</option>
                <option>Australia/Sydney</option>
              </select>

              <label className="pm-label">Language</label>
              <select className="pm-input" value={form.language} onChange={e => update('language', e.target.value)}>
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          )}

          {activeTab === 'Study' && (
            <div className="pm-section">
              <label className="pm-label">Daily Study Goal</label>
              <div className="pm-slider-row">
                <input type="range" min={15} max={480} step={15} value={form.studyGoal}
                  onChange={e => update('studyGoal', Number(e.target.value))} className="pm-slider" />
                <span className="pm-slider-val">{form.studyGoal >= 60 ? `${(form.studyGoal/60).toFixed(1)}h` : `${form.studyGoal}m`}</span>
              </div>

              <label className="pm-label">Weekly Study Days Target</label>
              <div className="pm-slider-row">
                <input type="range" min={1} max={7} step={1} value={form.weeklyTarget}
                  onChange={e => update('weeklyTarget', Number(e.target.value))} className="pm-slider" />
                <span className="pm-slider-val">{form.weeklyTarget} days/wk</span>
              </div>

              <div className="pm-stat-row">
                <div className="pm-stat-card">
                  <span className="pm-stat-icon">🔥</span>
                  <span className="pm-stat-label">Current Streak</span>
                  <span className="pm-stat-val">5 days</span>
                </div>
                <div className="pm-stat-card">
                  <span className="pm-stat-icon">⏱</span>
                  <span className="pm-stat-label">Total Hours</span>
                  <span className="pm-stat-val">2.8h</span>
                </div>
                <div className="pm-stat-card">
                  <span className="pm-stat-icon">✅</span>
                  <span className="pm-stat-label">Completed</span>
                  <span className="pm-stat-val">1 topic</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Preferences' && (
            <div className="pm-section">
              <label className="pm-label">Theme</label>
              <div className="pm-toggle-group">
                {['dark', 'light'].map(t => (
                  <button key={t} className={`pm-toggle-btn ${form.theme === t ? 'active' : ''}`}
                    onClick={() => update('theme', t)}>
                    {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
                  </button>
                ))}
              </div>

              <div className="pm-switch-row">
                <div>
                  <p className="pm-switch-label">Push Notifications</p>
                  <p className="pm-switch-sub">Get alerts for deadlines & streaks</p>
                </div>
                <button className={`pm-switch ${form.notifications ? 'on' : ''}`}
                  onClick={() => update('notifications', !form.notifications)}>
                  <div className="pm-switch-thumb" />
                </button>
              </div>

              <div className="pm-switch-row">
                <div>
                  <p className="pm-switch-label">Sound Effects</p>
                  <p className="pm-switch-sub">Play sounds on actions</p>
                </div>
                <button className={`pm-switch ${form.soundEffects ? 'on' : ''}`}
                  onClick={() => update('soundEffects', !form.soundEffects)}>
                  <div className="pm-switch-thumb" />
                </button>
              </div>

              <div className="pm-switch-row">
                <div>
                  <p className="pm-switch-label">Compact Mode</p>
                  <p className="pm-switch-sub">Denser topic list layout</p>
                </div>
                <button className={`pm-switch ${form.compactMode ? 'on' : ''}`}
                  onClick={() => update('compactMode', !form.compactMode)}>
                  <div className="pm-switch-thumb" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'About' && (
            <div className="pm-section pm-about">
              <div className="brand-icon-wrapper pm-app-logo-custom" style={{ margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                📖
              </div>
              <h3 className="pm-app-name" style={{ fontSize: '1.6rem', marginBottom: '8px' }}>StudyTrack</h3>
              <span className="priority-badge" style={{ color: 'var(--accent-secondary)', borderColor: 'var(--accent-secondary)', marginBottom: '16px', display: 'inline-block' }}>v2.0 Power Edition</span>
              
              <div className="pm-app-desc" style={{ maxWidth: '380px', margin: '0 auto 24px', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                StudyTrack is your ultimate academic companion. We combine gorgeous, distraction-free aesthetics with powerful productivity metrics so you can achieve your learning goals effortlessly.
                <br/><br/>
                <strong style={{ color: 'var(--accent-primary)' }}>Features:</strong>
                <ul style={{ textAlign: 'left', marginTop: '12px', paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                  <li>Intuitive Folder & Subject Management</li>
                  <li>Real-time Progress Tracking & Study Logging</li>
                  <li>Dynamic Light/Dark Themes across platforms</li>
                  <li>In-line Topic Editing & Deadline Alerts</li>
                  <li>In-line Notes for each topic</li>
                </ul>
              </div>

              <div className="pm-links" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button className="pm-link-btn">😸 GitHub</button>
                <button className="pm-link-btn">☕ Buy me a coffee</button>
                <button className="pm-link-btn">💖 Sponsor</button>
              </div>
              <p className="pm-made-with" style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Designed & Engineered with ❤️</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pm-footer">
          <button className="pm-cancel-btn" onClick={onClose}>Cancel</button>
          <button className={`pm-save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;