import type { LoginLogDetail } from 'src/types/log';
import type { PageData, PageParams } from 'src/api/types';

import request from 'src/api/request';

export async function getLoginLogs(
  params?: PageParams & { username?: string; status?: number; ip?: string }
): Promise<PageData<LoginLogDetail>> {
  return request.get('/logs/login', { params });
}

export async function deleteLoginLogs(pks: number[]): Promise<void> {
  return request.delete('/logs/login', { data: { pks } });
}

export async function deleteAllLoginLogs(): Promise<void> {
  return request.delete('/logs/login/all');
}
