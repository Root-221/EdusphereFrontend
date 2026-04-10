import type { UserRole } from '@/types/auth';

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

export const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired';

const STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  userRole: 'userRole',
} as const;

export const getStoredAccessToken = (): string | null => localStorage.getItem(STORAGE_KEYS.accessToken);

export const getStoredRefreshToken = (): string | null => localStorage.getItem(STORAGE_KEYS.refreshToken);

export const getStoredUserRole = (): UserRole | null =>
  (localStorage.getItem(STORAGE_KEYS.userRole)?.toLowerCase() as UserRole | null) ?? null;

export const saveSessionTokens = (tokens: SessionTokens, role: string) => {
  localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
  localStorage.setItem(STORAGE_KEYS.userRole, role.toLowerCase());
};

export const clearSessionTokens = () => {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.userRole);
};

export const getTenantSlugFromHostname = (hostname?: string): string | null => {
  const sourceHostname =
    hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');
  const slugMatch = sourceHostname.match(/^([a-z0-9-]+)\./);
  return slugMatch?.[1] ?? null;
};

export const buildTenantHeaders = (): Record<string, string> => {
  const slug = typeof window === 'undefined' ? null : getTenantSlugFromHostname();
  return slug ? { 'X-Tenant-Slug': slug } : {};
};

export const notifyAuthSessionExpired = (reason = 'session_expired') => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(AUTH_SESSION_EXPIRED_EVENT, {
      detail: { reason },
    }),
  );
};
