import { AuthPayload, TokenPair } from '@devpulse/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
const ACCESS_TOKEN_KEY = 'pulltora_access_token';
const REFRESH_TOKEN_KEY = 'pulltora_refresh_token';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = (payload as any)?.message || (payload as any)?.error || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

function setTokens({ accessToken, refreshToken }: TokenPair) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function register(payload: RegisterPayload): Promise<AuthSessionResponse> {
  const data = await request<AuthSessionResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  setTokens(data);
  return data;
}

async function login(payload: LoginPayload): Promise<AuthSessionResponse> {
  const data = await request<AuthSessionResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  setTokens(data);
  return data;
}

async function refresh(): Promise<AuthSessionResponse> {
  const token = getRefreshToken();
  if (!token) {
    throw new Error('Missing refresh token');
  }

  const data = await request<AuthSessionResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: token })
  });
  setTokens(data);
  return data;
}

async function getCurrentUser() {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No auth token');
  }

  const data = await request<{ user: AuthUser }>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data.user;
}

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AuthPayload['role'];
  createdAt?: string;
  updatedAt?: string;
};

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const authService = {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  hasAccessToken: () => Boolean(getAccessToken()),
  register,
  login,
  refresh,
  getCurrentUser,
  async logoutOnServer() {
    return Promise.resolve();
  }
};
