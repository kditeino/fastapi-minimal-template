import type { MenuTree, MenuDetail, CreateMenuParam, UpdateMenuParam } from 'src/types/menu';

import request from 'src/api/request';

export async function getMenuTree(params?: { title?: string; status?: number }): Promise<MenuTree[]> {
  return request.get('/sys/menus', { params });
}

export async function getMenuSidebar(): Promise<Record<string, any>[]> {
  return request.get('/sys/menus/sidebar');
}

export async function getMenu(pk: number): Promise<MenuDetail> {
  return request.get(`/sys/menus/${pk}`);
}

export async function createMenu(data: CreateMenuParam): Promise<void> {
  return request.post('/sys/menus', data);
}

export async function updateMenu(pk: number, data: UpdateMenuParam): Promise<void> {
  return request.put(`/sys/menus/${pk}`, data);
}

export async function deleteMenu(pk: number): Promise<void> {
  return request.delete(`/sys/menus/${pk}`);
}
