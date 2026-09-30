import React, { useState, useEffect } from 'react';
import {
  Github,
  FolderGit2,
  AlertCircle,
  Activity,
  Building2,
  Settings2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  Sparkles,
  GitPullRequest,
  Check,
  Copy,
  LogOut,
  Info
} from 'lucide-react';
import { api, authStorage } from './services/api';
import {
  GitHubUser,
  GitHubRepo,
  GitHubIssue,
  GitHubEvent,
  GitHubOrg,
  AuthStatusResponse,
} from './types/github';
import { Header } from './components/Header';
import { UserProfileCard } from './components/UserProfileCard';
import { RepoCard } from './components/RepoCard';
import { RepoDetailModal } from './components/RepoDetailModal';
import { CreateRepoModal } from './components/CreateRepoModal';
import { CreateIssueModal } from './components/CreateIssueModal';
import { ActivityFeed } from './components/ActivityFeed';
import { ConnectModal } from './components/ConnectModal';
import { OAuthGuide } from './components/OAuthGuide';

export default function App() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authConfig, setAuthConfig] = useState<AuthStatusResponse | null>(null);

  // Data states
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [orgs, setOrgs] = useState<GitHubOrg[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);

  // UI Navigation & Filters
  const [activeTab, setActiveTab] = useState<'repos' | 'issues' | 'activity' | 'orgs' | 'settings'>('repos');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'name'>('updated');
  const [issueStateFilter, setIssueStateFilter] = useState<'open' | 'closed' | 'all'>('open');

  // Modals
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isCreateRepoOpen, setIsCreateRepoOpen] = useState(false);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [selectedRepoForDetail, setSelectedRepoForDetail] = useState<GitHubRepo | null>(null);
  const [selectedRepoForIssue, setSelectedRepoForIssue] = useState<GitHubRepo | null>(null);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const status = await api.getAuthStatus();
      setAuthConfig(status);
      if (status.authenticated && status.user) {
        setUser(status.user);
        loadUserData();
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to verify GitHub session:', err);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const loadUserData = async () => {
    loadRepos();
    loadIssues();
    loadEvents();
    loadOrgs();
  };

  const loadRepos = async () => {
    try {
      setIsLoadingRepos(true);
      const data = await api.getRepos({ sort: 'updated', direction: 'desc' });
      setRepos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load repos:', err);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const loadIssues = async (filter: 'open' | 'closed' | 'all' = issueStateFilter) => {
    try {
      setIsLoadingIssues(true);
      const data = await api.getIssues(filter);
      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setIsLoadingIssues(false);
    }
  };

  const loadEvents = async () => {
    try {
      setIsLoadingEvents(true);
      const data = await api.getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const loadOrgs = async () => {
    try {
      setIsLoadingOrgs(true);
      const data = await api.getOrgs();
      setOrgs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load organizations:', err);
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      setRepos([]);
      setIssues([]);
      setEvents([]);
      setOrgs([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleAuthSuccess = (connectedUser: GitHubUser) => {
    setUser(connectedUser);
    loadUserData();
  };

  // Filtered & sorted repos
  const filteredRepos = repos.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.language && r.language.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesVisibility =
      visibilityFilter === 'all' ||
      (visibilityFilter === 'private' && r.private) ||
      (visibilityFilter === 'public' && !r.private);

    return matchesSearch && matchesVisibility;
  }).sort((a, b) => {
    if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const devCallbackUrl =
    authConfig?.urls?.devCallbackUrl ||
    'https://ais-dev-no6nd5wi2nkgy347myurav-171486266440.asia-southeast1.run.app/auth/callback';
  const sharedCallbackUrl =
    authConfig?.urls?.sharedCallbackUrl ||
    'https://ais-pre-no6nd5wi2nkgy347myurav-171486266440.asia-southeast1.run.app/auth/callback';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenConnect={() => setIsConnectModalOpen(true)}
        onOpenCreateRepo={() => setIsCreateRepoOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingAuth ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-400">Checking GitHub connection status...</p>
          </div>
        ) : !user ? (
          /* Disconnected Landing View */
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-950 border border-slate-800/80 p-8 sm:p-12 text-center shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                GitHub OAuth & API Workspace
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-3xl mx-auto leading-tight sm:leading-tight">
                Connect your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400">GitHub Account</span> to get started
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Seamlessly inspect repositories, view commit logs, open issues, toggle stars, and track your development activity with secure OAuth authorization.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setIsConnectModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Github className="w-5 h-5" />
                  Connect GitHub Now
                </button>

                <a
                  href="#setup-guide"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Info className="w-4 h-4 text-slate-400" />
                  View OAuth Setup Instructions
                </a>
              </div>

              {/* Feature Cards Grid */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">Full Repo Management</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Search repositories, filter by language or visibility, inspect commit history, and create new repos.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">Issue Tracker & Creator</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Inspect assigned issues across all repositories and report new issues directly into any project.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">Live Developer Feed</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Real-time timeline of your recent commits, branch pushes, pull requests, and starred projects.
                  </p>
                </div>
              </div>
            </div>

            {/* OAuth Setup Guide */}
            <div id="setup-guide">
              <OAuthGuide
                devCallbackUrl={devCallbackUrl}
                sharedCallbackUrl={sharedCallbackUrl}
                hasOAuthConfig={authConfig?.hasOAuthConfig}
              />
            </div>
          </div>
        ) : (
          /* Connected User Workspace */
          <div className="space-y-8">
            {/* User Profile Bar */}
            <UserProfileCard user={user} />

            {/* Tab: Repositories */}
            {activeTab === 'repos' && (
              <div className="space-y-6">
                {/* Search & Filter Controls */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search repositories by name, description, or language..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    {/* Visibility Filter */}
                    <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs shrink-0">
                      <button
                        onClick={() => setVisibilityFilter('all')}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          visibilityFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setVisibilityFilter('public')}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          visibilityFilter === 'public' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        Public
                      </button>
                      <button
                        onClick={() => setVisibilityFilter('private')}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          visibilityFilter === 'private' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        Private
                      </button>
                    </div>

                    {/* Sort Dropdown */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
                    >
                      <option value="updated">Recently Updated</option>
                      <option value="stars">Most Stars</option>
                      <option value="name">Name (A-Z)</option>
                    </select>

                    {/* Refresh */}
                    <button
                      onClick={loadRepos}
                      disabled={isLoadingRepos}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white shrink-0"
                      title="Refresh repositories"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingRepos ? 'animate-spin text-indigo-400' : ''}`} />
                    </button>

                    {/* New Repo button */}
                    <button
                      onClick={() => setIsCreateRepoOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shrink-0 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New Repo
                    </button>
                  </div>
                </div>

                {/* Repositories Grid */}
                {isLoadingRepos ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="h-44 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse"
                      />
                    ))}
                  </div>
                ) : filteredRepos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRepos.map((repo) => (
                      <RepoCard
                        key={repo.id}
                        repo={repo}
                        onSelect={(r) => setSelectedRepoForDetail(r)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
                    <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-slate-300">No repositories matched your filters</h3>
                    <p className="text-xs text-slate-500 mt-1">Try clearing your search query or visibility filter.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Issues & PRs */}
            {activeTab === 'issues' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => {
                        setIssueStateFilter('open');
                        loadIssues('open');
                      }}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        issueStateFilter === 'open' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Open Issues
                    </button>
                    <button
                      onClick={() => {
                        setIssueStateFilter('closed');
                        loadIssues('closed');
                      }}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        issueStateFilter === 'closed' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Closed Issues
                    </button>
                    <button
                      onClick={() => {
                        setIssueStateFilter('all');
                        loadIssues('all');
                      }}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        issueStateFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      All Issues
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadIssues(issueStateFilter)}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                      title="Refresh issues"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingIssues ? 'animate-spin text-indigo-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRepoForIssue(repos[0] || null);
                        setIsCreateIssueOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Open New Issue
                    </button>
                  </div>
                </div>

                {isLoadingIssues ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
                    ))}
                  </div>
                ) : issues.length > 0 ? (
                  <div className="space-y-3">
                    {issues.map((issue) => {
                      const isPR = Boolean(issue.pull_request);
                      const issueDate = new Date(issue.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      });
                      const repoName = issue.repository?.name || issue.repository_url?.split('/').pop() || 'repo';

                      return (
                        <div
                          key={issue.id}
                          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start gap-3.5"
                        >
                          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                            {isPR ? (
                              <GitPullRequest className="w-4 h-4 text-purple-400" />
                            ) : issue.state === 'open' ? (
                              <AlertCircle className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-purple-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs font-mono text-slate-400">{repoName}</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-xs font-mono text-slate-500">#{issue.number}</span>
                              {issue.state === 'open' ? (
                                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                  Open
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                                  Closed
                                </span>
                              )}
                            </div>

                            <a
                              href={issue.html_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium text-white hover:text-indigo-300 transition-colors inline-block"
                            >
                              {issue.title}
                            </a>

                            {issue.labels && issue.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {issue.labels.map((l) => (
                                  <span
                                    key={l.id}
                                    style={{ borderColor: `#${l.color}40`, color: `#${l.color}` }}
                                    className="text-[10px] px-2 py-0.5 rounded-full border bg-slate-950"
                                  >
                                    {l.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                              <span>Opened by @{issue.user.login}</span>
                              <span>•</span>
                              <span>{issueDate}</span>
                              {issue.comments > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{issue.comments} comments</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
                    <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-slate-300">No issues found</h3>
                    <p className="text-xs text-slate-500 mt-1">There are no {issueStateFilter} issues assigned to you.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Activity */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Recent GitHub Activity</h3>
                    <p className="text-xs text-slate-400">Pushes, repository events, and contributions</p>
                  </div>
                  <button
                    onClick={loadEvents}
                    disabled={isLoadingEvents}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingEvents ? 'animate-spin text-indigo-400' : ''}`} />
                  </button>
                </div>

                <ActivityFeed events={events} isLoading={isLoadingEvents} />
              </div>
            )}

            {/* Tab: Organizations */}
            {activeTab === 'orgs' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <h3 className="text-sm font-semibold text-white">GitHub Organizations</h3>
                    <p className="text-xs text-slate-400">Organizations and teams you belong to</p>
                  </div>
                  <button
                    onClick={loadOrgs}
                    disabled={isLoadingOrgs}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingOrgs ? 'animate-spin text-indigo-400' : ''}`} />
                  </button>
                </div>

                {isLoadingOrgs ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-28 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
                    ))}
                  </div>
                ) : orgs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {orgs.map((org) => (
                      <a
                        key={org.id}
                        href={org.html_url || `https://github.com/${org.login}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all flex items-center gap-4 group"
                      >
                        <img
                          src={org.avatar_url}
                          alt={org.login}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700 group-hover:border-indigo-500/50"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                            {org.login}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                            {org.description || 'GitHub organization'}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
                    <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-slate-300">No organizations found</h3>
                    <p className="text-xs text-slate-500 mt-1">You are not a member of any public GitHub organizations.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Settings & OAuth diagnostics */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                    <div>
                      <h3 className="text-base font-semibold text-white">Active Connection Details</h3>
                      <p className="text-xs text-slate-400">Authenticated user session and permissions</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-medium transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Disconnect Account
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block mb-1">User Account</span>
                      <span className="font-semibold text-white">
                        {user.name || user.login} (@{user.login})
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block mb-1">Status</span>
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Connected & Authenticated
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block mb-1">Active OAuth Scopes</span>
                      <span className="font-mono text-indigo-300">
                        read:user, user:email, repo, read:org
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block mb-1">GitHub API Rate Limit</span>
                      <span className="text-slate-300">5,000 requests / hr (Authenticated)</span>
                    </div>
                  </div>
                </div>

                <OAuthGuide
                  devCallbackUrl={devCallbackUrl}
                  sharedCallbackUrl={sharedCallbackUrl}
                  hasOAuthConfig={authConfig?.hasOAuthConfig}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={handleAuthSuccess}
        hasOAuthConfig={authConfig?.hasOAuthConfig || false}
        devCallbackUrl={devCallbackUrl}
      />

      <CreateRepoModal
        isOpen={isCreateRepoOpen}
        onClose={() => setIsCreateRepoOpen(false)}
        onCreated={(newRepo) => {
          setRepos((prev) => [newRepo, ...prev]);
          setSelectedRepoForDetail(newRepo);
        }}
      />

      <CreateIssueModal
        isOpen={isCreateIssueOpen}
        onClose={() => {
          setIsCreateIssueOpen(false);
          setSelectedRepoForIssue(null);
        }}
        repos={repos}
        selectedRepo={selectedRepoForIssue}
        onCreated={(newIssue) => {
          setIssues((prev) => [newIssue, ...prev]);
        }}
      />

      <RepoDetailModal
        repo={selectedRepoForDetail}
        onClose={() => setSelectedRepoForDetail(null)}
        onOpenCreateIssue={(repo) => {
          setSelectedRepoForDetail(null);
          setSelectedRepoForIssue(repo);
          setIsCreateIssueOpen(true);
        }}
      />
    </div>
  );
}
