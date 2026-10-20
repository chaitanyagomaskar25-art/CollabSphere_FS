import React, { useState } from "react";
import { useOutletContext, Link } from "react-router";
import api from "../services/api.js";
import MarkdownViewer from "../components/MarkdownViewer.jsx";
import {
  Share2,
  Globe,
  Sparkles,
  Copy,
  Check,
  Download,
  Save,
  Loader2,
  ExternalLink,
  Shield,
  AlertCircle,
  CheckCircle2,
  FileText,
  Eye,
  Edit3,
} from "lucide-react";

export default function ProjectSharePage() {
  const { project, userRole, refreshProject } = useOutletContext();

  const [isPublic, setIsPublic] = useState(project.isPublic || false);
  const [shareId, setShareId] = useState(project.publicShareId || "");
  const [publicReadmeEnabled, setPublicReadmeEnabled] = useState(
    project.publicReadmeEnabled || false,
  );
  const [readmeContent, setReadmeContent] = useState(
    project.publicReadmeContent ||
      `# ${project.name}\n\n${project.description || "Project Overview"}\n\n## Tech Stack\n${
        project.tags?.map((t) => `- ${t}`).join("\n") || "- React\n- Node.js"
      }`,
  );

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedReadme, setCopiedReadme] = useState(false);
  const [previewTab, setPreviewTab] = useState("write"); // 'write', 'preview'

  const [isToggling, setIsToggling] = useState(false);
  const [isSavingReadme, setIsSavingReadme] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const publicUrl = shareId
    ? `${window.location.origin}/public/${shareId}`
    : "";

  const isAdmin = userRole === "admin" || userRole === "owner";

  // Toggle Public Sharing
  const handleToggleSharing = async () => {
    if (!isAdmin) return;
    setIsToggling(true);
    setStatusMessage({ type: "", text: "" });

    try {
      if (isPublic) {
        // Disable
        const res = await api.patch(`/projects/${project._id}/share`);
        if (res.data.success) {
          setIsPublic(false);
          setStatusMessage({
            type: "success",
            text: "Public sharing disabled",
          });
          refreshProject();
        }
      } else {
        // Enable
        const res = await api.post(`/projects/${project._id}/share`, {
          publicReadmeEnabled,
          publicReadmeContent: readmeContent,
        });
        if (res.data.success) {
          setIsPublic(true);
          setShareId(res.data.publicShareId);
          setStatusMessage({
            type: "success",
            text: "Public showcase enabled and unique link generated!",
          });
          refreshProject();
        }
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || "Error updating sharing state",
      });
    } finally {
      setIsToggling(false);
    }
  };

  // Save README configuration
  const handleSaveReadme = async () => {
    if (!isAdmin) return;
    setIsSavingReadme(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const res = await api.post(`/projects/${project._id}/share`, {
        publicReadmeEnabled,
        publicReadmeContent: readmeContent,
      });

      if (res.data.success) {
        setStatusMessage({
          type: "success",
          text: "Public README saved successfully",
        });
        refreshProject();
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save README",
      });
    } finally {
      setIsSavingReadme(false);
    }
  };

  // Generate README with Gemini AI
  const handleGenerateAiReadme = async () => {
    setIsGeneratingAi(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const res = await api.post("/gemini/readme", {
        name: project.name,
        description: project.description,
        technologies: project.tags      
      });

      if (res.data.success) {
        setReadmeContent(res.data.result);
        setPublicReadmeEnabled(true);
        setPreviewTab("preview");
        setStatusMessage({
          type: "success",
          text: "AI README generated successfully! Review below and click Save.",
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to generate README with Gemini",
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyReadmeToClipboard = () => {
    navigator.clipboard.writeText(readmeContent);
    setCopiedReadme(true);
    setTimeout(() => setCopiedReadme(false), 2000);
  };

  const downloadReadmeFile = () => {
    const element = document.createElement("a");
    const file = new Blob([readmeContent], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}-README.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Share2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Public Sharing & AI README
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Publish read-only project showcases and auto-generate Markdown
          documentation with Gemini
        </p>
      </div>

      {/* Status Feedback */}
      {statusMessage.text && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs sm:text-sm ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Sharing Control Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-500" />
              Public Project Showcase
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              When enabled, a unique unguessable public link is generated.
              Anyone with the link can view your project title, description,
              tags, and public README without logging in. Private notes, files,
              and members remain protected.
            </p>
          </div>

          {isAdmin ? (
            <button
              onClick={handleToggleSharing}
              disabled={isToggling}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm shrink-0 ${
                isPublic
                  ? "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isToggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPublic ? (
                "Disable Public Access"
              ) : (
                "Enable Public Sharing"
              )}
            </button>
          ) : (
            <span className="text-xs text-slate-400 italic">
              Only project admins can toggle public sharing.
            </span>
          )}
        </div>

        {/* Public Link Box */}
        {isPublic && shareId && (
          <div className="mt-6 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider mb-1">
                Your Public Read-Only URL
              </p>
              <p className="text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 truncate">
                {publicUrl}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={copyLinkToClipboard}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Link
                  </>
                )}
              </button>

              <a
                href={publicUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Public Page
              </a>
            </div>
          </div>
        )}
      </div>

      {/* AI README Section */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Project README & Documentation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Generate a professional Markdown README with Google Gemini AI or
              write your own
            </p>
          </div>

          {/* AI Generate Button */}
          {isAdmin && (
            <button
              onClick={handleGenerateAiReadme}
              disabled={isGeneratingAi}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all self-start sm:self-auto"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate README with Gemini AI
                </>
              )}
            </button>
          )}
        </div>

        {/* README Inclusion Toggle & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={publicReadmeEnabled}
              onChange={(e) => setPublicReadmeEnabled(e.target.checked)}
              disabled={!isAdmin}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Include this README on the public project page</span>
          </label>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewTab("write")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  previewTab === "write"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Editor
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("preview")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  previewTab === "preview"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
            </div>

            <button
              onClick={copyReadmeToClipboard}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              title="Copy Markdown"
            >
              {copiedReadme ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={downloadReadmeFile}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              title="Download README.md"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* README Editor / Preview Container */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden min-h-[350px]">
          {previewTab === "write" ? (
            <textarea
              rows={16}
              value={readmeContent}
              onChange={(e) => setReadmeContent(e.target.value)}
              disabled={!isAdmin}
              placeholder="Write or paste your Markdown README here..."
              className="w-full p-4 bg-slate-50/50 dark:bg-slate-950/50 font-mono text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
            />
          ) : (
            <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 overflow-y-auto max-h-[500px]">
              <MarkdownViewer content={readmeContent} />
            </div>
          )}
        </div>

        {/* Save README Action */}
        {isAdmin && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveReadme}
              disabled={isSavingReadme}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm flex items-center gap-2"
            >
              {isSavingReadme ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save README Configuration
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
