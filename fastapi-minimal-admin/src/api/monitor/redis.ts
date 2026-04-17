import type { RedisMonitorInfo } from 'src/types/monitor';

import request from 'src/api/request';

export async function getRedisInfo(): Promise<RedisMonitorInfo> {
  return request.get('/monitors/redis');
}
