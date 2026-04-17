import type { CaptchaDetail } from 'src/types/captcha';
import type { AuthLoginParam, CurrentUserInfo } from 'src/types/user';

import { getMenuSidebar } from 'src/api/sys/menu';
import { getCurrentUser } from 'src/api/sys/user';
import { login, logout, getCodes, getCaptcha, refreshToken } from 'src/api/auth';

import { setToken, removeToken, setSessionUuid, removeSessionUuid } from './utils';

// ----------------------------------------------------------------------

export interface SignInResult {
  user: CurrentUserInfo;
  token: string;
  sessionUuid: string;
  permissions: string[];
  menus: Record<string, any>[];
}

export async function signInAction(params: AuthLoginParam): Promise<SignInResult> {
  const loginData = await login(params);

  setToken(loginData.access_token);
  setSessionUuid(loginData.session_uuid);

  const [user, permissions, menus] = await Promise.all([
    getCurrentUser(),
    fetchUserCodes(),
    fetchUserMenus(),
  ]);

  return {
    user,
    token: loginData.access_token,
    sessionUuid: loginData.session_uuid,
    permissions,
    menus,
  };
}

export async function signOutAction(): Promise<void> {
  try {
    await logout();
  } catch {
    // Ignore logout errors — clear local state regardless
  } finally {
    removeToken();
    removeSessionUuid();
  }
}

export async function refreshTokenAction(): Promise<string> {
  const data = await refreshToken();
  setToken(data.access_token);
  setSessionUuid(data.session_uuid);
  return data.access_token;
}

export async function fetchCaptchaAction(): Promise<CaptchaDetail> {
  return getCaptcha();
}

export async function fetchUserCodes(): Promise<string[]> {
  return getCodes();
}

export async function fetchUserMenus(): Promise<Record<string, any>[]> {
  return getMenuSidebar();
}
