import type { TokenDetail } from 'src/types/token';

import request from 'src/api/request';

export async function getSessions(params?: { username?: string }): Promise<TokenDetail[]> {
  return request.get('/monitors/sessions', { params });
}

export async function forceOffline(pk: number, session_uuid: string): Promise<void> {
  return request.delete(`/monitors/sessions/${pk}`, { params: { session_uuid } });
}
