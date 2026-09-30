import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Layers,
  Terminal,
  Info
} from 'lucide-react';

interface OAuthGuideProps {
  devCallbackUrl?: string;
  sharedCallbackUrl?: string;
  hasOAuthConfig?: boolean;
}

export const OAuthGuide: React.FC<OAuthGuideProps> = ({
  devCallbackUrl = 'https://ais-dev-no6nd5wi2nkgy347myurav-171486266440.asia-southeast1.run.app/auth/callback',
  sharedCallbackUrl = 'https://ais-pre-no6nd5wi2nkgy347myurav-171486266440.asia-southeast1.run.app/auth/callback',
  hasOAuthConfig = false,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const devBase = devCallbackUrl.replace('/auth/callback', '');

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400"></span>
            <h3 className="text-lg font-semibold text-white">GitHub OAuth Setup Guide</h3>
          </div>
          <p className="text-sm text-slate-400">
            Configure your GitHub OAuth application to enable full login and API synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasOAuthConfig ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Credentials Configured in Env
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <KeyRound className="w-3.5 h-3.5" />
              OAuth App Keys Needed
            </span>
          )}
        </div>
      </div>

      {/* Steps List */}
      <div className="mt-6 space-y-6">
        {/* Step 1 */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-sm font-semibold text-slate-200">Register a New OAuth App on GitHub</h4>
              <a
                href="https://github.com/settings/applications/new"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Open GitHub Developer Portal
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Visit GitHub Settings &gt; Developer settings &gt; OAuth Apps &gt; "New OAuth App"
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div className="flex-1 space-y-3">
            <h4 className="text-sm font-semibold text-slate-200">Enter Required App URLs</h4>
            <p className="text-xs text-slate-400">
              Paste these exact URLs into your GitHub OAuth application settings:
            </p>

            {/* Homepage URL */}
            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Homepage URL</span>
                <button
                  onClick={() => copyToClipboard(devBase, 'homepage')}
                  className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'homepage' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'homepage' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <code className="text-xs text-emerald-300 font-mono break-all">{devBase}</code>
            </div>

            {/* Authorization Callback URL (Development) */}
            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 font-medium text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Development Callback URL (Required)
                </span>
                <button
                  onClick={() => copyToClipboard(devCallbackUrl, 'devCallback')}
                  className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'devCallback' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'devCallback' ? 'Copied' : 'Copy URL'}
                </button>
              </div>
              <code className="text-xs text-cyan-300 font-mono break-all">{devCallbackUrl}</code>
            </div>

            {/* Authorization Callback URL (Shared) */}
            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 font-medium text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  Shared / Deployed Callback URL
                </span>
                <button
                  onClick={() => copyToClipboard(sharedCallbackUrl, 'sharedCallback')}
                  className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'sharedCallback' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'sharedCallback' ? 'Copied' : 'Copy URL'}
                </button>
              </div>
              <code className="text-xs text-purple-300 font-mono break-all">{sharedCallbackUrl}</code>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-200">Configure Environment Variables in AI Studio</h4>
            <p className="text-xs text-slate-400 mt-1">
              Generate a Client Secret in GitHub and set the two variables in your environment secrets or <code className="text-indigo-300">.env</code>:
            </p>
            <div className="mt-3 bg-slate-950/90 rounded-xl p-3 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-indigo-400">GITHUB_CLIENT_ID</span>="<span className="text-slate-500">&lt;Your Client ID&gt;</span>"
                </div>
                <button
                  onClick={() => copyToClipboard('GITHUB_CLIENT_ID=""', 'env1')}
                  className="text-slate-500 hover:text-slate-300"
                >
                  {copiedKey === 'env1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-indigo-400">GITHUB_CLIENT_SECRET</span>="<span className="text-slate-500">&lt;Your Client Secret&gt;</span>"
                </div>
                <button
                  onClick={() => copyToClipboard('GITHUB_CLIENT_SECRET=""', 'env2')}
                  className="text-slate-500 hover:text-slate-300"
                >
                  {copiedKey === 'env2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
            4
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-200">Click "Connect GitHub" to Authenticate</h4>
            <p className="text-xs text-slate-400 mt-1">
              A secure popup window will open directly on GitHub. Authorize the application, and you'll be immediately connected to manage your repositories and track activity!
            </p>
          </div>
        </div>
      </div>

      {/* Alternative Notice */}
      <div className="mt-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300">
          <span className="font-semibold text-slate-100">Want instant zero-config testing?</span>{' '}
          You can also connect immediately using a{' '}
          <a
            href="https://github.com/settings/tokens/new?scopes=repo,read:user,user:email,read:org&description=GitHub+Hub+AI+Studio"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 underline hover:text-indigo-300"
          >
            GitHub Personal Access Token (classic with repo & read:user)
          </a>{' '}
          without needing to create an OAuth application first!
        </div>
      </div>
    </div>
  );
};
