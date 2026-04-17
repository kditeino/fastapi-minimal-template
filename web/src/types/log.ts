import type { StatusType } from 'src/api/types';

export interface OperaLogDetail {
  id: number;
  trace_id: string;
  username: string | null;
  method: string;
  title: string;
  path: string;
  ip: string;
  country: string | null;
  region: string | null;
  city: string | null;
  user_agent: string | null;
  os: string | null;
  browser: string | null;
  device: string | null;
  args: Record<string, any> | null;
  status: StatusType;
  code: string;
  msg: string | null;
  cost_time: number;
  opera_time: string;
  created_time: string;
}

export interface LoginLogDetail {
  id: number;
  user_uuid: string;
  username: string;
  status: number;
  ip: string;
  country: string | null;
  region: string | null;
  city: string | null;
  user_agent: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  msg: string;
  login_time: string;
  created_time: string;
}
