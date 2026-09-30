import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  GitBranch,
  Star,
  GitFork,
  AlertCircle,
  Copy,
  Check,
  GitCommit,
  Lock,
  Globe,
  Loader2,
  Plus
} from 'lucide-react';
import { GitHubRepo, GitHubCommit } from '../types/github';
import { api } from '../services/api';

interface RepoDetailModalProps {
  repo: GitHubRepo | null;
  onClose: () => void;
  onOpenCreateIssue: (repo: GitHubRepo) => void;
}

export const RepoDetailModal: React.FC<RepoDetailModalProps> = ({
  repo,
  onClose,
  onOpenCreateIssue,
}) => {
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [languages, setLanguages] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!repo) return;
    let isMounted = true;

    async function loadDetails() {
      try {
        setIsLoading(true);
        const data = await api.getRepoDetails(repo!.owner.login, repo!.name);
        if (isMounted) {
          setCommits(data.commits || []);
          setLanguages(data.languages || {});
        }
      } catch (err) {
        console.error('Failed to load repo details:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [repo]);

  if (!repo) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Calculate languages percentage
  const totalLangBytes = Object.values(languages).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800 pr-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 text-sm font-mono">{repo.owner.login} /</span>
              <h2 className="text-xl font-bold text-white tracking-tight">{repo.name}</h2>
              {repo.private ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <Lock className="w-3 h-3" />
                  Private
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                  <Globe className="w-3 h-3" />
                  Public
                </span>
              )}
            </div>
            {repo.description && (
              <p className="text-xs text-slate-400 mt-1 max-w-xl">{repo.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenCreateIssue(repo)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Issue
            </button>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            >
              GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              Stars
            </div>
            <div className="text-base font-semibold text-white">{repo.stargazers_count}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <GitFork className="w-3.5 h-3.5 text-blue-400" />
              Forks
            </div>
            <div className="text-base font-semibold text-white">{repo.forks_count}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              Open Issues
            </div>
            <div className="text-base font-semibold text-white">{repo.open_issues_count}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              Default Branch
            </div>
            <div className="text-base font-semibold font-mono text-emerald-300">
              {repo.default_branch}
            </div>
          </div>
        </div>

        {/* Clone URLs */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Clone Repository
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* HTTPS */}
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                  HTTPS
                </span>
                <code className="text-xs font-mono text-indigo-300 truncate block">
                  {repo.clone_url}
                </code>
              </div>
              <button
                onClick={() => copyToClipboard(`git clone ${repo.clone_url}`, 'https')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
                title="Copy git clone HTTPS"
              >
                {copiedKey === 'https' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* SSH */}
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                  SSH
                </span>
                <code className="text-xs font-mono text-cyan-300 truncate block">
                  {repo.ssh_url}
                </code>
              </div>
              <button
                onClick={() => copyToClipboard(`git clone ${repo.ssh_url}`, 'ssh')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
                title="Copy git clone SSH"
              >
                {copiedKey === 'ssh' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Languages breakdown bar */}
        {totalLangBytes > 0 && (
          <div className="mb-6 space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Languages
            </h4>
            <div className="h-2 w-full rounded-full overflow-hidden flex bg-slate-800">
              {Object.entries(languages).map(([lang, bytes], i) => {
                const pct = ((bytes / totalLangBytes) * 100).toFixed(1);
                const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
                const color = colors[i % colors.length];
                return (
                  <div
                    key={lang}
                    style={{ width: `${pct}%`, backgroundColor: color }}
                    title={`${lang}: ${pct}%`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
              {Object.entries(languages).map(([lang, bytes], i) => {
                const pct = ((bytes / totalLangBytes) * 100).toFixed(1);
                const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
                const color = colors[i % colors.length];
                return (
                  <span key={lang} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-slate-300 font-medium">{lang}</span>
                    <span className="text-slate-500">{pct}%</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Commits */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <GitCommit className="w-4 h-4 text-indigo-400" />
              Recent Commits
            </h4>
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />}
          </div>

          {commits.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {commits.map((c) => {
                const commitDate = new Date(c.commit.author.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={c.sha}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-200 font-medium truncate line-clamp-1">
                        {c.commit.message.split('\n')[0]}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        {c.author?.avatar_url && (
                          <img
                            src={c.author.avatar_url}
                            alt=""
                            className="w-3.5 h-3.5 rounded-full"
                          />
                        )}
                        <span>{c.commit.author.name}</span>
                        <span>•</span>
                        <span>{commitDate}</span>
                      </div>
                    </div>

                    <a
                      href={c.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] text-indigo-400 hover:text-indigo-300 px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-900/60 shrink-0"
                    >
                      {c.sha.slice(0, 7)}
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-center text-xs text-slate-500">
              {isLoading ? 'Fetching commits...' : 'No recent commits found.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
