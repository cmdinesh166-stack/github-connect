export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  public_repos: number;
  total_private_repos?: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  emails?: Array<{ email: string; primary: boolean; verified: boolean; visibility: string | null }>;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  clone_url: string;
  ssh_url: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  topics?: string[];
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  body: string | null;
  created_at: string;
  updated_at: string;
  comments: number;
  pull_request?: any;
  user: {
    login: string;
    avatar_url: string;
  };
  repository_url?: string;
  repository?: {
    name: string;
    full_name: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
  }>;
}

export interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    login: string;
    avatar_url: string;
  };
  repo: {
    name: string;
    url: string;
  };
  payload: any;
  created_at: string;
}

export interface GitHubOrg {
  id: number;
  login: string;
  description: string | null;
  avatar_url: string;
  html_url: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  user: GitHubUser | null;
  hasOAuthConfig: boolean;
  clientIdConfigured: boolean;
  urls: {
    baseUrl: string;
    callbackUrl: string;
    devCallbackUrl: string;
    sharedCallbackUrl: string;
  };
}
