import type { OperaLogDetail } from 'src/types/log';
import type { PageData, PageParams } from 'src/api/types';

import request from 'src/api/request';

export async function getOperaLogs(
  params?: PageParams & { username?: string; status?: number; ip?: string }
): Promise<PageData<OperaLogDetail>> {
  return request.get('/logs/opera', { params });
}

export async function deleteOperaLogs(pks: number[]): Promise<void> {
  return request.delete('/logs/opera', { data: { pks } });
}

export async function deleteAllOperaLogs(): Promise<void> {
  return request.delete('/logs/opera/all');
}
