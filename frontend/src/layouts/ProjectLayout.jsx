import React, { useState, useEffect } from 'react';
import { useParams, NavLink, Outlet, Link } from 'react-router';
import api from '../services/api.js';
import {
  FolderKanban,
  FileText,
  UploadCloud,
  BarChart3,
  Share2,
  AlertTriangle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

export default function ProjectLayout() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(`/projects/${projectId}`);

      if (res.data.success) {
        setProject(res.data.project);
        setUserRole(res.data.userRole);
      } else {
        setError(res.data.message || 'Failed to load project');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Access denied or project not found'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium">
          Loading project workspace...
        </p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full p-8 text-center bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 mx-auto rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Workspace Restricted
          </h2>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {error || 'Unable to access this project.'}
          </p>

          <div className="mt-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navLinks = [
    {
      to: `/projects/${projectId}`,
      label: 'Overview & Team',
      icon: <FolderKanban className="w-5 h-5" />,
      end: true,
    },
    {
      to: `/projects/${projectId}/notes`,
      label: 'Markdown Notes',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      to: `/projects/${projectId}/files`,
      label: 'File Storage',
      icon: <UploadCloud className="w-5 h-5" />,
    },
    {
      to: `/projects/${projectId}/analytics`,
      label: 'Contribution Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      to: `/projects/${projectId}/share`,
      label: 'Public Sharing & AI README',
      icon: <Share2 className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90">
        {/* Project Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white truncate">
            {project.name}
          </h2>

          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {userRole || 'Member'}
            </span>

            {project.isPublic && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                Public
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>All Projects</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-2 px-1">
        {navLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] tracking-tight">
              {item.label.split(' ')[0]}
            </span>
          </NavLink>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
        <Outlet
          context={{
            project,
            setProject,
            userRole,
            refreshProject: fetchProjectDetails,
          }}
        />
      </main>
    </div>
  );
}