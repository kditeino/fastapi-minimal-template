import request from 'src/api/request';

export interface TaskRegisteredDetail {
  name: string;
  task: string;
}

export async function getRegisteredTasks(): Promise<TaskRegisteredDetail[]> {
  return request.get('/tasks/registered');
}

export async function revokeTask(taskId: string): Promise<void> {
  return request.delete(`/tasks/${taskId}/cancel`);
}
