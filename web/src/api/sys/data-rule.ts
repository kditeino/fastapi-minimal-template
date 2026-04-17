import type { PageData, PageParams } from 'src/api/types';
import type {
  DataRuleDetail,
  CreateDataRuleParam,
  UpdateDataRuleParam,
  DataRuleColumnDetail,
  DataRuleTemplateVariableDetail,
} from 'src/types/data-rule';

import request from 'src/api/request';

export async function getDataRules(
  params?: PageParams & { name?: string }
): Promise<PageData<DataRuleDetail>> {
  return request.get('/sys/data-rules', { params });
}

export async function getAllDataRules(): Promise<DataRuleDetail[]> {
  return request.get('/sys/data-rules/all');
}

export async function getDataRule(pk: number): Promise<DataRuleDetail> {
  return request.get(`/sys/data-rules/${pk}`);
}

export async function getDataRuleModels(): Promise<string[]> {
  return request.get('/sys/data-rules/models');
}

export async function getDataRuleModelColumns(model: string): Promise<DataRuleColumnDetail[]> {
  return request.get(`/sys/data-rules/models/${model}/columns`);
}

export async function getDataRuleTemplateVariables(): Promise<DataRuleTemplateVariableDetail[]> {
  return request.get('/sys/data-rules/value-template-variables');
}

export async function createDataRule(data: CreateDataRuleParam): Promise<void> {
  return request.post('/sys/data-rules', data);
}

export async function updateDataRule(pk: number, data: UpdateDataRuleParam): Promise<void> {
  return request.put(`/sys/data-rules/${pk}`, data);
}

export async function deleteDataRules(pks: number[]): Promise<void> {
  return request.delete('/sys/data-rules', { data: { pks } });
}
