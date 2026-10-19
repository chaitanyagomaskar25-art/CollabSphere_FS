import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import MarkdownViewer from "../components/MarkdownViewer.jsx";
import {
  UploadCloud,
  FileText,
  FileCode,
  Image as ImageIcon,
  File,
  Download,
  Trash2,
  Eye,
  Search,
  Sparkles,
  Loader2,
  X,
  AlertCircle,
  CheckCircle,
  Copy,
  Check,
  FolderOpen,
  BookOpen,
} from "lucide-react";

export default function ProjectFilesPage() {
  const { project, userRole } = useOutletContext();
  const { user: currentUser } = useAuth();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  // Preview Modal state
  const [previewFile, setPreviewFile] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Gemini AI modal state
  const [aiModal, setAiModal] = useState({
    open: false,
    title: "",
    content: "",
    loading: false,
  });

  // Status feedback
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (categoryFilter !== "all") params.category = categoryFilter;

      const res = await api.get(`/projects/${project._id}/files`, { params });
      if (res.data.success) {
        setFiles(res.data.files);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFiles();
    }, 200);
    return () => clearTimeout(timer);
  }, [project._id, search, categoryFilter]);

  // Handle File Selection
  const handleFileUpload = async (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds the 10MB limit");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await api.post(`/projects/${project._id}/files`, formData);

      if (res.data.success) {
        setStatusMessage({
          type: "success",
          text: `Uploaded ${selectedFile.name} successfully`,
        });
        fetchFiles();
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle File Deletion
  const handleDeleteFile = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) return;

    try {
      const res = await api.delete(`/projects/${project._id}/files/${fileId}`);
      if (res.data.success) {
        setStatusMessage({
          type: "success",
          text: "File deleted successfully",
        });
        setFiles(files.filter((f) => f._id !== fileId));
        if (previewFile?._id === fileId) setPreviewFile(null);
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete file",
      });
    }
  };

  // Trigger Gemini Explain on Code File
  const handleAiExplainCode = async (file) => {
    if (!file.textContent) return;

    setAiModal({
      open: true,
      title: `Gemini AI Explanation: ${file.originalName}`,
      content: "",
      loading: true,
    });

    try {
      const ext = file.originalName.split(".").pop() || "javascript";
      const res = await api.post("/gemini/explain", {
        text: file.textContent,
        context: "code",
        language: ext,
      });

      if (res.data.success) {
        setAiModal((prev) => ({
          ...prev,
          content: res.data.result,
          loading: false,
        }));
      }
    } catch (err) {
      setAiModal((prev) => ({
        ...prev,
        content: `Error: ${err.response?.data?.message || "Failed to generate code explanation"}`,
        loading: false,
      }));
    }
  };

  // const handleDownloadFile = async (file) => {
  //   try {
  //     const response = await api.get(
  //       `/projects/${project._id}/files/${file._id}/download`,
  //       { responseType: "blob" },
  //     );

  //     const contentType = response.headers["content-type"] || "";

  //     if (
  //       contentType.includes("application/json") ||
  //       contentType.includes("text/html")
  //     ) {
  //       const errorText = await response.data.text();
  //       let message = "The server did not return a valid file.";

  //       try {
  //         const errorData = JSON.parse(errorText);
  //         message = errorData.message || message;
  //       } catch {
  //         // Keep the default message.
  //       }

  //       throw new Error(message);
  //     }

  //     const blobUrl = URL.createObjectURL(response.data);
  //     const link = document.createElement("a");

  //     link.href = blobUrl;
  //     link.download = file.originalName || "download";
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();

  //     setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  //   } catch (error) {
  //     console.error("Download failed:", error);

  //     setStatusMessage({
  //       type: "error",
  //       text: error.message || "Failed to download file.",
  //     });
  //   }
  // };

  // Trigger Gemini Generate Docs on Code File
  
  
  const handleAiGenerateDocs = async (file) => {
    if (!file.textContent) return;

    setAiModal({
      open: true,
      title: `Gemini AI Code Documentation: ${file.originalName}`,
      content: "",
      loading: true,
    });

    try {
      const ext = file.originalName.split(".").pop() || "javascript";
      const res = await api.post("/gemini/docs", {
        code: file.textContent,
        language: ext,
        title: file.originalName,
      });

      if (res.data.success) {
        setAiModal((prev) => ({
          ...prev,
          content: res.data.result,
          loading: false,
        }));
      }
    } catch (err) {
      setAiModal((prev) => ({
        ...prev,
        content: `Error: ${err.response?.data?.message || "Failed to generate documentation"}`,
        loading: false,
      }));
    }
  };

  const copyCodeToClipboard = () => {
    if (!previewFile?.textContent) return;
    navigator.clipboard.writeText(previewFile.textContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "image":
        return <ImageIcon className="w-5 h-5 text-sky-500" />;
      case "code":
        return <FileCode className="w-5 h-5 text-indigo-500" />;
      case "document":
        return <FileText className="w-5 h-5 text-amber-500" />;
      default:
        return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            File Management & Assets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Store code files, design assets, and documentation securely with
            Cloudinary
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          Upload New File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          className="hidden"
        />
      </div>

      {/* Status banner */}
      {statusMessage.text && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage({ type: "", text: "" })}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      {/* File Upload Section */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer transition-all"
      >
        <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {isUploading ? "Uploading file..." : "Click here to upload files"}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Supports Images, Code (.js, .py, .ts, .json), PDF, Text (Max 10MB)
        </p>

        {uploadError && (
          <p className="text-xs text-rose-500 font-medium mt-2">
            {uploadError}
          </p>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "all", label: "All Files" },
            { id: "code", label: "Code & Scripts" },
            { id: "image", label: "Images" },
            { id: "document", label: "Documents" },
            { id: "other", label: "Other" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Files List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            Loading project files...
          </div>
        ) : files.length === 0 ? (
          <div className="p-16 text-center">
            <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No files found
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Upload source code, screenshots, diagrams, or documentation to
              collaborate with your team.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400">
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {files.map((file) => {
                  const isUploader = file.uploader?._id === currentUser?._id;
                  const canDelete =
                    isUploader || userRole === "admin" || userRole === "owner";

                  return (
                    <tr
                      key={file._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                          {getCategoryIcon(file.category)}
                        </div>
                        <span className="truncate max-w-[220px] sm:max-w-xs">
                          {file.originalName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                          {file.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {formatFileSize(file.size)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {file.uploader?.name || "Teammate"}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1">
                        {/* Preview button for supported types */}
                        {(file.category === "image" ||
                          file.category === "code") && (
                          <button
                            onClick={() => setPreviewFile(file)}
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Preview file"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {/* AI Explain button on Code files */}
                        {file.category === "code" && file.textContent && (
                          <button
                            onClick={() => handleAiExplainCode(file)}
                            className="p-1.5 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/50 rounded-lg transition-colors"
                            title="Explain Code with Gemini AI"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        )}

                        {/* Download button */}

                        <button
                          type="button"
                          // onClick={() => handleDownloadFile(file)}
                          className="inline-flex p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Delete button */}
                        {canDelete && (
                          <button
                            onClick={() =>
                              handleDeleteFile(file._id, file.originalName)
                            }
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Delete file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  {getCategoryIcon(previewFile.category)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {previewFile.originalName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {formatFileSize(previewFile.size)} • Uploaded by{" "}
                    {previewFile.uploader?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previewFile.category === "code" && (
                  <>
                    <button
                      onClick={() => handleAiExplainCode(previewFile)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Explain Code
                    </button>
                    <button
                      onClick={() => handleAiGenerateDocs(previewFile)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Generate Docs
                    </button>
                    <button
                      onClick={copyCodeToClipboard}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Copy code"
                    >
                      {copiedCode ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  // onClick={() => handleDownloadFile(previewFile)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {previewFile.category === "image" ? (
                <div className="flex items-center justify-center">
                  <img
                    src={previewFile.url}
                    alt={previewFile.originalName}
                    className="max-h-[60vh] rounded-xl object-contain shadow-sm border border-slate-200 dark:border-slate-800"
                  />
                </div>
              ) : previewFile.category === "code" ? (
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                  <code>
                    {previewFile.textContent ||
                      "No text content available to display."}
                  </code>
                </pre>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <File className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold">
                    Preview not available for this file type
                  </p>
                  <button
                    type="button"
                    // onClick={() => handleDownloadFile(previewFile)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Download className="w-4 h-4" />
                    Download to View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gemini Code Analysis Modal */}
      {aiModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {aiModal.title}
                </h3>
              </div>
              <button
                onClick={() =>
                  setAiModal({
                    open: false,
                    title: "",
                    content: "",
                    loading: false,
                  })
                }
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {aiModal.loading ? (
                <div className="py-16 text-center text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
                  <p className="text-sm font-semibold">
                    Gemini AI is analyzing this code...
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Inspecting function logic, arguments, complexity, and
                    potential bugs
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <MarkdownViewer content={aiModal.content} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
