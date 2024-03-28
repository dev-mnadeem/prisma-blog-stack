import Cookies from 'js-cookie';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { fetchAccount, login as loginRequest } from '../api/auth';
import { AUTH_COOKIE } from '../api/client';
import { Account, Credentials } from '../types/auth';

interface AuthState {
  account: Account | null;
  isLoading: boolean;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const COOKIE_DAYS = 1;

/**
 * The token in the cookie is the only source of truth. On mount we ask the API
 * who it belongs to rather than trusting a boolean cached in localStorage,
 * which is what previously let an expired session keep rendering as signed in.
 */
export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(Cookies.get(AUTH_COOKIE)));

  useEffect(() => {
    if (!Cookies.get(AUTH_COOKIE)) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    fetchAccount()
      .then((profile) => {
        if (!cancelled) {
          setAccount(profile);
        }
      })
      .catch(() => {
        Cookies.remove(AUTH_COOKIE);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (credentials: Credentials) => {
    const token = await loginRequest(credentials);
    Cookies.set(AUTH_COOKIE, token, { expires: COOKIE_DAYS, sameSite: 'strict' });
    setAccount(await fetchAccount());
  }, []);

  const signOut = useCallback(() => {
    Cookies.remove(AUTH_COOKIE);
    setAccount(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ account, isLoading, signIn, signOut }),
    [account, isLoading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
