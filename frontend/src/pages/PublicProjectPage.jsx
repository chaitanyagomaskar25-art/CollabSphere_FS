import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import axios from 'axios';
import MarkdownViewer from '../components/MarkdownViewer.jsx';
import {
  Globe,
  Tag,
  Calendar,
  Layers,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function PublicProjectPage() {
  const { shareId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

const { user } = useAuth();
useEffect(() => {
  const fetchPublicData = async () => {
    try {
      setLoading(true);
      setError("");
      setProject(null);

      const res = await fetch(
        `http://localhost:3000/api/public/projects/${shareId}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "This project is private or does not exist"
        );
      }

      if (data.success && data.project) {
        setProject(data.project);
      } else {
        throw new Error(
          data.message || "Unable to retrieve public project"
        );
      }
    } catch (err) {
      console.error("Failed to fetch public project:", err);

      setError(
        err.message || "This project is private or does not exist"
      );
    } finally {
      setLoading(false);
    }
  };

  if (shareId) {
    fetchPublicData();
  } else {
    setError("Public share ID is missing");
    setLoading(false);
  }
}, [shareId]);


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium">Loading public project showcase...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full p-8 text-center bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 mb-4">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Project Unavailable
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {error || 'This project showcase is not available or sharing was disabled.'}
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md"
            >
              Back to CollabSphere Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Banner Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/20">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              CollabSphere
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Globe className="w-3.5 h-3.5" />
              Public Showcase
            </span>
           
{!user && (
  <Link
    to="/register"
    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
  >
    Sign Up Free
    <ArrowRight className="w-3.5 h-3.5" />
  </Link>
)}

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8 flex-1 space-y-8 w-full">
        {/* Project Header Card */}
        <div className="p-6 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {project.name}
            </h1>
          </div>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {project.description || 'No description provided.'}
          </p>

          {/* Tech Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {project.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold"
                >
                  <Tag className="w-3 h-3" />#{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center uppercase">
                {project.owner?.avatar ? (
                  <img src={project.owner.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  project.owner?.name?.charAt(0) || 'M'
                )}
              </div>
              Maintained by <span className="font-semibold text-slate-700 dark:text-slate-300">{project.owner?.name}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Published {new Date(project.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Public README Showcase */}
        {project.publicReadmeEnabled && project.publicReadmeContent && (
          <div className="p-6 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                README.md
              </h2>
              <span className="text-xs text-slate-400 font-mono">Rendered with GitHub-Flavored Markdown</span>
            </div>

            <div className="overflow-x-auto">
              <MarkdownViewer content={project.publicReadmeContent} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CollabSphere. Public Project Showcase.</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Verified Public Showcase</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

