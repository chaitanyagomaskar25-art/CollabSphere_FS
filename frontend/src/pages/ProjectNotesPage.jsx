import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import MarkdownViewer from '../components/MarkdownViewer.jsx';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Tag,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Save,
  X,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  Columns,
  Code,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';

export default function ProjectNotesPage() {
  const { project, userRole } = useOutletContext();
  const { user: currentUser } = useAuth();

  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editIsPinned, setEditIsPinned] = useState(false);
  const [editorMode, setEditorMode] = useState('split'); // 'write', 'preview', 'split'
  const [isSaving, setIsSaving] = useState(false);

  // AI Modal/Drawer state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiTitle, setAiTitle] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  // Status feedback
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedTag) params.tag = selectedTag;

      const res = await api.get(`/projects/${project._id}/notes`, { params });
      if (res.data.success) {
        setNotes(res.data.notes);
        if (res.data.notes.length > 0 && !activeNote) {
          setActiveNote(res.data.notes[0]);
        } else if (activeNote) {
          // Keep current note updated
          const updated = res.data.notes.find((n) => n._id === activeNote._id);
          if (updated) setActiveNote(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes();
    }, 200);
    return () => clearTimeout(timer);
  }, [project._id, search, selectedTag]);

  // Handle Create New Note Click
  const handleStartNewNote = () => {
    setActiveNote(null);
    setEditTitle('');
    setEditContent('# Title\n\nEnter Markdown content here...');
    setEditTags('');
    setEditIsPinned(false);
    setIsEditing(true);
  };

  // Handle Edit Existing Note Click
  const handleStartEdit = () => {
    if (!activeNote) return;
    setEditTitle(activeNote.title);
    setEditContent(activeNote.content);
    setEditTags(activeNote.tags?.join(', ') || '');
    setEditIsPinned(activeNote.isPinned);
    setIsEditing(true);
  };

  // Save Note (Create or Update)
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setStatusMessage({ type: 'error', text: 'Note title cannot be empty' });
      return;
    }

    setIsSaving(true);
    setStatusMessage({ type: '', text: '' });

    const tagsArray = editTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    try {
      if (activeNote?._id) {
        // Update
        const res = await api.put(
          `/projects/${project._id}/notes/${activeNote._id}`,
          {
            title: editTitle.trim(),
            content: editContent,
            tags: tagsArray,
            isPinned: editIsPinned,
          }
        );
        if (res.data.success) {
          setActiveNote(res.data.note);
          setIsEditing(false);
          setStatusMessage({ type: 'success', text: 'Note saved successfully' });
          fetchNotes();
        }
      } else {
        // Create
        const res = await api.post(`/projects/${project._id}/notes`, {
          title: editTitle.trim(),
          content: editContent,
          tags: tagsArray,
          isPinned: editIsPinned,
        });
        if (res.data.success) {
          setActiveNote(res.data.note);
          setIsEditing(false);
          setStatusMessage({ type: 'success', text: 'New note created' });
          fetchNotes();
        }
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error saving note',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Note
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const res = await api.delete(`/projects/${project._id}/notes/${noteId}`);
      if (res.data.success) {
        setStatusMessage({ type: 'success', text: 'Note deleted' });
        const remaining = notes.filter((n) => n._id !== noteId);
        setNotes(remaining);
        setActiveNote(remaining.length > 0 ? remaining[0] : null);
        setIsEditing(false);
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error deleting note',
      });
    }
  };

  // AI Helper: Explain Note
  const handleAiExplain = async () => {
    if (!activeNote || !activeNote.content) return;
    setAiTitle(`AI Explanation: ${activeNote.title}`);
    setAiResult('');
    setShowAiModal(true);
    setAiLoading(true);

    try {
      const res = await api.post('/gemini/explain', {
        text: activeNote.content,
        context: 'note',
      });
      if (res.data.success) {
        setAiResult(res.data.result);
      }
    } catch (err) {
      setAiResult(`Error: ${err.response?.data?.message || 'Failed to generate explanation'}`);
    } finally {
      setAiLoading(false);
    }
  };

  // AI Helper: Improve Note
  const handleAiImprove = async () => {
    if (!activeNote || !activeNote.content) return;
    setAiTitle(`AI Improved Version: ${activeNote.title}`);
    setAiResult('');
    setShowAiModal(true);
    setAiLoading(true);

    try {
      const res = await api.post('/gemini/improve', {
        text: activeNote.content,
      });
      if (res.data.success) {
        setAiResult(res.data.result);
      }
    } catch (err) {
      setAiResult(`Error: ${err.response?.data?.message || 'Failed to improve note'}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Apply AI result directly into editor
  const handleApplyAiResult = () => {
    if (aiResult) {
      setEditContent(aiResult);
      setShowAiModal(false);
      setIsEditing(true);
    }
  };

  const isAuthor = activeNote?.author?._id === currentUser?._id;
  const canEdit = isAuthor || userRole === 'admin' || userRole === 'owner';

  // Extract all unique tags
  const allTags = Array.from(
    new Set(notes.flatMap((n) => n.tags || []))
  ).filter(Boolean);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Status banner */}
      {statusMessage.text && (
        <div
          className={`p-3 mb-4 rounded-xl border flex items-center justify-between text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage({ type: '', text: '' })}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        {/* Left Column: Notes List */}
        <div
          className={`w-full md:w-80 lg:w-96 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${
            activeNote && isEditing ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* List Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Notes ({notes.length})
              </h2>
              <button
                onClick={handleStartNewNote}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                New Note
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Tag Pills */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedTag('')}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                    selectedTag === ''
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                      selectedTag === tag
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                Loading notes...
              </div>
            ) : notes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No notes found. Create one to begin documenting.
              </div>
            ) : (
              notes.map((note) => {
                const isSelected = activeNote?._id === note._id;
                return (
                  <button
                    key={note._id}
                    onClick={() => {
                      setActiveNote(note);
                      setIsEditing(false);
                    }}
                    className={`w-full text-left p-4 transition-colors flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm font-semibold truncate ${
                          isSelected
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {note.title}
                      </span>
                      {note.isPinned && (
                        <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {note.content.replace(/[#*`_]/g, '') || 'Empty note'}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{note.author?.name || 'Author'}</span>
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Note View or Note Editor */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-w-0">
          {isEditing ? (
            /* Note Editor Form */
            <form onSubmit={handleSaveNote} className="flex-1 flex flex-col h-full min-h-0">
              {/* Editor Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Note Title..."
                  className="flex-1 min-w-[200px] text-lg font-bold bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />

                {/* View Mode Controls */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setEditorMode('write')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      editorMode === 'write'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('split')}
                    className={`hidden sm:flex px-2.5 py-1 rounded-lg text-xs font-semibold items-center gap-1 ${
                      editorMode === 'split'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" /> Split
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('preview')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      editorMode === 'preview'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                </div>

                {/* Editor Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Note
                  </button>
                </div>
              </div>

              {/* Tag and Pin toolbar */}
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="Tags (e.g. Architecture, Security, Meeting)"
                    className="bg-transparent flex-1 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={editIsPinned}
                    onChange={(e) => setEditIsPinned(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Pin to top</span>
                </label>
              </div>

              {/* Editor Workspace */}
              <div className="flex-1 flex min-h-0 overflow-hidden">
                {/* Write textarea */}
                {(editorMode === 'write' || editorMode === 'split') && (
                  <div className="flex-1 flex flex-col p-4 border-r border-slate-100 dark:border-slate-800 min-w-0">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Write your note with full Markdown support (# Header, - List, ```code```)..."
                      className="w-full h-full bg-transparent font-mono text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                )}

                {/* Preview pane */}
                {(editorMode === 'preview' || editorMode === 'split') && (
                  <div className="flex-1 p-6 overflow-y-auto min-w-0 bg-slate-50/30 dark:bg-slate-950/20">
                    <MarkdownViewer content={editContent} />
                  </div>
                )}
              </div>
            </form>
          ) : activeNote ? (
            /* Active Note View Mode */
            <div className="flex-1 flex flex-col h-full min-h-0">
              {/* Note Header & Actions */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      {activeNote.title}
                    </h1>
                    {activeNote.isPinned && (
                      <span className="p-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                        <Pin className="w-4 h-4 fill-amber-500" />
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] uppercase">
                        {activeNote.author?.avatar ? (
                          <img
                            src={activeNote.author.avatar}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          activeNote.author?.name?.charAt(0) || 'U'
                        )}
                      </div>
                      {activeNote.author?.name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Updated {new Date(activeNote.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {activeNote.tags && activeNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {activeNote.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right controls: AI & Edit/Delete */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* AI Actions */}
                  <button
                    onClick={handleAiExplain}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/50 flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    Explain Note
                  </button>

                  <button
                    onClick={handleAiImprove}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center gap-1.5 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    Improve Note
                  </button>

                  {/* Edit/Delete Actions */}
                  {canEdit && (
                    <>
                      <button
                        onClick={handleStartEdit}
                        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Note"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(activeNote._id)}
                        className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Rendered Markdown Content */}
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
                <MarkdownViewer content={activeNote.content} />
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Select or create a note
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">
                Document architecture designs, meeting logs, technical debt, or guides.
              </p>
              <button
                onClick={handleStartNewNote}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
              >
                Create Note
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Gemini AI Result Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {aiTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {aiLoading ? (
                <div className="py-16 text-center text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
                  <p className="text-sm font-semibold">Gemini AI is processing your note...</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Analyzing grammar, clarity, structure, and readability
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <MarkdownViewer content={aiResult} />
                </div>
              )}
            </div>

            {!aiLoading && aiResult && !aiResult.startsWith('Error:') && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleApplyAiResult}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-1.5"
                >
                  Apply to Note Editor
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

