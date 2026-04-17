import type { MenuTree } from 'src/types/menu';
import type { PageData, PageParams } from 'src/api/types';
import type { RoleDetail, CreateRoleParam, UpdateRoleParam, UpdateRoleMenuParam, UpdateRoleScopeParam, RoleWithRelationDetail } from 'src/types/role';

import request from 'src/api/request';

export async function getRoles(
  params?: PageParams & { name?: string; status?: number }
): Promise<PageData<RoleDetail>> {
  return request.get('/sys/roles', { params });
}

export async function getAllRoles(): Promise<RoleDetail[]> {
  return request.get('/sys/roles/all');
}

export async function getRole(pk: number): Promise<RoleWithRelationDetail> {
  return request.get(`/sys/roles/${pk}`);
}

export async function getRoleMenuTree(pk: number): Promise<MenuTree[] | null> {
  return request.get(`/sys/roles/${pk}/menus`);
}

export async function getRoleScopes(pk: number): Promise<number[]> {
  return request.get(`/sys/roles/${pk}/scopes`);
}

export async function createRole(data: CreateRoleParam): Promise<void> {
  return request.post('/sys/roles', data);
}

export async function updateRole(pk: number, data: UpdateRoleParam): Promise<void> {
  return request.put(`/sys/roles/${pk}`, data);
}

export async function deleteRoles(pks: number[]): Promise<void> {
  return request.delete('/sys/roles', { data: { pks } });
}

export async function updateRoleMenus(pk: number, data: UpdateRoleMenuParam): Promise<void> {
  return request.put(`/sys/roles/${pk}/menus`, data);
}

export async function updateRoleScopes(pk: number, data: UpdateRoleScopeParam): Promise<void> {
  return request.put(`/sys/roles/${pk}/scopes`, data);
}
