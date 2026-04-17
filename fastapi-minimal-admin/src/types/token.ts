import type { UserInfo } from './user';
import type { StatusType } from 'src/api/types';

export interface LoginToken {
  access_token: string;
  access_token_expire_time: string;
  session_uuid: string;
  password_expire_days_remaining: number | null;
  user: UserInfo;
}

export interface NewToken {
  access_token: string;
  access_token_expire_time: string;
  session_uuid: string;
}

export interface TokenDetail {
  id: number;
  session_uuid: string;
  username: string;
  nickname: string;
  ip: string;
  os: string;
  browser: string;
  device: string;
  status: StatusType;
  last_login_time: string;
  expire_time: string;
}
