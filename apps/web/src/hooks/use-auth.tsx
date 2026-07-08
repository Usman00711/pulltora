import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService, AuthUser, LoginPayload, RegisterPayload } from '@/services/auth-service';
import type { ReactNode } from 'react';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasToken, setHasToken] = useState<boolean>(authService.hasAccessToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(true);

  useEffect(() => {
    let isActive = true;

    const bootstrap = async () => {
      if (!authService.hasAccessToken()) {
        setHasToken(false);
        setUser(null);
        setIsBootstrapping(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();

        if (!isActive) {
          return;
        }

        setUser(currentUser);
      } catch {
        if (!isActive) {
          return;
        }

        authService.clearTokens();
        setHasToken(false);
        setUser(null);
      } finally {
        if (isActive) {
          setIsBootstrapping(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isActive = false;
    };
  }, []);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setHasToken(true);
      setUser(data.user);
      navigate(
        (location.state as { from?: string } | undefined)?.from || '/dashboard',
        { replace: true }
      );
    }
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setHasToken(true);
      setUser(data.user);
      navigate('/dashboard', { replace: true });
    }
  });

  const logout = () => {
    authService.clearTokens();
    setHasToken(false);
    setUser(null);
    navigate('/login', { replace: true });
  };

  const refreshSession = async () => {
    try {
      const session = await authService.refresh();
      setUser(session.user);
    } catch {
      logout();
    }
  };

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      isLoading:
        isBootstrapping || loginMutation.isPending || registerMutation.isPending,
      isAuthenticated: hasToken,
      login: async (payload) => {
        await loginMutation.mutateAsync(payload);
      },
      register: async (payload) => {
        await registerMutation.mutateAsync(payload);
      },
      logout,
      refreshSession
    };
  }, [
    user,
    isBootstrapping,
    loginMutation.isPending,
    registerMutation.isPending,
    location.state,
    hasToken
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return ctx;
}
