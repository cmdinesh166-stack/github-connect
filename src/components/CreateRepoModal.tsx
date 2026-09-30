import React, { useState } from 'react';
import { X, FolderPlus, Lock, Globe, Loader2, AlertCircle, Check } from 'lucide-react';
import { api } from '../services/api';
import { GitHubRepo } from '../types/github';

interface CreateRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (repo: GitHubRepo) => void;
}

export const CreateRepoModal: React.FC<CreateRepoModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [autoInit, setAutoInit] = useState(true);
  const [gitignoreTemplate, setGitignoreTemplate] = useState('Node');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Repository name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const newRepo = await api.createRepo({
        name: name.trim(),
        description: description.trim(),
        isPrivate,
        autoInit,
        gitignoreTemplate: gitignoreTemplate !== 'none' ? gitignoreTemplate : undefined,
      });
      onCreated(newRepo);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create repository');
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
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Create a New Repository</h3>
            <p className="text-xs text-slate-400">Initialize a new project directly on GitHub</p>
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
              Repository Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-_.]/g, '-'))}
              placeholder="e.g. awesome-cloud-app"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short summary of your project..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Visibility selection */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsPrivate(false)}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                !isPrivate
                  ? 'bg-indigo-600/10 border-indigo-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Globe className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold">Public</div>
                <div className="text-[11px] text-slate-400">Anyone on the internet can see it.</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsPrivate(true)}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                isPrivate
                  ? 'bg-indigo-600/10 border-indigo-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Lock className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold">Private</div>
                <div className="text-[11px] text-slate-400">Only you choose who can view it.</div>
              </div>
            </button>
          </div>

          {/* Options */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoInit}
                onChange={(e) => setAutoInit(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-300">
                Initialize this repository with a <strong className="text-white">README.md</strong>
              </span>
            </label>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Add .gitignore template
              </label>
              <select
                value={gitignoreTemplate}
                onChange={(e) => setGitignoreTemplate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="none">None</option>
                <option value="Node">Node / JavaScript / TypeScript</option>
                <option value="Python">Python</option>
                <option value="Go">Go</option>
                <option value="Rust">Rust</option>
                <option value="Java">Java</option>
                <option value="Ruby">Ruby</option>
              </select>
            </div>
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
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating on GitHub...
                </>
              ) : (
                'Create Repository'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
