import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// In-memory session and OAuth state storage
interface SessionData {
  sessionId: string;
  accessToken: string;
  user: any;
  createdAt: number;
}

const sessions = new Map<string, SessionData>();
const oauthStates = new Set<string>();

// Clean up old sessions (> 7 days) and states (> 10 mins)
setInterval(() => {
  const now = Date.now();
  for (const [id, sess] of sessions.entries()) {
    if (now - sess.createdAt > 7 * 24 * 60 * 60 * 1000) {
      sessions.delete(id);
    }
  }
}, 60 * 60 * 1000);

app.use(express.json());
app.use(cookieParser());

// Helper to determine the container base URL
function getBaseUrl(req: Request): string {
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${port}`;
  return `${protocol}://${host}`;
}

// Session resolver middleware
function getSession(req: Request): SessionData | null {
  const authHeader = req.headers.authorization;
  let sessionId = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    sessionId = authHeader.substring(7).trim();
  } else if (req.cookies && req.cookies.gh_session) {
    sessionId = req.cookies.gh_session;
  }

  if (sessionId && sessions.has(sessionId)) {
    return sessions.get(sessionId)!;
  }
  return null;
}

// Auth status & configuration endpoint
app.get('/api/auth/status', (req: Request, res: Response) => {
  const session = getSession(req);
  const clientId = process.env.GITHUB_CLIENT_ID || process.env.CLIENT_ID || '';
  const clientSecret = process.env.GITHUB_CLIENT_SECRET || process.env.CLIENT_SECRET || '';
  const baseUrl = getBaseUrl(req);

  res.json({
    authenticated: !!session,
    user: session ? session.user : null,
    hasOAuthConfig: Boolean(clientId && clientSecret),
    clientIdConfigured: Boolean(clientId),
    urls: {
      baseUrl,
      callbackUrl: `${baseUrl}/auth/callback`,
      devCallbackUrl: 'https://ais-dev-no6nd5wi2nkgy347myurav-171486266440.asia-southeast1.run.app/auth/callback',
      sharedCallbackUrl: 'https://ais-pre-no6nd5wi2nkgy347myurav-171486266440.asia-southeast1.run.app/auth/callback',
    }
  });
});

// Generate GitHub OAuth Authorization URL
app.get('/api/auth/github/url', (req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID || process.env.CLIENT_ID || '';
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/auth/callback`;

  const state = crypto.randomBytes(16).toString('hex');
  oauthStates.add(state);

  // Expire state in 10 minutes
  setTimeout(() => oauthStates.delete(state), 10 * 60 * 1000);

  if (!clientId) {
    return res.status(200).json({
      configured: false,
      message: 'GITHUB_CLIENT_ID is not configured in environment variables.',
      redirectUri,
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user user:email repo read:org',
    state,
    allow_signup: 'true',
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  res.json({
    configured: true,
    url: authUrl,
    redirectUri,
  });
});

// OAuth Callback handler (handles both trailing slash and non-trailing slash)
const oauthCallbackHandler = async (req: Request, res: Response) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Failed</title></head>
        <body style="font-family: system-ui, sans-serif; background: #090d16; color: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box;">
          <div style="background: #1e293b; border: 1px solid #ef4444; border-radius: 12px; padding: 28px; max-width: 480px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 12px;">⚠️</div>
            <h2 style="color: #f87171; margin: 0 0 12px 0;">GitHub Connection Failed</h2>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">${error_description || error}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${JSON.stringify(error_description || error)} }, '*');
                setTimeout(() => window.close(), 3000);
              }
            </script>
            <p style="font-size: 12px; color: #64748b;">This window will close automatically.</p>
          </div>
        </body>
      </html>
    `;
    return res.status(400).send(errorHtml);
  }

  if (!code || typeof code !== 'string') {
    return res.status(400).send('<h3>Invalid callback: Missing authorization code.</h3>');
  }

  const clientId = process.env.GITHUB_CLIENT_ID || process.env.CLIENT_ID || '';
  const clientSecret = process.env.GITHUB_CLIENT_SECRET || process.env.CLIENT_SECRET || '';

  if (!clientId || !clientSecret) {
    const missingSecretHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Configuration Missing</title></head>
        <body style="font-family: system-ui, sans-serif; background: #090d16; color: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box;">
          <div style="background: #1e293b; border: 1px solid #f59e0b; border-radius: 12px; padding: 28px; max-width: 480px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 12px;">🔑</div>
            <h2 style="color: #fbbf24; margin: 0 0 12px 0;">Missing GitHub Credentials</h2>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing from the environment variables.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: 'Missing GitHub OAuth credentials' }, '*');
                setTimeout(() => window.close(), 3000);
              }
            </script>
          </div>
        </body>
      </html>
    `;
    return res.status(500).send(missingSecretHtml);
  }

  try {
    const baseUrl = getBaseUrl(req);
    const redirectUri = `${baseUrl}/auth/callback`;

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'GitHub-Hub-AI-Studio',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to obtain access token');
    }

    const accessToken = tokenData.access_token;

    // Fetch user profile from GitHub
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Hub-AI-Studio',
      },
    });

    if (!userRes.ok) {
      throw new Error(`Failed to fetch GitHub profile: ${userRes.statusText}`);
    }

    const userData = await userRes.json();

    // Create session
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, {
      sessionId,
      accessToken,
      user: userData,
      createdAt: Date.now(),
    });

    // Set cookie for iframe compatibility: SameSite: 'none' + Secure: true
    res.cookie('gh_session', sessionId, {
      secure: true,
      sameSite: 'none',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Deliver success to opener via postMessage
    const successHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Connected to GitHub</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              background: #090d16;
              color: #f8fafc;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background: #111827;
              border: 1px solid #10b981;
              border-radius: 16px;
              padding: 32px;
              text-align: center;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
              max-width: 400px;
            }
            .avatar {
              width: 72px;
              height: 72px;
              border-radius: 50%;
              border: 3px solid #10b981;
              margin-bottom: 16px;
            }
            h2 { margin: 0 0 8px 0; color: #34d399; font-size: 22px; }
            p { margin: 0; color: #94a3b8; font-size: 14px; }
            .login { font-weight: 600; color: #f1f5f9; }
          </style>
        </head>
        <body>
          <div class="card">
            ${userData.avatar_url ? `<img src="${userData.avatar_url}" class="avatar" alt="Avatar"/>` : ''}
            <h2>GitHub Connected!</h2>
            <p>Welcome, <span class="login">@${userData.login}</span></p>
            <p style="margin-top: 12px; font-size: 12px; color: #64748b;">Closing popup and updating dashboard...</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({
                  type: 'OAUTH_AUTH_SUCCESS',
                  sessionToken: ${JSON.stringify(sessionId)},
                  user: ${JSON.stringify(userData)}
                }, '*');
                setTimeout(() => {
                  window.close();
                }, 800);
              } else {
                window.location.href = '/';
              }
            } catch (err) {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `;

    res.send(successHtml);
  } catch (err: any) {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Error</title></head>
        <body style="font-family: system-ui, sans-serif; background: #090d16; color: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px;">
          <div style="background: #1e293b; border: 1px solid #ef4444; border-radius: 12px; padding: 28px; max-width: 480px; text-align: center;">
            <h2 style="color: #f87171; margin: 0 0 12px 0;">GitHub Token Exchange Error</h2>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">${err.message || 'Unknown error occurred'}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${JSON.stringify(err.message)} }, '*');
                setTimeout(() => window.close(), 4000);
              }
            </script>
          </div>
        </body>
      </html>
    `;
    res.status(500).send(errorHtml);
  }
};

app.get(['/auth/callback', '/auth/callback/'], oauthCallbackHandler);

// Alternative direct connect using GitHub Personal Access Token (PAT)
app.post('/api/auth/token-login', async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Access token is required' });
  }

  const cleanToken = token.trim();

  try {
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Hub-AI-Studio',
      },
    });

    if (!userRes.ok) {
      return res.status(401).json({
        error: `GitHub token verification failed (${userRes.status}: ${userRes.statusText}). Check that the token is valid and active.`,
      });
    }

    const userData = await userRes.json();
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, {
      sessionId,
      accessToken: cleanToken,
      user: userData,
      createdAt: Date.now(),
    });

    res.cookie('gh_session', sessionId, {
      secure: true,
      sameSite: 'none',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      sessionToken: sessionId,
      user: userData,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal connection error' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const session = getSession(req);
  if (session) {
    sessions.delete(session.sessionId);
  }
  res.clearCookie('gh_session', {
    secure: true,
    sameSite: 'none',
    httpOnly: true,
  });
  res.json({ success: true });
});

// GitHub API Proxy helper
async function proxyGitHub(
  endpoint: string,
  req: Request,
  res: Response,
  options: RequestInit = {}
) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated with GitHub' });
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${session.accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Hub-AI-Studio',
      ...(options.headers as Record<string, string> || {}),
    };

    const targetUrl = endpoint.startsWith('https://')
      ? endpoint
      : `https://api.github.com${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const apiRes = await fetch(targetUrl, {
      ...options,
      headers,
    });

    const contentType = apiRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await apiRes.json();
      return res.status(apiRes.status).json(data);
    } else {
      const text = await apiRes.text();
      return res.status(apiRes.status).send(text);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'GitHub API proxy error' });
  }
}

// User details + emails
app.get('/api/github/user', async (req: Request, res: Response) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const [userRes, emailsRes] = await Promise.all([
      fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Hub-AI-Studio',
        },
      }),
      fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Hub-AI-Studio',
        },
      }).catch(() => null),
    ]);

    const userData = await userRes.json();
    let emails = [];
    if (emailsRes && emailsRes.ok) {
      emails = await emailsRes.json();
    }

    // Refresh user cache
    session.user = userData;

    res.json({
      ...userData,
      emails,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List repositories
app.get('/api/github/repos', async (req: Request, res: Response) => {
  const query = new URLSearchParams();
  query.set('sort', (req.query.sort as string) || 'updated');
  query.set('direction', (req.query.direction as string) || 'desc');
  query.set('per_page', (req.query.per_page as string) || '100');
  if (req.query.type) query.set('type', req.query.type as string);
  if (req.query.visibility) query.set('visibility', req.query.visibility as string);

  return proxyGitHub(`/user/repos?${query.toString()}`, req, res);
});

// Create repository
app.post('/api/github/repos', async (req: Request, res: Response) => {
  const { name, description, isPrivate, autoInit, gitignoreTemplate } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Repository name is required' });
  }

  return proxyGitHub('/user/repos', req, res, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      description: description || '',
      private: Boolean(isPrivate),
      auto_init: autoInit ?? true,
      gitignore_template: gitignoreTemplate || undefined,
    }),
  });
});

// Get repository details & recent commits
app.get('/api/github/repo/:owner/:repo', async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const [repoRes, commitsRes, languagesRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Hub-AI-Studio',
        },
      }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=8`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Hub-AI-Studio',
        },
      }).catch(() => null),
      fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Hub-AI-Studio',
        },
      }).catch(() => null),
    ]);

    if (!repoRes.ok) {
      return res.status(repoRes.status).json({ error: 'Failed to fetch repository' });
    }

    const repoData = await repoRes.json();
    const commits = commitsRes && commitsRes.ok ? await commitsRes.json() : [];
    const languages = languagesRes && languagesRes.ok ? await languagesRes.json() : {};

    res.json({
      repo: repoData,
      commits: Array.isArray(commits) ? commits : [],
      languages,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Star or unstar a repository
app.put('/api/github/repo/:owner/:repo/star', (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  return proxyGitHub(`/user/starred/${owner}/${repo}`, req, res, { method: 'PUT' });
});

app.delete('/api/github/repo/:owner/:repo/star', (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  return proxyGitHub(`/user/starred/${owner}/${repo}`, req, res, { method: 'DELETE' });
});

// Check if repository is starred
app.get('/api/github/repo/:owner/:repo/star', async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const starRes = await fetch(`https://api.github.com/user/starred/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Hub-AI-Studio',
      },
    });
    res.json({ starred: starRes.status === 204 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List user issues
app.get('/api/github/issues', (req: Request, res: Response) => {
  const query = new URLSearchParams({
    filter: (req.query.filter as string) || 'all',
    state: (req.query.state as string) || 'all',
    per_page: '30',
  });
  return proxyGitHub(`/user/issues?${query.toString()}`, req, res);
});

// Create issue in a repo
app.post('/api/github/repo/:owner/:repo/issues', (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  const { title, body } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Issue title is required' });
  }
  return proxyGitHub(`/repos/${owner}/${repo}/issues`, req, res, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body }),
  });
});

// Get user activity/events
app.get('/api/github/events', async (req: Request, res: Response) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });
  const username = session.user?.login;
  if (!username) return res.status(400).json({ error: 'No user login found' });
  return proxyGitHub(`/users/${username}/events?per_page=30`, req, res);
});

// Get user organizations
app.get('/api/github/orgs', (req: Request, res: Response) => {
  return proxyGitHub('/user/orgs', req, res);
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`GitHub Hub Server running on port ${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
