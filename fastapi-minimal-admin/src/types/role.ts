import type { MenuDetail } from './menu';
import type { StatusType } from 'src/api/types';
import type { DataScopeWithRelationDetail } from './data-scope';

export interface RoleDetail {
  id: number;
  name: string;
  status: StatusType;
  is_filter_scopes: boolean;
  remark: string | null;
  created_time: string;
  updated_time: string | null;
}

export interface RoleWithRelationDetail extends RoleDetail {
  menus: (MenuDetail | null)[];
  scopes: (DataScopeWithRelationDetail | null)[];
}

export interface CreateRoleParam {
  name: string;
  status: StatusType;
  is_filter_scopes?: boolean;
  remark?: string | null;
}

export interface UpdateRoleParam extends CreateRoleParam {}

export interface UpdateRoleMenuParam {
  menus: number[];
}

export interface UpdateRoleScopeParam {
  scopes: number[];
}
