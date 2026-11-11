import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import api, { TOKEN_KEY } from '../api';
import type { User } from '../types';
import { AuthContext } from './authContextValue';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);

  // Cada vez que hay token, se carga el perfil del usuario autenticado.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api
      .get<User>('/users/current')
      .then(({ data }) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        // Un 403 ya lo maneja el interceptor (limpia token y redirige).
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string }>('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(null);
    setToken(data.token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user: token ? user : null, login, logout }),
    [token, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
