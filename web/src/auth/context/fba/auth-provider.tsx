import type { ReactNode } from 'react';
import type { CaptchaDetail } from 'src/types/captcha';
import type { AuthLoginParam, CurrentUserInfo } from 'src/types/user';

import { use, useMemo, useEffect, useReducer, useCallback, createContext } from 'react';

import { getCurrentUser } from 'src/api/sys/user';

import { getToken } from './utils';
import {
  signInAction,
  signOutAction,
  fetchUserCodes,
  fetchUserMenus,
  refreshTokenAction,
  fetchCaptchaAction,
} from './action';

// ----------------------------------------------------------------------

interface AuthState {
  user: CurrentUserInfo | null;
  token: string | null;
  sessionUuid: string | null;
  permissions: string[];
  menus: Record<string, any>[];
  authenticated: boolean;
  loading: boolean;
}

export interface AuthContextValue extends AuthState {
  signIn: (params: AuthLoginParam) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getCaptcha: () => Promise<CaptchaDetail>;
  hasPermission: (perm: string) => boolean;
}

// ----------------------------------------------------------------------

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | {
      type: 'SIGN_IN';
      payload: {
        user: CurrentUserInfo;
        token: string;
        sessionUuid: string;
        permissions: string[];
        menus: Record<string, any>[];
      };
    }
  | { type: 'SIGN_OUT' }
  | { type: 'RESTORE_SESSION'; payload: { user: CurrentUserInfo; permissions: string[]; menus: Record<string, any>[]; token: string; sessionUuid: string | null } };

const initialState: AuthState = {
  user: null,
  token: null,
  sessionUuid: null,
  permissions: [],
  menus: [],
  authenticated: false,
  loading: true,
};

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SIGN_IN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        sessionUuid: action.payload.sessionUuid,
        permissions: action.payload.permissions,
        menus: action.payload.menus,
        authenticated: true,
        loading: false,
      };

    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        sessionUuid: action.payload.sessionUuid,
        permissions: action.payload.permissions,
        menus: action.payload.menus,
        authenticated: true,
        loading: false,
      };

    case 'SIGN_OUT':
      return {
        ...initialState,
        loading: false,
      };

    default:
      return state;
  }
}

// ----------------------------------------------------------------------

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ----------------------------------------------------------------------

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Restore session on mount
  useEffect(() => {
    const token = getToken();

    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    (async () => {
      try {
        const [user, permissions, menus] = await Promise.all([
          getCurrentUser(),
          fetchUserCodes(),
          fetchUserMenus(),
        ]);

        const sessionUuid = localStorage.getItem('session_uuid');

        dispatch({
          type: 'RESTORE_SESSION',
          payload: { user, token, sessionUuid, permissions, menus },
        });
      } catch {
        // Token invalid — clear and show unauthenticated
        localStorage.removeItem('access_token');
        localStorage.removeItem('session_uuid');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    })();
  }, []);

  // Listen for 401 events from the request interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch({ type: 'SIGN_OUT' });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const signIn = useCallback(async (params: AuthLoginParam) => {
    const result = await signInAction(params);
    dispatch({
      type: 'SIGN_IN',
      payload: {
        user: result.user,
        token: result.token,
        sessionUuid: result.sessionUuid,
        permissions: result.permissions,
        menus: result.menus,
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    await signOutAction();
    dispatch({ type: 'SIGN_OUT' });
  }, []);

  const refreshToken = useCallback(async () => {
    await refreshTokenAction();
  }, []);

  const getCaptcha = useCallback(async () => fetchCaptchaAction(), []);

  const hasPermission = useCallback(
    (perm: string) => state.permissions.includes(perm),
    [state.permissions]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn,
      signOut,
      refreshToken,
      getCaptcha,
      hasPermission,
    }),
    [state, signIn, signOut, refreshToken, getCaptcha, hasPermission]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

// ----------------------------------------------------------------------

export function useAuthContext(): AuthContextValue {
  const context = use(AuthContext);

  if (!context) {
    throw new Error('useAuthContext: Context must be used inside AuthProvider');
  }

  return context;
}
