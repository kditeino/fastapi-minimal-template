// ----------------------------------------------------------------------

const ACCESS_TOKEN_KEY = 'access_token';
const SESSION_UUID_KEY = 'session_uuid';

// ----------------------------------------------------------------------

export function getToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getSessionUuid(): string | null {
  return localStorage.getItem(SESSION_UUID_KEY);
}

export function setSessionUuid(uuid: string): void {
  localStorage.setItem(SESSION_UUID_KEY, uuid);
}

export function removeSessionUuid(): void {
  localStorage.removeItem(SESSION_UUID_KEY);
}
