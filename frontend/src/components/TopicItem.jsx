import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Calendar, Trash2, Circle, Check, Timer, Zap,
  Bold, Italic, Underline, List, ListOrdered,
  Code, Heading2, Type, Loader2, ChevronDown, AlignLeft,
  Link as LinkIcon, FileText, Image, Paperclip, Plus, X, ExternalLink, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StudyLogger from './StudyLogger';
import { cn } from '../utils/cn';
import { uploadFile } from '../services/api';

function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

function ToolBtn({ onClick, title, active, children }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      className={cn(
        'h-7 w-7 flex items-center justify-center rounded-lg transition-all',
        active
          ? 'bg-accent-primary text-white shadow-sm'
          : 'text-text-muted hover:bg-background-primary hover:text-text-primary'
      )}
    >
      {children}
    </button>
  );
}

function RichToolbar({ editorRef, onUpload }) {
  const [fmt, setFmt] = useState({});
  const update = () => setFmt({
    bold:      document.queryCommandState('bold'),
    italic:    document.queryCommandState('italic'),
    underline: document.queryCommandState('underline'),
    ul:        document.queryCommandState('insertUnorderedList'),
    ol:        document.queryCommandState('insertOrderedList'),
  });
  const exec = (cmd, val = null) => { editorRef.current?.focus(); document.execCommand(cmd, false, val); update(); };
  const Div = () => <div className="h-4 w-px bg-border/60 mx-0.5" />;

  return (
    <div
      onMouseDown={e => e.preventDefault()}
      onKeyUp={update} onClick={update}
      className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/50 bg-background-tertiary/30 flex-wrap"
    >
      <ToolBtn onClick={() => exec('bold')}      title="Bold (Ctrl+B)"      active={fmt.bold}>      <Bold size={12} strokeWidth={2.5} /></ToolBtn>
      <ToolBtn onClick={() => exec('italic')}    title="Italic (Ctrl+I)"    active={fmt.italic}>    <Italic size={12} /></ToolBtn>
      <ToolBtn onClick={() => exec('underline')} title="Underline (Ctrl+U)" active={fmt.underline}> <Underline size={12} /></ToolBtn>
      <Div />
      <ToolBtn onClick={() => exec('formatBlock', 'h2')} title="Heading">  <Heading2 size={12} /></ToolBtn>
      <ToolBtn onClick={() => exec('formatBlock', 'p')}  title="Paragraph"> <Type size={12} /></ToolBtn>
      <Div />
      <ToolBtn onClick={() => exec('insertUnorderedList')} title="Bullet list"   active={fmt.ul}> <List size={12} /></ToolBtn>
      <ToolBtn onClick={() => exec('insertOrderedList')}   title="Numbered list" active={fmt.ol}> <ListOrdered size={12} /></ToolBtn>
      <Div />
      <ToolBtn onClick={() => exec('formatBlock', 'pre')} title="Code block"> <Code size={12} /></ToolBtn>
      <Div />
      <ToolBtn onClick={() => { const url = prompt('Enter URL:'); if(url) exec('createLink', url); }} title="Add Link"> <LinkIcon size={12} /></ToolBtn>
      {onUpload && (
        <ToolBtn onClick={onUpload} title="Upload Image/File"> <Upload size={12} /></ToolBtn>
      )}
    </div>
  );
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getPriorityStyles(priority) {
  switch (priority) {
    case 'High':   return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
    case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
    case 'Low':    return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
    default:       return 'bg-gray-50 text-gray-600 border-gray-100';
  }
}

function TopicItem({ topic, index, onStatusChange, onLogTime, onDeleteTopic, onEditTopic }) {
  const [showLogger,     setShowLogger]     = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [notesOpen,      setNotesOpen]      = useState(false);
  const [saveStatus,     setSaveStatus]     = useState('idle');
  const [showResForm,    setShowResForm]    = useState(false);
  const [resData,        setResData]        = useState({ title: '', url: '', type: 'Link' });
  const [isUploading,    setIsUploading]    = useState(false);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const hasNotes  = Boolean(topic.notes?.trim());

  const toggleStatus = () => {
    const next = { 'Not Started': 'In Progress', 'In Progress': 'Completed', 'Completed': 'Not Started' };
    onStatusChange(topic.id, next[topic.status]);
  };

  useEffect(() => {
    if (notesOpen && editorRef.current && !editorRef.current._seeded) {
      editorRef.current.innerHTML = topic.notes || '';
      editorRef.current._seeded = true;
    }
    if (!notesOpen && editorRef.current) editorRef.current._seeded = false;
  }, [notesOpen, topic.notes]);

  const persistNotes = useCallback(async (html) => {
    setSaveStatus('saving');
    try {
      await onEditTopic(topic.id, { notes: html });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch { setSaveStatus('idle'); }
  }, [onEditTopic, topic.id]);

  const debouncedSave = useDebounce(persistNotes, 800);

  const handleEditorInput = useCallback(() => {
    const html = editorRef.current?.innerHTML || '';
    setSaveStatus('saving');
    debouncedSave(html);
  }, [debouncedSave]);

  const handleManualSave = async () => {
    const html = editorRef.current?.innerHTML || '';
    await persistNotes(html);
  };

  const handleClearNotes = async () => {
    if (editorRef.current) editorRef.current.innerHTML = '';
    await onEditTopic(topic.id, { notes: '' });
    setSaveStatus('idle');
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!resData.title || !resData.url) return;
    const updatedRes = [...(topic.resources || []), resData];
    await onEditTopic(topic.id, { resources: updatedRes });
    setResData({ title: '', url: '', type: 'Link' });
    setShowResForm(false);
  };

  const handleDeleteResource = async (idx) => {
    const updatedRes = (topic.resources || []).filter((_, i) => i !== idx);
    await onEditTopic(topic.id, { resources: updatedRes });
  };

  const processFile = async (file) => {
    setIsUploading(true);
    try {
      const res = await uploadFile(file);
      const isImage = file.type.startsWith('image/');
      
      if (isImage) {
        // Insert directly into editor
        exec('insertHTML', `<img src="${res.url}" alt="${res.name}" style="max-width: 100%; border-radius: 1rem; margin: 1rem 0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);" />`);
        await onEditTopic(topic.id, { notes: editorRef.current.innerHTML });
      } else {
        // Add as resource
        const type = file.type.includes('pdf') ? 'PDF' : 'Document';
        const updatedRes = [...(topic.resources || []), { title: res.name, url: res.url, type }];
        await onEditTopic(topic.id, { resources: updatedRes });
      }
    } catch (e) {
      console.error(e);
      alert('Upload failed: ' + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaste = async (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let item of items) {
      if (item.kind === 'file') {
        e.preventDefault();
        const file = item.getAsFile();
        await processFile(file);
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processFile(file);
      e.target.value = ''; // reset
    }
  };

  return (
    <div
      className="group relative border-b border-border last:border-0 transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start gap-6 lg:gap-10 p-6 lg:p-10 hover:bg-background-secondary/40 transition-all duration-200">

        {/* Status toggle */}
        <button
          onClick={toggleStatus}
          className={cn(
            'shrink-0 mt-1 h-9 w-9 rounded-[1.1rem] border-2 flex items-center justify-center transition-all bg-background-primary shadow-soft relative overflow-hidden',
            topic.status === 'Completed'
              ? 'bg-success/10 border-success text-success scale-110'
              : topic.status === 'In Progress'
                ? 'border-accent-primary text-accent-primary bg-accent-primary/5 ring-4 ring-accent-primary/10'
                : 'border-border text-text-muted/20 hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5 shadow-none'
          )}
        >
          <AnimatePresence mode="wait">
            {topic.status === 'Completed' ? (
              <motion.div key="check" initial={{ scale: 0.5, rotate: -45, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                <Check size={20} strokeWidth={4} />
              </motion.div>
            ) : topic.status === 'In Progress' ? (
              <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative flex items-center justify-center">
                <Circle size={22} className="animate-spin-slow opacity-10" />
                <div className="absolute h-2.5 w-2.5 rounded-full bg-accent-primary shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
              </motion.div>
            ) : (
              <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Circle size={22} strokeWidth={2} className="opacity-40" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <div className="flex-1 min-w-0">

          {/* Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <input
                  autoFocus
                  defaultValue={topic.title}
                  onBlur={e => { onEditTopic(topic.id, { title: e.target.value }); setIsEditingTitle(false); }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { onEditTopic(topic.id, { title: e.target.value }); setIsEditingTitle(false); }
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  className="w-full bg-background-tertiary border-2 border-accent-primary/30 rounded-2xl px-5 py-2.5 text-xl font-black text-text-primary outline-none shadow-premium italic"
                />
              ) : (
                <h4
                  onDoubleClick={() => setIsEditingTitle(true)}
                  className={cn(
                    'text-2xl font-black truncate transition-all cursor-pointer tracking-tight',
                    topic.status === 'Completed' ? 'text-text-muted/40 line-through italic' : 'text-text-primary group-hover:text-accent-primary'
                  )}
                >
                  {topic.title}
                </h4>
              )}
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className={cn('px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.25em] border shadow-sm', getPriorityStyles(topic.priority))}>
                {topic.priority}
              </span>
              <div className="h-6 w-[1px] bg-border/40 mx-1" />
              <button onClick={() => onDeleteTopic(topic.id)} className="p-2.5 text-text-muted hover:text-danger hover:bg-danger/5 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-8 text-[12px] font-black uppercase tracking-[0.2em] text-text-muted opacity-70 mb-8">
            <div className="flex items-center gap-3">
              <Timer size={16} className="text-accent-primary opacity-40" />
              <span className="italic">{topic.timeSpent || 0}m logged</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-accent-secondary opacity-40" />
              <span className="italic">{topic.lastStudied || 'No protocol'}</span>
            </div>
            <button
              onClick={() => setShowLogger(!showLogger)}
              className="flex items-center gap-3 text-accent-primary hover:text-accent-secondary transition-all ml-auto"
            >
              <Zap size={16} fill="currentColor" className="opacity-40" />
              <span>Record Sprint</span>
            </button>
          </div>

          {/* Study logger */}
          <AnimatePresence>
            {showLogger && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="p-8 rounded-[2.5rem] bg-background-tertiary/40 border border-border/60 shadow-inner backdrop-blur-sm">
                  <StudyLogger topic={topic} onLogTime={onLogTime} onClose={() => setShowLogger(false)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Notes ──────────────────────────────────────────────────── */}
          <div className="mt-2">

            {/* Toggle header */}
            <button
              onClick={() => setNotesOpen(v => !v)}
              className="flex items-center gap-3 w-full text-left group/notebtn mb-3"
            >
              <div className={cn(
                'flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] transition-colors',
                notesOpen ? 'text-accent-primary' : 'text-text-muted/60 group-hover/notebtn:text-text-muted'
              )}>
                <AlignLeft size={13} />
                <span>Notes</span>
                {hasNotes && !notesOpen && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary text-[9px] font-black border border-accent-primary/20">
                    {wordCount(topic.notes || '')}w
                  </span>
                )}
              </div>
              <div className="flex-1 h-px bg-border/30 group-hover/notebtn:bg-border/60 transition-colors" />
              <motion.div animate={{ rotate: notesOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={13} className={cn('transition-colors', notesOpen ? 'text-accent-primary' : 'text-text-muted/40')} />
              </motion.div>
            </button>

            {/* Editor panel */}
            <AnimatePresence>
              {notesOpen && (
                <motion.div
                  key="notes-panel"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl border border-border/60 bg-background-secondary/30 overflow-hidden shadow-sm">
                    <RichToolbar editorRef={editorRef} onUpload={() => fileInputRef.current?.click()} />

                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={handleEditorInput}
                      onPaste={handlePaste}
                      data-placeholder="Write notes, formulas, code snippets…"
                      className="notes-topic-editor min-h-[160px] max-h-[500px] overflow-y-auto p-5 text-[14px] leading-7 text-text-primary outline-none custom-scrollbar"
                    />

                    <div className="flex items-center justify-between px-4 py-2 border-t border-border/40 bg-background-tertiary/20">
                      <div className="flex items-center gap-2">
                        <AnimatePresence mode="wait">
                          {saveStatus === 'saving' && (
                            <motion.span key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="flex items-center gap-1.5 text-[11px] text-text-muted font-semibold">
                              <Loader2 size={10} className="animate-spin" /> Saving…
                            </motion.span>
                          )}
                          {saveStatus === 'saved' && (
                            <motion.span key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                              <Check size={10} /> Saved
                            </motion.span>
                          )}
                          {saveStatus === 'idle' && hasNotes && (
                            <motion.span key="wc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="text-[11px] text-text-muted/50 font-semibold">
                              {wordCount(topic.notes || '')} words
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasNotes && (
                          <button onClick={handleClearNotes} className="text-[11px] font-bold text-text-muted hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-400/5">
                            Clear
                          </button>
                        )}
                        <button
                          onClick={handleManualSave}
                          className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide px-3 py-1.5 rounded-lg bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-white transition-all border border-accent-primary/20"
                        >
                          <Check size={10} /> Save
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-text-muted/40 font-semibold mt-2 ml-1">
                    Ctrl+B bold · Ctrl+I italic · Ctrl+U underline · Auto-saves as you type
                  </p>

                  {/* Resources / Attachments */}
                  <div className="mt-8 pt-8 border-t border-border/40">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Paperclip size={16} className="text-accent-primary opacity-60" />
                        <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-muted">Files & Attachments</h5>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-accent-primary transition-all px-4 py-1.5 rounded-xl bg-background-tertiary border border-border"
                        >
                          {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} 
                          {isUploading ? 'Uploading...' : 'Upload File'}
                        </button>
                        <button 
                          onClick={() => setShowResForm(!showResForm)}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-primary hover:opacity-70 transition-all px-4 py-1.5 rounded-xl bg-accent-primary/5 border border-accent-primary/10"
                        >
                          {showResForm ? <X size={12} /> : <Plus size={12} />} {showResForm ? 'Cancel' : 'Add Attachment'}
                        </button>
                      </div>
                    </div>

                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileChange}
                    />

                    <AnimatePresence>
                      {showResForm && (
                        <motion.form 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          onSubmit={handleAddResource}
                          className="mb-8 p-6 rounded-2xl bg-background-tertiary/40 border border-accent-primary/20 space-y-4"
                        >
                          <div className="flex flex-col md:flex-row items-stretch gap-4">
                            <input 
                              placeholder="Asset Title (e.g. Solution PDF)"
                              value={resData.title}
                              onChange={e => setResData({...resData, title: e.target.value})}
                              className="flex-[1.2] bg-background-primary border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all"
                            />
                            <div className="flex-[2] flex items-center gap-2">
                              <select 
                                value={resData.type}
                                onChange={e => setResData({...resData, type: e.target.value})}
                                className="w-28 bg-background-primary border border-border rounded-xl px-3 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all cursor-pointer"
                              >
                                <option>Link</option>
                                <option>PDF</option>
                                <option>Image</option>
                                <option>Document</option>
                              </select>
                              <input 
                                placeholder="URL (https://...)"
                                value={resData.url}
                                onChange={e => setResData({...resData, url: e.target.value})}
                                className="flex-1 bg-background-primary border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all"
                              />
                            </div>
                          </div>
                          <button type="submit" className="w-full py-2.5 rounded-xl bg-accent-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-accent-highlight transition-all shadow-premium">Save Attachment</button>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(topic.resources || []).map((res, i) => (
                        <div key={i} className="group/res flex items-center justify-between p-4 rounded-2xl bg-background-secondary/30 border border-border/40 hover:border-accent-primary/40 transition-all hover:bg-background-secondary/50">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-10 w-10 shrink-0 rounded-[0.9rem] bg-background-tertiary flex items-center justify-center text-text-muted group-hover/res:text-accent-primary transition-all">
                              {res.type === 'PDF' ? <FileText size={18} /> : res.type === 'Image' ? <Image size={18} /> : <LinkIcon size={18} />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-black text-text-primary truncate uppercase italic">{res.title}</p>
                              <p className="text-[10px] font-bold text-text-muted opacity-40 uppercase tracking-widest italic">{res.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-2 text-text-muted hover:text-accent-primary transition-colors">
                              <ExternalLink size={16} />
                            </a>
                            <button onClick={() => handleDeleteResource(i)} className="p-2 text-text-muted hover:text-danger opacity-0 group-hover/res:opacity-100 transition-all">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapsed preview */}
            {!notesOpen && hasNotes && (
              <button
                onClick={() => setNotesOpen(true)}
                className="w-full text-left px-4 py-3 rounded-xl bg-background-tertiary/20 border border-border/30 hover:border-accent-primary/30 hover:bg-background-tertiary/40 transition-all group/preview"
              >
                <p className="text-[13px] text-text-muted/70 font-medium leading-relaxed line-clamp-2 italic group-hover/preview:text-text-secondary transition-colors">
                  {(topic.notes || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)}
                  {(topic.notes || '').length > 200 && '…'}
                </p>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default TopicItem;