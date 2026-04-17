import type { StatusType } from 'src/api/types';
import type { DataRuleDetail } from './data-rule';

export interface DataScopeDetail {
  id: number;
  name: string;
  status: StatusType;
  created_time: string;
  updated_time: string | null;
}

export interface DataScopeWithRelationDetail extends DataScopeDetail {
  rules: (DataRuleDetail | null)[];
}

export interface CreateDataScopeParam {
  name: string;
  status: StatusType;
}

export interface UpdateDataScopeParam extends CreateDataScopeParam {}

export interface UpdateDataScopeRuleParam {
  rules: number[];
}
