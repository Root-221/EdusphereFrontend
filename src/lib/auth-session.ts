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
  schoolSlug: 'schoolSlug',
} as const;

export const getStoredAccessToken = (): string | null => localStorage.getItem(STORAGE_KEYS.accessToken);

export const getStoredRefreshToken = (): string | null => localStorage.getItem(STORAGE_KEYS.refreshToken);

export const getStoredUserRole = (): UserRole | null =>
  (localStorage.getItem(STORAGE_KEYS.userRole)?.toLowerCase() as UserRole | null) ?? null;

export const getStoredSchoolSlug = (): string | null => localStorage.getItem(STORAGE_KEYS.schoolSlug);

export const saveSessionTokens = (tokens: SessionTokens, role: string, schoolSlug?: string) => {
  localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
  localStorage.setItem(STORAGE_KEYS.userRole, role.toLowerCase());
  if (schoolSlug) {
    localStorage.setItem(STORAGE_KEYS.schoolSlug, schoolSlug);
  } else {
    localStorage.removeItem(STORAGE_KEYS.schoolSlug);
  }
};

export const clearSessionTokens = () => {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.userRole);
  localStorage.removeItem(STORAGE_KEYS.schoolSlug);
};

export const getTenantSlugFromHostname = (hostname?: string): string | null => {
  const sourceHostname =
    hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');

  // Vérifie si nous nous trouvons exactement sur le domaine central (ex: edusphere.vercel.app)
  const centralDomain = import.meta.env.VITE_CENTRAL_DOMAIN;
  if (centralDomain && sourceHostname === centralDomain) {
    return null; // Pas de slug, on est sur la plateforme Super Admin
  }

  const slugMatch = sourceHostname.match(/^([a-z0-9-]+)\./);
  return slugMatch?.[1] ?? null;
};

export const buildTenantHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  
  const hostnameSlug = getTenantSlugFromHostname();
  const hasStoredSession = Boolean(getStoredAccessToken() || getStoredRefreshToken());
  const storedSlug = hasStoredSession ? getStoredSchoolSlug() : null;
  
  const slug = hostnameSlug || storedSlug;
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
