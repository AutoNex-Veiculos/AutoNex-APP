import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { storage, TOKEN_KEY } from '@/storage';
import { setUnauthorizedHandler } from '@/services/api';
import { queryClient } from '@/services/queryClient';
import { authService } from '@/services/auth.service';
import type { Session } from '@/types/auth';
import type { LoginInput, RegisterInput } from '@/utils/schemas/auth';

interface AuthContextValue {
  session: Session | null;
  ready: boolean;
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  const clearSession = useCallback(() => {
    void storage.remove(TOKEN_KEY);
    queryClient.clear();
    setSession(null);
  }, []);

  // Restaura a sessão a partir do token salvo.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = await storage.get(TOKEN_KEY);
        if (!token) return;
        const { user, company } = await authService.me();
        if (active) setSession({ token, user, company });
      } catch {
        await storage.remove(TOKEN_KEY);
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Token expirado ou inválido (401) encerra a sessão.
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const signIn = useCallback(async (input: LoginInput) => {
    const next = await authService.login(input);
    await storage.set(TOKEN_KEY, next.token);
    setSession(next);
  }, []);

  const signUp = useCallback(async (input: RegisterInput) => {
    const next = await authService.registerCompany(input);
    await storage.set(TOKEN_KEY, next.token);
    setSession(next);
  }, []);

  const signOut = useCallback(async () => {
    await storage.remove(TOKEN_KEY);
    queryClient.clear();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, ready, signIn, signUp, signOut }),
    [session, ready, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return ctx;
}
