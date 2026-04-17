import type { PageData, PageParams } from 'src/api/types';
import type { TaskSchedulerDetail, CreateTaskSchedulerParam, UpdateTaskSchedulerParam } from 'src/types/task';

import request from 'src/api/request';

export async function getSchedulers(
  params?: PageParams & { name?: string; type?: number }
): Promise<PageData<TaskSchedulerDetail>> {
  return request.get('/schedulers', { params });
}

export async function getAllSchedulers(): Promise<TaskSchedulerDetail[]> {
  return request.get('/schedulers/all');
}

export async function getScheduler(pk: number): Promise<TaskSchedulerDetail> {
  return request.get(`/schedulers/${pk}`);
}

export async function createScheduler(data: CreateTaskSchedulerParam): Promise<void> {
  return request.post('/schedulers', data);
}

export async function updateScheduler(pk: number, data: UpdateTaskSchedulerParam): Promise<void> {
  return request.put(`/schedulers/${pk}`, data);
}

export async function deleteSchedulers(pk: number): Promise<void> {
  return request.delete(`/schedulers/${pk}`);
}

export async function toggleScheduler(pk: number): Promise<void> {
  return request.put(`/schedulers/${pk}/status`);
}

export async function executeScheduler(pk: number): Promise<void> {
  return request.post(`/schedulers/${pk}/execute`);
}
