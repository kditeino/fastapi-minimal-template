import request from 'src/api/request';

export interface WecomSyncResult {
  dept_created: number;
  dept_updated: number;
  role_created: number;
  user_created: number;
  user_updated: number;
  user_disabled: number;
  errors: string[];
}

export async function syncWecom(params?: {
  default_password?: string;
  default_role_id?: number;
}): Promise<WecomSyncResult> {
  return request.post('/sys/wecom/sync', null, { params });
}
