import type { AuthLoginParam } from 'src/types/user';
import type { CaptchaDetail } from 'src/types/captcha';
import type { NewToken, LoginToken } from 'src/types/token';

import request from './request';

export async function login(data: AuthLoginParam): Promise<LoginToken> {
  return request.post('/auth/login', data);
}

export async function logout(): Promise<void> {
  return request.post('/auth/logout');
}

export async function refreshToken(): Promise<NewToken> {
  return request.post('/auth/refresh');
}

export async function getCaptcha(): Promise<CaptchaDetail> {
  return request.get('/auth/captcha');
}

export async function getCodes(): Promise<string[]> {
  return request.get('/auth/codes');
}
