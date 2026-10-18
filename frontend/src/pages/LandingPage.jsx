import React from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Sparkles,
  FolderKanban,
  FileText,
  UploadCloud,
  BarChart3,
  Globe,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Code2,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      icon: <FolderKanban className="w-6 h-6 text-indigo-500" />,
      title: 'Project Collaboration',
      description:
        'Organize team projects with role-based permissions (Owner, Admin, Member), invite teammates by email, and manage workflows with security.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-violet-500" />,
      title: 'Gemini AI Assistant',
      description:
        'Powered by Google Gemini to explain complex code, suggest documentation, improve notes readability, and auto-generate comprehensive README files.',
    },
    {
      icon: <FileText className="w-6 h-6 text-emerald-500" />,
      title: 'Markdown Notes',
      description:
        'Write project notes with instant live sanitized Markdown preview, code block highlighting, search filtering, and AI enhancement actions.',
    },
    {
      icon: <UploadCloud className="w-6 h-6 text-sky-500" />,
      title: 'Secure File Storage',
      description:
        'Upload project assets, code files, and documents securely with Cloudinary integration, preview images, and inspect code files inline.',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-amber-500" />,
      title: 'Contribution Analytics',
      description:
        'Interactive Recharts visualizations breaking down team notes, file uploads, member contributions, and chronological project activity feeds.',
    },
    {
      icon: <Globe className="w-6 h-6 text-fuchsia-500" />,
      title: 'Public Sharing',
      description:
        'Publish read-only overviews and READMEs with unique unguessable share links, perfect for client demos and open-source project showcases.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.950),theme(colors.slate.950))] opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Next-Gen Full-Stack Collaboration Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Collaborate, Build, and Ship with{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              AI-Powered Intelligence
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            CollabSphere unites project workspaces, rich Markdown documentation, secure asset management, contribution analytics, and Google Gemini developer tools in one unified platform.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="px-8 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Quick Features Row */}
          <div className="mt-14 pt-8 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              JWT & HttpOnly Cookies
            </span>
            <span className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-500" />
              Official Google GenAI SDK
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-500" />
              Cloudinary Media Storage
            </span>
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-500" />
              Recharts Analytics
            </span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-slate-100/50 dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Complete Feature Suite
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Engineered for developer teams and portfolios
            </p>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Everything you need to document, manage, and showcase production software projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CollabSphere — AI-Powered Team Collaboration Platform.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">Production-Ready Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

