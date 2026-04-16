import axios, { AxiosError, AxiosHeaders, type AxiosRequestConfig } from 'axios';
import {
  buildTenantHeaders,
  clearSessionTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  notifyAuthSessionExpired,
  saveSessionTokens,
  type SessionTokens,
} from './auth-session';

const API_BASE = '/api/v1';

export type AuthRequestConfig = AxiosRequestConfig & {
  skipAuthRefresh?: boolean;
  _retry?: boolean;
};

const api = axios.create({
  baseURL: API_BASE,
});

// Request interceptor for tenant & auth
api.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  const headers = AxiosHeaders.from(config.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  Object.entries(buildTenantHeaders()).forEach(([key, value]) => {
    headers.set(key, value);
  });

  config.headers = headers;

  return config;
});

let refreshPromise: Promise<SessionTokens> | null = null;

const refreshSession = async (): Promise<SessionTokens> => {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  const response = await api.post(
    '/auth/refresh',
    { refreshToken },
    { skipAuthRefresh: true } as AuthRequestConfig,
  );

  const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;
  saveSessionTokens(
    { accessToken, refreshToken: newRefreshToken },
    user.role,
    user.schoolSlug ?? undefined,
  );

  return { accessToken, refreshToken: newRefreshToken };
};

const clearExpiredSession = () => {
  const hadSession = Boolean(getStoredAccessToken() || getStoredRefreshToken());
  clearSessionTokens();
  if (hadSession) {
    notifyAuthSessionExpired('refresh_failed');
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as AuthRequestConfig | undefined;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest.skipAuthRefresh ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (!getStoredRefreshToken()) {
      clearExpiredSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshSession().finally(() => {
          refreshPromise = null;
        });
      }

      await refreshPromise;

      const retryHeaders = AxiosHeaders.from(originalRequest.headers);
      const accessToken = getStoredAccessToken();

      if (accessToken) {
        retryHeaders.set('Authorization', `Bearer ${accessToken}`);
      }

      originalRequest.headers = retryHeaders;

      return api(originalRequest);
    } catch (refreshError) {
      clearExpiredSession();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
