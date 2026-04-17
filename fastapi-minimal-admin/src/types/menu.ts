import type { MenuType, StatusType } from 'src/api/types';

export interface MenuDetail {
  id: number;
  title: string;
  name: string;
  path: string | null;
  parent_id: number | null;
  sort: number;
  icon: string | null;
  type: MenuType;
  component: string | null;
  perms: string | null;
  status: StatusType;
  display: StatusType;
  cache: StatusType;
  link: string | null;
  remark: string | null;
  created_time: string;
  updated_time: string | null;
}

export interface MenuTree extends MenuDetail {
  children: MenuTree[] | null;
}

export interface CreateMenuParam {
  title: string;
  name: string;
  path?: string | null;
  parent_id?: number | null;
  sort?: number;
  icon?: string | null;
  type: MenuType;
  component?: string | null;
  perms?: string | null;
  status: StatusType;
  display: StatusType;
  cache: StatusType;
  link?: string | null;
  remark?: string | null;
}

export interface UpdateMenuParam extends CreateMenuParam {}
