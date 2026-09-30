import React from 'react';
import {
  Github,
  GitBranch,
  CheckCircle2,
  XCircle,
  LogOut,
  FolderGit2,
  AlertCircle,
  Activity,
  Building2,
  Settings2,
  Plus,
  ExternalLink
} from 'lucide-react';
import { GitHubUser } from '../types/github';

interface HeaderProps {
  user: GitHubUser | null;
  activeTab: 'repos' | 'issues' | 'activity' | 'orgs' | 'settings';
  setActiveTab: (tab: 'repos' | 'issues' | 'activity' | 'orgs' | 'settings') => void;
  onOpenConnect: () => void;
  onOpenCreateRepo: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenConnect,
  onOpenCreateRepo,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700 flex items-center justify-center shadow-inner">
              <Github className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">GitHub Hub</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Developer Workspace & OAuth Manager</p>
            </div>
          </div>

          {/* Navigation Tabs (if logged in) */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
              <button
                onClick={() => setActiveTab('repos')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'repos'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                Repositories
              </button>

              <button
                onClick={() => setActiveTab('issues')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'issues'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Issues
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'activity'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Activity
              </button>

              <button
                onClick={() => setActiveTab('orgs')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'orgs'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Organizations
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                Setup & Config
              </button>
            </nav>
          )}

          {/* Action buttons / User profile */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenCreateRepo}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Repo
                </button>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <a
                    href={user.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
                    title={`View @${user.login} on GitHub`}
                  >
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover ring-2 ring-indigo-500/20"
                    />
                    <div className="hidden lg:block text-left">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors flex items-center gap-1">
                        @{user.login}
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </div>
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Connected
                      </div>
                    </div>
                  </a>

                  <button
                    onClick={onLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Disconnect GitHub"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenConnect}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
              >
                <Github className="w-4 h-4" />
                Connect GitHub
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        {user && (
          <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-slate-800/80 scrollbar-none">
            <button
              onClick={() => setActiveTab('repos')}
              className={`px-3 py-1 rounded-md text-xs font-medium shrink-0 ${
                activeTab === 'repos' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Repos
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-3 py-1 rounded-md text-xs font-medium shrink-0 ${
                activeTab === 'issues' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Issues
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-3 py-1 rounded-md text-xs font-medium shrink-0 ${
                activeTab === 'activity' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('orgs')}
              className={`px-3 py-1 rounded-md text-xs font-medium shrink-0 ${
                activeTab === 'orgs' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Organizations
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1 rounded-md text-xs font-medium shrink-0 ${
                activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              OAuth Settings
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
