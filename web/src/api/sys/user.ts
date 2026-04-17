import type { RoleDetail } from 'src/types/role';
import type { PageData, PageParams } from 'src/api/types';
import type {
  AddUserParam,
  CurrentUserInfo,
  UpdateUserParam,
  ResetPasswordParam,
  UserInfoWithRelation,
} from 'src/types/user';

import request from 'src/api/request';

export async function getCurrentUser(): Promise<CurrentUserInfo> {
  return request.get('/sys/users/me');
}

export async function getUser(pk: number): Promise<UserInfoWithRelation> {
  return request.get(`/sys/users/${pk}`);
}

export async function getUsers(
  params?: PageParams & { dept?: number; username?: string; phone?: string; status?: number }
): Promise<PageData<UserInfoWithRelation>> {
  return request.get('/sys/users', { params });
}

export async function getUserRoles(pk: number): Promise<RoleDetail[]> {
  return request.get(`/sys/users/${pk}/roles`);
}

export async function createUser(data: AddUserParam): Promise<UserInfoWithRelation> {
  return request.post('/sys/users', data);
}

export async function updateUser(pk: number, data: UpdateUserParam): Promise<void> {
  return request.put(`/sys/users/${pk}`, data);
}

export async function updateUserPermission(pk: number, type: string): Promise<void> {
  return request.put(`/sys/users/${pk}/permissions`, null, { params: { type } });
}

export async function updatePassword(data: ResetPasswordParam): Promise<void> {
  return request.put('/sys/users/me/password', data);
}

export async function resetPassword(pk: number, password: string): Promise<void> {
  return request.put(`/sys/users/${pk}/password`, { password });
}

export async function updateNickname(nickname: string): Promise<void> {
  return request.put('/sys/users/me/nickname', { nickname });
}

export async function updateAvatar(avatar: string): Promise<void> {
  return request.put('/sys/users/me/avatar', { avatar });
}

export async function updateEmail(captcha: string, email: string): Promise<void> {
  return request.put('/sys/users/me/email', { captcha, email });
}

export async function deleteUser(pk: number): Promise<void> {
  return request.delete(`/sys/users/${pk}`);
}
