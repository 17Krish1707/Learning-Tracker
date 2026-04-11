// useData.js — Central data hook: fetches from backend, provides CRUD handlers
// This replaces all the scattered local state in App.jsx

import { useState, useEffect, useCallback } from 'react';
import { foldersAPI, subjectsAPI, topicsAPI, sessionsAPI } from '../services/api';

export function useData(user) {
  const [folders, setFolders]         = useState([]);
  const [subjects, setSubjects]       = useState([]);
  const [topics, setTopics]           = useState({});   // { [subjectId]: [...] }
  const [streak, setStreak]           = useState(0);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  // ── Bootstrap: load folders + subjects when user signs in ──────────────
  useEffect(() => {
    if (!user) {
      setFolders([]); setSubjects([]); setTopics({}); setStreak(0);
      return;
    }
    loadFoldersAndSubjects();
  }, [user]);

  const loadFoldersAndSubjects = async () => {
    setLoading(true);
    try {
      const [fRes, sRes] = await Promise.all([
        foldersAPI.getAll(),
        subjectsAPI.getAll(),
      ]);
      setFolders(fRes.folders.map(normalizeFolder));
      setSubjects(sRes.subjects.map(normalizeSubject));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Load topics for a subject (lazy — only when opened) ────────────────
  const loadTopics = useCallback(async (subjectId) => {
    if (!subjectId) return;
    try {
      const res = await topicsAPI.getBySubject(subjectId);
      setTopics(prev => ({ ...prev, [subjectId]: res.topics.map(normalizeTopic) }));
    } catch (e) {
      setError(e.message);
    }
  }, []);

  // ─── Folder CRUD ────────────────────────────────────────────────────────
  const addFolder = async (data) => {
    const res = await foldersAPI.create(data);
    setFolders(prev => [...prev, normalizeFolder(res.folder)]);
    return res.folder;
  };

  const editFolder = async (id, data) => {
    const res = await foldersAPI.update(id, data);
    setFolders(prev => prev.map(f => f.id === id ? normalizeFolder(res.folder) : f));
  };

  const deleteFolder = async (id) => {
    await foldersAPI.remove(id);
    setFolders(prev => prev.filter(f => f.id !== id));
    setSubjects(prev => prev.map(s => s.folderId === id ? { ...s, folderId: null } : s));
  };

  // ─── Subject CRUD ───────────────────────────────────────────────────────
  const addSubject = async (data) => {
    const res = await subjectsAPI.create(data);
    setSubjects(prev => [...prev, normalizeSubject(res.subject)]);
    return res.subject;
  };

  const editSubject = async (id, data) => {
    const res = await subjectsAPI.update(id, data);
    setSubjects(prev => prev.map(s => s.id === id ? normalizeSubject(res.subject) : s));
  };

  const deleteSubject = async (id) => {
    await subjectsAPI.remove(id);
    setSubjects(prev => prev.filter(s => s.id !== id));
    setTopics(prev => { const next = { ...prev }; delete next[id]; return next; });
  };

  // ─── Topic CRUD ─────────────────────────────────────────────────────────
  const addTopic = async (subjectId, data) => {
    const res = await topicsAPI.create({ ...data, subjectId });
    const t = normalizeTopic(res.topic);
    setTopics(prev => ({ ...prev, [subjectId]: [t, ...(prev[subjectId] || [])] }));
    return t;
  };

  const editTopic = async (topicId, subjectId, data) => {
    const res = await topicsAPI.update(topicId, data);
    const updated = normalizeTopic(res.topic);
    setTopics(prev => ({
      ...prev,
      [subjectId]: (prev[subjectId] || []).map(t => t.id === topicId ? updated : t),
    }));
  };

  const deleteTopic = async (topicId, subjectId) => {
    await topicsAPI.remove(topicId);
    setTopics(prev => ({
      ...prev,
      [subjectId]: (prev[subjectId] || []).filter(t => t.id !== topicId),
    }));
  };

  // ─── Log Study Time ─────────────────────────────────────────────────────
  const logTime = async (topicId, subjectId, minutes, date) => {
    const res = await sessionsAPI.create({
      topicId,
      duration: minutes,
      date: date || new Date().toISOString(),
    });
    // Backend updates hoursSpent on the topic — re-fetch the topic list
    await loadTopics(subjectId);
    if (res.streakDays !== undefined) setStreak(res.streakDays);
    return res;
  };

  return {
    folders, subjects, topics, streak, loading, error,
    loadTopics,
    addFolder, editFolder, deleteFolder,
    addSubject, editSubject, deleteSubject,
    addTopic, editTopic, deleteTopic, logTime,
    reload: loadFoldersAndSubjects,
  };
}

// ─── Normalizers: MongoDB _id → id ─────────────────────────────────────────
function normalizeFolder(f) {
  return { ...f, id: f._id || f.id };
}
function normalizeSubject(s) {
  const fId = s.folderId?._id || s.folderId || null;
  return { ...s, id: s._id || s.id, folderId: fId };
}
function normalizeTopic(t) {
  return {
    ...t,
    id:          t._id || t.id,
    timeSpent:   Math.round((t.hoursSpent || 0) * 60), // convert hours → minutes for UI
    subjectId:   t.subjectId?._id || t.subjectId,
  };
}