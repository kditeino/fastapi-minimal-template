import type { ServerMonitorInfo } from 'src/types/monitor';

import request from 'src/api/request';

export async function getServerInfo(): Promise<ServerMonitorInfo> {
  return request.get('/monitors/server');
}
