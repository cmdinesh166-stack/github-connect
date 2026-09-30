import React from 'react';
import {
  GitCommit,
  Star,
  GitBranch,
  AlertCircle,
  GitFork,
  Tag,
  ExternalLink,
  Layers
} from 'lucide-react';
import { GitHubEvent } from '../types/github';

interface ActivityFeedProps {
  events: GitHubEvent[];
  isLoading: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ events, isLoading }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PushEvent':
        return <GitCommit className="w-4 h-4 text-emerald-400" />;
      case 'WatchEvent':
        return <Star className="w-4 h-4 text-amber-400" />;
      case 'CreateEvent':
        return <GitBranch className="w-4 h-4 text-blue-400" />;
      case 'IssuesEvent':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'ForkEvent':
        return <GitFork className="w-4 h-4 text-purple-400" />;
      case 'ReleaseEvent':
        return <Tag className="w-4 h-4 text-cyan-400" />;
      default:
        return <Layers className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getEventText = (event: GitHubEvent) => {
    switch (event.type) {
      case 'PushEvent': {
        const commitCount = event.payload?.commits?.length || 1;
        return `Pushed ${commitCount} commit${commitCount === 1 ? '' : 's'} to ${event.repo.name}`;
      }
      case 'WatchEvent':
        return `Starred ${event.repo.name}`;
      case 'CreateEvent': {
        const refType = event.payload?.ref_type || 'repository';
        return `Created ${refType} in ${event.repo.name}`;
      }
      case 'IssuesEvent': {
        const action = event.payload?.action || 'updated';
        return `${action.charAt(0).toUpperCase() + action.slice(1)} issue in ${event.repo.name}`;
      }
      case 'ForkEvent':
        return `Forked ${event.repo.name}`;
      default:
        return `${event.type.replace('Event', '')} on ${event.repo.name}`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
        <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No recent GitHub activity found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const timeAgo = new Date(event.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const repoUrl = `https://github.com/${event.repo.name}`;

        return (
          <div
            key={event.id}
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
              {getEventIcon(event.type)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-200">
                  {getEventText(event)}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">{timeAgo}</span>
              </div>

              {event.payload?.commits && event.payload.commits.length > 0 && (
                <div className="mt-2 space-y-1 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/60">
                  {event.payload.commits.slice(0, 3).map((c: any) => (
                    <div key={c.sha} className="text-xs text-slate-300 flex items-center gap-2">
                      <code className="text-[11px] text-indigo-400 font-mono shrink-0">
                        {c.sha.slice(0, 7)}
                      </code>
                      <span className="truncate">{c.message}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-2">
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  <span>{event.repo.name}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
