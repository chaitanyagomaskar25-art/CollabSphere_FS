import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  FolderKanban,
  Plus,
  Search,
  Tag,
  Users,
  Shield,
  Clock,
  ArrowRight,
  Loader2,
  FolderPlus,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedTag) params.tag = selectedTag;

      const res = await api.get('/projects', { params });
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedTag]);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(projects.flatMap((p) => p.tags || []))
  ).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Projects Workspace
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user?.name}</span>. Manage and collaborate on your active projects.
          </p>
        </div>

        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
          />
        </div>

        {allTags.length > 0 && (
          <div className="w-full sm:w-auto flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Tags:
            </span>
            <button
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                selectedTag === ''
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-medium">Fetching projects...</p>
        </div>
      ) : error ? (
        <div className="mt-8 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm">
          {error}
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <div className="mt-12 p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
            <FolderPlus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {search || selectedTag ? 'No matching projects found' : 'No projects yet'}
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {search || selectedTag
              ? 'Try adjusting your search criteria or tag filters to find what you need.'
              : 'Create your first collaboration workspace to manage notes, files, analytics, and AI assistance.'}
          </p>
          <div className="mt-6">
            <Link
              to="/projects/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create New Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const isOwner = project.owner?._id === user?._id;
            const userMember = project.members?.find((m) => m.user?._id === user?._id);
            const userRole = isOwner ? 'owner' : userMember?.role || 'member';

            return (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="group relative flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-200"
              >
                {/* Header: Title and Role Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {project.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 ${
                      userRole === 'owner'
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        : userRole === 'admin'
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {userRole}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                  {project.description || 'No description provided for this project.'}
                </p>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.tags.slice(0, 4).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                    {project.tags.length > 4 && (
                      <span className="text-[11px] text-slate-400 self-center">
                        +{project.tags.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer: Member avatars and Open CTA */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center -space-x-2 overflow-hidden">
                    {project.members?.slice(0, 4).map((m, i) => (
                      <div
                        key={i}
                        title={m.user?.name || 'Member'}
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-[10px] font-bold text-center leading-6 uppercase"
                      >
                        {m.user?.avatar ? (
                          <img
                            src={m.user.avatar}
                            alt=""
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          m.user?.name?.charAt(0) || 'U'
                        )}
                      </div>
                    ))}
                    {project.members?.length > 4 && (
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        +{project.members.length - 4}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Open Project
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

