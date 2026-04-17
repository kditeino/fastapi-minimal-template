import type { DeptDetail } from './dept';
import type { StatusType } from 'src/api/types';
import type { RoleWithRelationDetail } from './role';

export interface UserInfo {
  id: number;
  uuid: string;
  dept_id: number | null;
  username: string;
  nickname: string;
  real_name: string | null;
  avatar: string | null;
  email: string | null;
  phone: string | null;
  status: StatusType;
  is_superuser: boolean;
  is_staff: boolean;
  is_multi_login: boolean;
  join_time: string;
  last_login_time: string | null;
}

export interface UserInfoWithRelation extends UserInfo {
  dept: DeptDetail | null;
  roles: RoleWithRelationDetail[];
}

export interface CurrentUserInfo extends UserInfo {
  dept: string | null;
  roles: string[];
}

export interface AuthLoginParam {
  username: string;
  password: string;
  uuid?: string;
  captcha?: string;
}

export interface AddUserParam {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
  phone?: string;
  dept_id: number;
  roles: number[];
}

export interface UpdateUserParam {
  dept_id?: number;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  roles: number[];
}

export interface ResetPasswordParam {
  old_password: string;
  new_password: string;
  confirm_password: string;
}
