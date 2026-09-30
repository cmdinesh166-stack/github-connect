import {
  AuthStatusResponse,
  GitHubUser,
  GitHubRepo,
  GitHubIssue,
  GitHubEvent,
  GitHubOrg,
} from '../types/github';

const TOKEN_KEY = 'gh_session_token';

export const authStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },
  clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};

function getHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return { ...headers, ...extra };
}

export const api = {
  async getAuthStatus(): Promise<AuthStatusResponse> {
    const res = await fetch('/api/auth/status', {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to get auth status');
    return res.json();
  },

  async getOAuthUrl(): Promise<{ configured: boolean; url?: string; message?: string; redirectUri: string }> {
    const res = await fetch('/api/auth/github/url', {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to get OAuth URL');
    return res.json();
  },

  async loginWithToken(token: string): Promise<{ success: boolean; sessionToken: string; user: GitHubUser }> {
    const res = await fetch('/api/auth/token-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to authenticate with token');
    }
    authStorage.setToken(data.sessionToken);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getHeaders(),
      });
    } finally {
      authStorage.clearToken();
    }
  },

  async getUser(): Promise<GitHubUser> {
    const res = await fetch('/api/github/user', {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  },

  async getRepos(params?: { sort?: string; direction?: string; visibility?: string; type?: string }): Promise<GitHubRepo[]> {
    const query = new URLSearchParams();
    if (params?.sort) query.set('sort', params.sort);
    if (params?.direction) query.set('direction', params.direction);
    if (params?.visibility) query.set('visibility', params.visibility);
    if (params?.type) query.set('type', params.type);

    const res = await fetch(`/api/github/repos?${query.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch repositories');
    return res.json();
  },

  async getRepoDetails(owner: string, repo: string): Promise<{
    repo: GitHubRepo;
    commits: any[];
    languages: Record<string, number>;
  }> {
    const res = await fetch(`/api/github/repo/${owner}/${repo}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch repository details');
    return res.json();
  },

  async createRepo(payload: {
    name: string;
    description?: string;
    isPrivate?: boolean;
    autoInit?: boolean;
    gitignoreTemplate?: string;
  }): Promise<GitHubRepo> {
    const res = await fetch('/api/github/repos', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to create repository');
    }
    return data;
  },

  async isRepoStarred(owner: string, repo: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/github/repo/${owner}/${repo}/star`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      return Boolean(data.starred);
    } catch {
      return false;
    }
  },

  async starRepo(owner: string, repo: string): Promise<void> {
    const res = await fetch(`/api/github/repo/${owner}/${repo}/star`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to star repository');
  },

  async unstarRepo(owner: string, repo: string): Promise<void> {
    const res = await fetch(`/api/github/repo/${owner}/${repo}/star`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to unstar repository');
  },

  async getIssues(filter: 'all' | 'open' | 'closed' = 'all'): Promise<GitHubIssue[]> {
    const query = new URLSearchParams({ state: filter === 'all' ? 'all' : filter });
    const res = await fetch(`/api/github/issues?${query.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch issues');
    return res.json();
  },

  async createIssue(owner: string, repo: string, payload: { title: string; body: string }): Promise<GitHubIssue> {
    const res = await fetch(`/api/github/repo/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to create issue');
    }
    return data;
  },

  async getEvents(): Promise<GitHubEvent[]> {
    const res = await fetch('/api/github/events', {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  async getOrgs(): Promise<GitHubOrg[]> {
    const res = await fetch('/api/github/orgs', {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch organizations');
    return res.json();
  },
};
