import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import api from '../services/api.js';
import {
  BarChart3,
  FileText,
  UploadCloud,
  Users,
  Activity as ActivityIcon,
  PieChart as PieChartIcon,
  Loader2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Tag,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function ProjectAnalyticsPage() {
  const { project } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/projects/${project._id}/analytics`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [project._id]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  const formatActivityMessage = (act) => {
    const actor = act.user?.name || 'A teammate';
    switch (act.action) {
      case 'project_created':
        return `${actor} created the project workspace`;
      case 'project_updated':
        return `${actor} updated project settings`;
      case 'member_invited':
        return `${actor} invited ${act.targetName || 'a new member'} (${act.metadata?.role || 'member'})`;
      case 'member_removed':
        return `${actor} removed a member from the project`;
      case 'member_role_updated':
        return `${actor} changed member role to ${act.metadata?.newRole || 'member'}`;
      case 'note_created':
        return `${actor} wrote note "${act.targetName}"`;
      case 'note_updated':
        return `${actor} updated note "${act.targetName}"`;
      case 'note_deleted':
        return `${actor} deleted note "${act.targetName}"`;
      case 'file_uploaded':
        return `${actor} uploaded file "${act.targetName}"`;
      case 'file_deleted':
        return `${actor} deleted file "${act.targetName}"`;
      case 'project_published':
        return `${actor} enabled public sharing`;
      case 'project_unpublished':
        return `${actor} disabled public sharing`;
      default:
        return `${actor} performed ${act.action}`;
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium">Aggregating project analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm">
        {error || 'Unable to display analytics'}
      </div>
    );
  }

  // Prep pie chart data
  const pieData = (data.filesByCategory || []).map((cat) => ({
    name: cat._id ? cat._id.toUpperCase() : 'OTHER',
    value: cat.count,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Contribution Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Real-time metrics derived from MongoDB database records and team activities
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Notes
            </p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {data.summary.totalNotes}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Files
            </p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {data.summary.totalFiles}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Members
            </p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {data.summary.totalMembers}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ActivityIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Events
            </p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {data.summary.totalActivities}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts BarChart: Member Contributions */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            Member Contributions (Notes & Files)
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Comparative contributions authored by each team member
          </p>

          <div className="h-72 w-full">
            {data.memberContributions.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No member activity recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.memberContributions} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="notesCount" name="Notes Authored" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="filesCount" name="Files Uploaded" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recharts PieChart: File Categories */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-emerald-500" />
            File Category Breakdown
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Distribution of uploaded assets
          </p>

          <div className="h-64 w-full flex-1 flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400">No files uploaded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Chronological Activity Feed */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          Recent Project Activity Log
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Audit timeline of recent project events and contributions
        </p>

        {data.recentActivities.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No activity recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {data.recentActivities.map((act) => (
              <div
                key={act._id}
                className="flex items-start gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800/80 last:border-0 last:pb-0"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase shrink-0 mt-0.5">
                  {act.user?.avatar ? (
                    <img src={act.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    act.user?.name?.charAt(0) || 'U'
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                    {formatActivityMessage(act)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(act.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

