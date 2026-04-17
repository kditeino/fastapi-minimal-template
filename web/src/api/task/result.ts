import type { TaskResultDetail } from 'src/types/task';
import type { PageData, PageParams } from 'src/api/types';

import request from 'src/api/request';

export async function getTaskResults(
  params?: PageParams & { name?: string; task_id?: string }
): Promise<PageData<TaskResultDetail>> {
  return request.get('/task-results', { params });
}

export async function deleteTaskResults(pks: number[]): Promise<void> {
  return request.delete('/task-results', { data: { pks } });
}
