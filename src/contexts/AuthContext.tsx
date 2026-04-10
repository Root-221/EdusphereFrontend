import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import api, { type AuthRequestConfig } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-errors';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole, AuthState } from '@/types/auth';
import {
  AUTH_SESSION_EXPIRED_EVENT,
  clearSessionTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  saveSessionTokens,
  type SessionTokens,
} from '@/lib/auth-session';

type BackendUser = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'avatar' | 'schoolId' | 'schoolName'> & {
  role?: string;
};

const backendRoleMap: Record<string, UserRole> = {
  'SUPER_ADMIN': 'super_admin',
  'SCHOOL_ADMIN': 'school_admin',
  'TEACHER': 'teacher',
  'STUDENT': 'student',
  'PARENT': 'parent',
  'ACCOUNTANT': 'accountant',
};

const mapBackendRole = (role?: string): UserRole => {
  if (!role) {
    return 'student';
  }
  const upper = role.toUpperCase();
  return backendRoleMap[upper] ?? (role.toLowerCase() as UserRole);
};

const buildFrontendUser = (backendUser: BackendUser): User => ({
  id: backendUser.id,
  email: backendUser.email,
  firstName: backendUser.firstName,
  lastName: backendUser.lastName,
  role: mapBackendRole(backendUser.role),
  avatar: backendUser.avatar,
  schoolId: backendUser.schoolId,
  schoolName: backendUser.schoolName,
});

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// No more mocks - using backend data


export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const setAuthenticatedUser = useCallback((user: User, tokens?: SessionTokens) => {
    if (tokens) {
      saveSessionTokens(tokens, user.role);
    }
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const clearSession = useCallback(() => {
    clearSessionTokens();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await api.post('/auth/login', { email, password }, { skipAuthRefresh: true } as AuthRequestConfig);
      const { accessToken, refreshToken, user } = response.data.data;

      const frontendUser = buildFrontendUser(user);
      setAuthenticatedUser(frontendUser, { accessToken, refreshToken });
    } catch (error: unknown) {
      throw new Error(getApiErrorMessage(error, 'Erreur de connexion'));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [setAuthenticatedUser]);

  const { toast } = useToast();
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', undefined, { skipAuthRefresh: true } as AuthRequestConfig);
    } catch (error) {
      console.log('Logout API error (expected):', error);
    } finally {
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      clearSession();
    }
  }, [clearSession, toast]);

  const switchRole = useCallback(() => {}, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      clearSession();
      toast({
        title: 'Session expirée',
        description: 'Reconnecte-toi pour continuer à utiliser l’application.',
      });
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [clearSession, toast]);

  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      const hasStoredSession = Boolean(getStoredAccessToken()) || Boolean(getStoredRefreshToken());

      if (!hasStoredSession) {
        if (active) {
          setState(prev => ({ ...prev, isLoading: false }));
        }
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (!active) return;

        const frontendUser = buildFrontendUser(response.data.data);
        setAuthenticatedUser(frontendUser);
      } catch (error: unknown) {
        if (!active) return;
        clearSession();
      }
    };

    initializeAuth();

    return () => {
      active = false;
    };
  }, [clearSession, setAuthenticatedUser]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
