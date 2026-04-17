import type { DeptTree, DeptDetail, CreateDeptParam, UpdateDeptParam } from 'src/types/dept';

import request from 'src/api/request';

export async function getDeptTree(params?: {
  name?: string;
  leader?: string;
  phone?: string;
  status?: number;
}): Promise<DeptTree[]> {
  return request.get('/sys/depts', { params });
}

export async function getDept(pk: number): Promise<DeptDetail> {
  return request.get(`/sys/depts/${pk}`);
}

export async function createDept(data: CreateDeptParam): Promise<void> {
  return request.post('/sys/depts', data);
}

export async function updateDept(pk: number, data: UpdateDeptParam): Promise<void> {
  return request.put(`/sys/depts/${pk}`, data);
}

export async function deleteDept(pk: number): Promise<void> {
  return request.delete(`/sys/depts/${pk}`);
}
