import type { PageData, PageParams } from 'src/api/types';
import type {
  DataScopeDetail,
  CreateDataScopeParam,
  UpdateDataScopeParam,
  UpdateDataScopeRuleParam,
  DataScopeWithRelationDetail,
} from 'src/types/data-scope';

import request from 'src/api/request';

export async function getDataScopes(
  params?: PageParams & { name?: string; status?: number }
): Promise<PageData<DataScopeDetail>> {
  return request.get('/sys/data-scopes', { params });
}

export async function getAllDataScopes(): Promise<DataScopeDetail[]> {
  return request.get('/sys/data-scopes/all');
}

export async function getDataScope(pk: number): Promise<DataScopeDetail> {
  return request.get(`/sys/data-scopes/${pk}`);
}

export async function getDataScopeRules(pk: number): Promise<DataScopeWithRelationDetail> {
  return request.get(`/sys/data-scopes/${pk}/rules`);
}

export async function createDataScope(data: CreateDataScopeParam): Promise<void> {
  return request.post('/sys/data-scopes', data);
}

export async function updateDataScope(pk: number, data: UpdateDataScopeParam): Promise<void> {
  return request.put(`/sys/data-scopes/${pk}`, data);
}

export async function updateDataScopeRules(pk: number, data: UpdateDataScopeRuleParam): Promise<void> {
  return request.put(`/sys/data-scopes/${pk}/rules`, data);
}

export async function deleteDataScopes(pks: number[]): Promise<void> {
  return request.delete('/sys/data-scopes', { data: { pks } });
}
