import React, { useState, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import './Sidebar.css';

const ICON_OPTIONS = ['Code2', 'Coffee', 'Database', 'Cpu', 'Book', 'Globe', 'Layers', 'Terminal', 'Zap', 'Star'];
const COLOR_OPTIONS = ['#ff5c5c', '#5c5cff', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'];
const FOLDER_EMOJIS = ['📁', '🎓', '💻', '🔬', '🎨', '📊', '🏋️', '🌍', '🎵', '⚙️'];
const FOLDER_COLORS = ['#7c6ff7', '#10b981', '#f59e0b', '#ff5c5c', '#06b6d4', '#ec4899'];

function getIcon(iconName, size = 18) {
  const IconComponent = Icons[iconName] || Icons.Book;
  return <IconComponent size={size} />;
}

// Reusable context menu
function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="ctx-menu glass-panel" style={{ top: y, left: x }}>
      {items.map((item, i) => item === 'divider'
        ? <div key={i} className="ctx-divider" />
        : (
          <button key={i} className={`ctx-item ${item.danger ? 'danger' : ''}`}
            onClick={() => { item.action(); onClose(); }}>
            {item.icon && <span className="ctx-icon">{item.icon}</span>}
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

// Inline editable text
function InlineEdit({ value, onSave, onCancel, className }) {
  const [val, setVal] = useState(value);
  const inputRef = useRef(null);
  useEffect(() => inputRef.current?.focus(), []);
  const commit = () => { if (val.trim()) onSave(val.trim()); else onCancel(); };
  return (
    <input
      ref={inputRef}
      className={`inline-edit ${className || ''}`}
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') onCancel(); }}
      onClick={e => e.stopPropagation()}
    />
  );
}

// Add/Edit Subject modal
function SubjectModal({ initial, folders, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '');
  const [color, setColor] = useState(initial?.color || COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState(initial?.iconName || ICON_OPTIONS[0]);
  const [folderId, setFolderId] = useState(initial?.folderId || null);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel glass-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial ? 'Edit Subject' : 'New Subject'}</h2>
          <button className="icon-btn-small" onClick={onClose}><Icons.X size={16} /></button>
        </div>
        <div className="modal-body">
          <label className="modal-label">Name</label>
          <input className="modal-input" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Algorithms" autoFocus onKeyDown={e => e.key === 'Enter' && name.trim() && onSave({ name, color, iconName: icon, folderId })} />

          <label className="modal-label">Folder</label>
          <select className="modal-input" value={folderId || ''} onChange={e => setFolderId(e.target.value || null)}>
            <option value="">No Folder (Uncategorized)</option>
            {folders.map(f => <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>)}
          </select>

          <label className="modal-label">Color</label>
          <div className="color-picker">
            {COLOR_OPTIONS.map(c => (
              <button key={c} className={`color-dot ${color === c ? 'selected' : ''}`}
                style={{ backgroundColor: c }} onClick={() => setColor(c)} />
            ))}
          </div>

          <label className="modal-label">Icon</label>
          <div className="icon-picker">
            {ICON_OPTIONS.map(ic => (
              <button key={ic} className={`icon-option ${icon === ic ? 'selected' : ''}`}
                style={icon === ic ? { borderColor: color, color, backgroundColor: `${color}15` } : {}}
                onClick={() => setIcon(ic)}>{getIcon(ic, 16)}</button>
            ))}
          </div>

          <div className="subject-preview">
            <div className="subject-icon" style={{ backgroundColor: `${color}15`, color, borderColor: `${color}30` }}>
              {getIcon(icon)}
            </div>
            <span style={{ color: 'var(--text-primary, #fff)', fontWeight: 500 }}>{name || 'Subject Name'}</span>
          </div>

          <button className="modal-submit-btn" style={{ backgroundColor: color }}
            onClick={() => name.trim() && onSave({ name, color, iconName: icon, folderId })}>
            {initial ? 'Save Changes' : 'Add Subject'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Add/Edit Folder modal
function FolderModal({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '');
  const [emoji, setEmoji] = useState(initial?.emoji || FOLDER_EMOJIS[0]);
  const [color, setColor] = useState(initial?.color || FOLDER_COLORS[0]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel glass-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial ? 'Edit Folder' : 'New Folder'}</h2>
          <button className="icon-btn-small" onClick={onClose}><Icons.X size={16} /></button>
        </div>
        <div className="modal-body">
          <label className="modal-label">Folder Name</label>
          <input className="modal-input" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Academics" autoFocus
            onKeyDown={e => e.key === 'Enter' && name.trim() && onSave({ name, emoji, color })} />

          <label className="modal-label">Emoji</label>
          <div className="emoji-picker">
            {FOLDER_EMOJIS.map(em => (
              <button key={em} className={`emoji-opt ${emoji === em ? 'selected' : ''}`}
                style={emoji === em ? { borderColor: color, backgroundColor: `${color}20` } : {}}
                onClick={() => setEmoji(em)}>{em}</button>
            ))}
          </div>

          <label className="modal-label">Color</label>
          <div className="color-picker">
            {FOLDER_COLORS.map(c => (
              <button key={c} className={`color-dot ${color === c ? 'selected' : ''}`}
                style={{ backgroundColor: c }} onClick={() => setColor(c)} />
            ))}
          </div>

          <div className="folder-preview" style={{ borderColor: `${color}40`, backgroundColor: `${color}10` }}>
            <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
            <span style={{ color: 'var(--text-primary,#fff)', fontWeight: 600 }}>{name || 'Folder Name'}</span>
          </div>

          <button className="modal-submit-btn" style={{ backgroundColor: color }}
            onClick={() => name.trim() && onSave({ name, emoji, color })}>
            {initial ? 'Save Changes' : 'Create Folder'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ folders, subjects, activeSubjectId, setActiveSubjectId,
  onAddFolder, onEditFolder, onDeleteFolder,
  onAddSubject, onEditSubject, onDeleteSubject,
  profile, onOpenProfile }) {

  const [collapsedFolders, setCollapsedFolders] = useState({});
  const [ctxMenu, setCtxMenu] = useState(null); // { x, y, items }
  const [modal, setModal] = useState(null); // { type: 'addSubject'|'editSubject'|'addFolder'|'editFolder', data? }
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type, id, name }

  const toggleFolder = (id) => setCollapsedFolders(prev => ({ ...prev, [id]: !prev[id] }));

  const openCtx = (e, items) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, items });
  };

  // Group subjects by folder
  const subjectsByFolder = (folderId) => subjects.filter(s => s.folderId === folderId);
  const uncategorized = subjects.filter(s => !s.folderId || !folders.find(f => f.id === s.folderId));

  return (
    <>
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Library</h2>
          <div className="sidebar-header-btns">
            <button className="icon-btn-small" title="New Folder" onClick={() => setModal({ type: 'addFolder' })}>
              <Icons.FolderPlus size={15} />
            </button>
            <button className="icon-btn-small" title="New Subject" onClick={() => setModal({ type: 'addSubject' })}>
              <Icons.Plus size={15} />
            </button>
          </div>
        </div>

        <div className="subject-list">
          {/* Folders */}
          {folders.map(folder => {
            const folderSubjects = subjectsByFolder(folder.id);
            const isCollapsed = collapsedFolders[folder.id];
            return (
              <div key={folder.id} className="folder-group">
                <div className="folder-row"
                  onClick={() => toggleFolder(folder.id)}
                  onContextMenu={e => openCtx(e, [
                    { label: 'Add Subject here', icon: <Icons.Plus size={13} />, action: () => setModal({ type: 'addSubject', data: { folderId: folder.id } }) },
                    { label: 'Rename Folder', icon: <Icons.Pencil size={13} />, action: () => setModal({ type: 'editFolder', data: folder }) },
                    'divider',
                    { label: 'Delete Folder', icon: <Icons.Trash2 size={13} />, danger: true, action: () => setDeleteConfirm({ type: 'folder', id: folder.id, name: folder.name }) },
                  ])}
                >
                  <span className="folder-chevron" style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                    <Icons.ChevronDown size={13} />
                  </span>
                  <span className="folder-emoji">{folder.emoji}</span>
                  <span className="folder-name" style={{ color: folder.color }}>{folder.name}</span>
                  <span className="folder-count">{folderSubjects.length}</span>
                  <button className="folder-menu-btn icon-btn-small"
                    onClick={e => openCtx(e, [
                      { label: 'Add Subject', icon: <Icons.Plus size={13} />, action: () => setModal({ type: 'addSubject', data: { folderId: folder.id } }) },
                      { label: 'Edit Folder', icon: <Icons.Pencil size={13} />, action: () => setModal({ type: 'editFolder', data: folder }) },
                      'divider',
                      { label: 'Delete Folder', icon: <Icons.Trash2 size={13} />, danger: true, action: () => setDeleteConfirm({ type: 'folder', id: folder.id, name: folder.name }) },
                    ])}>
                    <Icons.MoreHorizontal size={14} />
                  </button>
                </div>

                {!isCollapsed && (
                  <div className="folder-subjects">
                    {folderSubjects.map(subject => (
                      <SubjectItem key={subject.id} subject={subject} isActive={activeSubjectId === subject.id}
                        onClick={() => setActiveSubjectId(subject.id)}
                        onContextMenu={e => openCtx(e, [
                          { label: 'Edit Subject', icon: <Icons.Pencil size={13} />, action: () => setModal({ type: 'editSubject', data: subject }) },
                          'divider',
                          { label: 'Delete Subject', icon: <Icons.Trash2 size={13} />, danger: true, action: () => setDeleteConfirm({ type: 'subject', id: subject.id, name: subject.name }) },
                        ])}
                      />
                    ))}
                    {folderSubjects.length === 0 && (
                      <div className="folder-empty">No subjects yet</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Uncategorized */}
          {uncategorized.length > 0 && (
            <div className="folder-group">
              <div className="folder-row folder-row-uncategorized">
                <span className="folder-emoji">📂</span>
                <span className="folder-name">Uncategorized</span>
                <span className="folder-count">{uncategorized.length}</span>
              </div>
              <div className="folder-subjects">
                {uncategorized.map(subject => (
                  <SubjectItem key={subject.id} subject={subject} isActive={activeSubjectId === subject.id}
                    onClick={() => setActiveSubjectId(subject.id)}
                    onContextMenu={e => openCtx(e, [
                      { label: 'Edit Subject', icon: <Icons.Pencil size={13} />, action: () => setModal({ type: 'editSubject', data: subject }) },
                      'divider',
                      { label: 'Delete Subject', icon: <Icons.Trash2 size={13} />, danger: true, action: () => setDeleteConfirm({ type: 'subject', id: subject.id, name: subject.name }) },
                    ])}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="sidebar-footer">
          <button className="profile-btn" onClick={onOpenProfile}>
            <span style={{ fontSize: '1.1rem' }}>{profile.avatar}</span>
            <span>{profile.name}</span>
            <Icons.Settings size={14} className="settings-icon" />
          </button>
        </div>
      </aside>

      {/* Context Menu */}
      {ctxMenu && (
        <ContextMenu x={ctxMenu.x} y={ctxMenu.y} items={ctxMenu.items} onClose={() => setCtxMenu(null)} />
      )}

      {/* Modals */}
      {modal?.type === 'addFolder' && (
        <FolderModal onSave={(data) => { onAddFolder(data); setModal(null); }} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'editFolder' && (
        <FolderModal initial={modal.data} onSave={(data) => { onEditFolder(modal.data.id, data); setModal(null); }} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'addSubject' && (
        <SubjectModal folders={folders}
          initial={modal.data?.folderId ? { folderId: modal.data.folderId } : null}
          onSave={(data) => { onAddSubject(data); setModal(null); }} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'editSubject' && (
        <SubjectModal folders={folders} initial={modal.data}
          onSave={(data) => { onEditSubject(modal.data.id, data); setModal(null); }} onClose={() => setModal(null)} />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-panel glass-panel delete-confirm" onClick={e => e.stopPropagation()}>
            <div className="dc-icon">🗑</div>
            <h3 className="dc-title">Delete {deleteConfirm.type === 'folder' ? 'Folder' : 'Subject'}?</h3>
            <p className="dc-desc">
              {deleteConfirm.type === 'folder'
                ? `"${deleteConfirm.name}" will be deleted. All subjects inside will move to Uncategorized.`
                : `"${deleteConfirm.name}" and all its topics will be permanently deleted.`}
            </p>
            <div className="dc-btns">
              <button className="pm-cancel-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="dc-confirm-btn" onClick={() => {
                if (deleteConfirm.type === 'folder') onDeleteFolder(deleteConfirm.id);
                else onDeleteSubject(deleteConfirm.id);
                setDeleteConfirm(null);
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SubjectItem({ subject, isActive, onClick, onContextMenu }) {
  return (
    <div
      className={`subject-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <div className="subject-icon"
        style={{ backgroundColor: `${subject.color}15`, color: subject.color, borderColor: `${subject.color}30` }}>
        {(() => { const I = Icons[subject.iconName] || Icons.Book; return <I size={15} />; })()}
      </div>
      <span className="subject-name">{subject.name}</span>
      {isActive && <div className="active-indicator" style={{ backgroundColor: subject.color }} />}
    </div>
  );
}

export default Sidebar;