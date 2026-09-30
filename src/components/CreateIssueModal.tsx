import React, { useState } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { GitHubRepo, GitHubIssue } from '../types/github';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  repos: GitHubRepo[];
  selectedRepo?: GitHubRepo | null;
  onCreated: (issue: GitHubIssue) => void;
}

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  isOpen,
  onClose,
  repos,
  selectedRepo,
  onCreated,
}) => {
  const [repoFullName, setRepoFullName] = useState(
    selectedRepo ? selectedRepo.full_name : repos[0]?.full_name || ''
  );
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoFullName) {
      setErrorMsg('Please select a repository');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Issue title is required');
      return;
    }

    const [owner, repo] = repoFullName.split('/');
    if (!owner || !repo) {
      setErrorMsg('Invalid repository selection');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const newIssue = await api.createIssue(owner, repo, {
        title: title.trim(),
        body: body.trim(),
      });
      onCreated(newIssue);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Open New Issue</h3>
            <p className="text-xs text-slate-400">Submit a trackable issue to your repository</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Repository *
            </label>
            <select
              value={repoFullName}
              onChange={(e) => setRepoFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {repos.map((r) => (
                <option key={r.id} value={r.full_name}>
                  {r.full_name} ({r.private ? 'Private' : 'Public'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Issue Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bug: Fix authentication timeout in iframe"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description / Details (Markdown supported)
            </label>
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe the issue, steps to reproduce, or requirements..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating Issue...
                </>
              ) : (
                'Submit Issue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
