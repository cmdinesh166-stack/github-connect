import React, { useState } from 'react';
import {
  Star,
  GitFork,
  AlertCircle,
  Lock,
  Globe,
  GitBranch,
  ExternalLink,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { GitHubRepo } from '../types/github';
import { api } from '../services/api';

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Shell: '#89e051',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
};

interface RepoCardProps {
  repo: GitHubRepo;
  onSelect: (repo: GitHubRepo) => void;
}

export const RepoCard: React.FC<RepoCardProps> = ({ repo, onSelect }) => {
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(repo.stargazers_count);
  const [isStarLoading, setIsStarLoading] = useState(false);
  const [checkedStar, setCheckedStar] = useState(false);

  // Lazy check star state on hover or first interaction
  const handleCheckStar = async () => {
    if (checkedStar) return;
    try {
      setCheckedStar(true);
      const starred = await api.isRepoStarred(repo.owner.login, repo.name);
      setIsStarred(starred);
    } catch {}
  };

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsStarLoading(true);
      if (isStarred) {
        await api.unstarRepo(repo.owner.login, repo.name);
        setIsStarred(false);
        setStarCount((c) => Math.max(0, c - 1));
      } else {
        await api.starRepo(repo.owner.login, repo.name);
        setIsStarred(true);
        setStarCount((c) => c + 1);
      }
    } catch (err) {
      console.error('Failed to toggle star:', err);
    } finally {
      setIsStarLoading(false);
    }
  };

  const langColor = repo.language ? languageColors[repo.language] || '#94a3b8' : '#94a3b8';
  const updatedDate = new Date(repo.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onClick={() => onSelect(repo)}
      onMouseEnter={handleCheckStar}
      className="group relative bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-lg hover:shadow-indigo-500/5"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 text-slate-300 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-colors">
              <GitBranch className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                {repo.name}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {repo.owner.login}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {repo.private ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <Lock className="w-2.5 h-2.5" />
                Private
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                <Globe className="w-2.5 h-2.5" />
                Public
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 mt-3 line-clamp-2 min-h-[32px] leading-relaxed">
          {repo.description || 'No description provided.'}
        </p>

        {/* Topics */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {repo.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-800/40"
              >
                {topic}
              </span>
            ))}
            {repo.topics.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 text-slate-500">
                +{repo.topics.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          {repo.language && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: langColor }}
              />
              {repo.language}
            </span>
          )}

          <button
            onClick={handleToggleStar}
            disabled={isStarLoading}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-colors ${
              isStarred
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
            title={isStarred ? 'Unstar repository' : 'Star repository'}
          >
            {isStarLoading ? (
              <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
            ) : (
              <Star
                className={`w-3 h-3 ${isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`}
              />
            )}
            <span className="text-[11px] font-mono">{starCount}</span>
          </button>

          {repo.forks_count > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <GitFork className="w-3 h-3" />
              {repo.forks_count}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500 group-hover:text-indigo-400 transition-colors">
          <span>Updated {updatedDate}</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
