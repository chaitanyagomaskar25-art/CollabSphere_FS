import React, { useState } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Edit3,
  Calendar,
  Tag,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  ExternalLink,
  LogOut,
  FolderKanban,
} from 'lucide-react';

export default function ProjectDetailsPage() {
  const { project, userRole, refreshProject } = useOutletContext();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Modals state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Edit project state
  const [editName, setEditName] = useState(project?.name || '');
  const [editDescription, setEditDescription] = useState(project?.description || '');
  const [editTags, setEditTags] = useState(project?.tags?.join(', ') || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // General feedback message
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin' || userRole === 'owner';

  // Handle Invite Member
  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');

    if (!inviteEmail.trim()) {
      setInviteError('Please enter user email address');
      return;
    }

    setIsInviting(true);
    try {
      const res = await api.post(`/projects/${project._id}/members`, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      if (res.data.success) {
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteRole('member');
        setFeedback({ type: 'success', message: res.data.message });
        refreshProject();
      }
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to invite user');
    } finally {
      setIsInviting(false);
    }
  };

  // Handle Role Change
  const handleRoleChange = async (targetUserId, newRole) => {
    try {
      const res = await api.patch(
        `/projects/${project._id}/members/${targetUserId}`,
        { role: newRole }
      );
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Member role updated successfully' });
        refreshProject();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update member role',
      });
    }
  };

  // Handle Member Removal / Leave
  const handleRemoveMember = async (targetUserId, isSelf = false) => {
    const confirmMsg = isSelf
      ? 'Are you sure you want to leave this project?'
      : 'Are you sure you want to remove this member from the project?';

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.delete(
        `/projects/${project._id}/members/${targetUserId}`
      );
      if (res.data.success) {
        if (isSelf) {
          navigate('/dashboard');
        } else {
          setFeedback({ type: 'success', message: 'Member removed from project' });
          refreshProject();
        }
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to remove member',
      });
    }
  };

  // Handle Edit Project
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const tagsArray = editTags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const res = await api.put(`/projects/${project._id}`, {
        name: editName.trim(),
        description: editDescription.trim(),
        tags: tagsArray,
      });

      if (res.data.success) {
        setShowEditModal(false);
        setFeedback({ type: 'success', message: 'Project details updated' });
        refreshProject();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update project',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async () => {
    try {
      const res = await api.delete(`/projects/${project._id}`);
      if (res.data.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete project',
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Feedback Banner */}
      {feedback.message && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback({ type: '', message: '' })}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Project Overview Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {project.name}
              </h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  userRole === 'owner'
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    : userRole === 'admin'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {userRole}
              </span>
              {project.isPublic && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Publicly Shared
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {project.description || 'No description provided.'}
            </p>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {project.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                  >
                    <Tag className="w-3 h-3 text-indigo-500" />#{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Created {new Date(project.createdAt).toLocaleDateString()}
              </span>
              <span>•</span>
              <span>Owner: {project.owner?.name} ({project.owner?.email})</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <button
                onClick={() => {
                  setEditName(project.name);
                  setEditDescription(project.description || '');
                  setEditTags(project.tags?.join(', ') || '');
                  setShowEditModal(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Details
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Project
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Team Members Section */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Project Members ({project.members?.length || 0})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Collaborators who have access to this workspace
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Invite Teammate
            </button>
          )}
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-bold text-slate-400">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {project.members?.map((m) => {
                const memberUser = m.user;
                if (!memberUser) return null;
                const isProjectOwner = project.owner?._id === memberUser._id;
                const isMe = currentUser?._id === memberUser._id;

                return (
                  <tr key={memberUser._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase">
                        {memberUser.avatar ? (
                          <img
                            src={memberUser.avatar}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          memberUser.name?.charAt(0) || 'U'
                        )}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {memberUser.name} {isMe && '(You)'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                      {memberUser.email}
                    </td>

                    <td className="py-3.5 px-4">
                      {isOwner && !isProjectOwner ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(memberUser._id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            m.role === 'owner'
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                              : m.role === 'admin'
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {m.role}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {!isProjectOwner && (
                        <>
                          {/* Owner or Admin removing a member, or user leaving */}
                          {(isOwner || (isAdmin && m.role === 'member') || isMe) && (
                            <button
                              onClick={() => handleRemoveMember(memberUser._id, isMe)}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            >
                              {isMe ? 'Leave Project' : 'Remove'}
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Invite Registered User
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  User Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@collabsphere.dev"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Must be an existing registered user on CollabSphere.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="member">Member (Can edit notes and upload files)</option>
                  <option value="admin">Admin (Can also manage members and project settings)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Edit Project Details
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="React, MongoDB, Cloudinary"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900 p-6 sm:p-8">
            <div className="w-12 h-12 mx-auto rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center">
              Delete this project?
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              This action is permanent and will delete all associated notes, files, analytics, and memberships for <span className="font-semibold text-slate-800 dark:text-slate-200">{project.name}</span>.
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Keep Project
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20"
              >
                Yes, Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

