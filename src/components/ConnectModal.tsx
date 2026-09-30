import React, { useState, useEffect } from 'react';
import {
  Github,
  Key,
  Shield,
  ExternalLink,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { GitHubUser } from '../types/github';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: GitHubUser) => void;
  hasOAuthConfig: boolean;
  devCallbackUrl: string;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  hasOAuthConfig,
  devCallbackUrl,
}) => {
  const [tab, setTab] = useState<'oauth' | 'token'>('oauth');
  const [isLoadingOAuth, setIsLoadingOAuth] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Listen for OAuth postMessage from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsLoadingOAuth(false);
        if (event.data.user) {
          onSuccess(event.data.user);
          onClose();
        }
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setIsLoadingOAuth(false);
        setErrorMsg(event.data.error || 'Authentication failed. Please check your GitHub OAuth app configuration.');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onClose]);

  if (!isOpen) return null;

  const handleOAuthConnect = async () => {
    try {
      setIsLoadingOAuth(true);
      setErrorMsg(null);

      // Fetch the authorization URL from the server
      const { url, configured, message } = await api.getOAuthUrl();

      if (!configured || !url) {
        setIsLoadingOAuth(false);
        setErrorMsg(
          message ||
          'GitHub OAuth credentials are not configured in your environment. You can set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET or connect immediately using a Personal Access Token.'
        );
        return;
      }

      // Calculate popup dimensions and centered position
      const width = 640;
      const height = 760;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      // Open OAuth provider URL directly in popup (NOT container route)
      const popup = window.open(
        url,
        'github_oauth_popup',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=1`
      );

      if (!popup) {
        setIsLoadingOAuth(false);
        setErrorMsg('The authentication popup was blocked by your browser. Please allow popups for this site and try again.');
        return;
      }

      // Check if popup was closed before completion
      const checkTimer = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkTimer);
          setIsLoadingOAuth(false);
        }
      }, 1000);
    } catch (err: any) {
      setIsLoadingOAuth(false);
      setErrorMsg(err.message || 'Failed to initiate GitHub OAuth flow.');
    }
  };

  const handleTokenConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setErrorMsg('Please enter a GitHub Personal Access Token.');
      return;
    }

    try {
      setIsVerifyingToken(true);
      setErrorMsg(null);
      const res = await api.loginWithToken(tokenInput.trim());
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Token verification failed. Please check permissions.');
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const copyCallbackUrl = () => {
    navigator.clipboard.writeText(devCallbackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center shadow-lg">
            <Github className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Connect to GitHub</h2>
            <p className="text-xs text-slate-400">Choose your preferred authentication method</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6">
          <button
            onClick={() => {
              setTab('oauth');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              tab === 'oauth'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            GitHub OAuth App
          </button>
          <button
            onClick={() => {
              setTab('token');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              tab === 'token'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Personal Access Token
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* Tab 1: OAuth App Flow */}
        {tab === 'oauth' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                <Shield className="w-4 h-4 text-emerald-400" />
                OAuth 2.0 Web Application Flow
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connects directly through GitHub's standard popup authorization screen. Requests access to user profile, repositories, and issues.
              </p>
            </div>

            {!hasOAuthConfig && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 space-y-2">
                <div className="font-semibold text-amber-200">OAuth Credentials Required</div>
                <p className="text-[11px] leading-relaxed">
                  To use the OAuth popup, configure <code className="text-amber-200 bg-amber-950/60 px-1 py-0.5 rounded">GITHUB_CLIENT_ID</code> and <code className="text-amber-200 bg-amber-950/60 px-1 py-0.5 rounded">GITHUB_CLIENT_SECRET</code> in your environment, or switch to the <strong>Personal Access Token</strong> tab for zero-setup instant login.
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Callback URL:</span>
                  <button
                    onClick={copyCallbackUrl}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy Callback URL'}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleOAuthConnect}
              disabled={isLoadingOAuth}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              {isLoadingOAuth ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting via GitHub Popup...
                </>
              ) : (
                <>
                  <Github className="w-4 h-4" />
                  Launch GitHub OAuth Popup
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 2: Personal Access Token Flow */}
        {tab === 'token' && (
          <form onSubmit={handleTokenConnect} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  GitHub Personal Access Token (PAT)
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,read:user,user:email,read:org&description=GitHub+Hub+Dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                >
                  Generate Token
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Tokens need <code className="text-indigo-300">repo</code> and <code className="text-indigo-300">read:user</code> scopes. Your token is verified server-side and never exposed to the public.
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifyingToken || !tokenInput.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              {isVerifyingToken ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Token with GitHub...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Connect With Token
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
