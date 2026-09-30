import React from 'react';
import {
  Users,
  FolderGit2,
  MapPin,
  Building,
  Link as LinkIcon,
  Mail,
  Calendar,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { GitHubUser } from '../types/github';

interface UserProfileCardProps {
  user: GitHubUser;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ user }) => {
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* User Info */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-indigo-500/30 object-cover shadow-lg"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {user.name || user.login}
              </h2>
              <a
                href={user.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-mono text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
              >
                @{user.login}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {user.bio && (
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl line-clamp-2">
                {user.bio}
              </p>
            )}

            {/* Metadata badges */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-400">
              {user.company && (
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  {user.company}
                </span>
              )}
              {user.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {user.location}
                </span>
              )}
              {user.blog && (
                <a
                  href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-indigo-400 hover:underline"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                  Website
                </a>
              )}
              {user.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {user.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Joined {joinDate}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full md:w-auto bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
          <div className="text-center px-3 py-1">
            <div className="text-lg font-bold text-white">
              {user.public_repos + (user.total_private_repos || 0)}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <FolderGit2 className="w-3 h-3 text-indigo-400" />
              Repos
            </div>
          </div>

          <div className="text-center px-3 py-1">
            <div className="text-lg font-bold text-white">{user.followers}</div>
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <Users className="w-3 h-3 text-emerald-400" />
              Followers
            </div>
          </div>

          <div className="text-center px-3 py-1">
            <div className="text-lg font-bold text-white">{user.following}</div>
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" />
              Following
            </div>
          </div>

          <div className="text-center px-3 py-1 hidden sm:block">
            <div className="text-lg font-bold text-white">{user.public_gists}</div>
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <BookOpen className="w-3 h-3 text-amber-400" />
              Gists
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
