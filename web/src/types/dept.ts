import type { StatusType } from 'src/api/types';

export interface DeptDetail {
  id: number;
  name: string;
  parent_id: number | null;
  sort: number;
  leader: string | null;
  phone: string | null;
  email: string | null;
  status: StatusType;
  del_flag: boolean;
  created_time: string;
  updated_time: string | null;
}

export interface DeptTree extends DeptDetail {
  children: DeptTree[] | null;
}

export interface CreateDeptParam {
  name: string;
  parent_id?: number | null;
  sort?: number;
  leader?: string | null;
  phone?: string | null;
  email?: string | null;
  status: StatusType;
}

export interface UpdateDeptParam extends CreateDeptParam {}
