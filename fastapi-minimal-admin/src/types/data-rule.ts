// operator: AND | OR
export type RoleDataRuleOperatorType = 'AND' | 'OR';

// expression types: eq, ne, gt, ge, lt, le, in, not_in, like, not_like, is_null, is_not_null
export type RoleDataRuleExpressionType =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'ge'
  | 'lt'
  | 'le'
  | 'in'
  | 'not_in'
  | 'like'
  | 'not_like'
  | 'is_null'
  | 'is_not_null';

export interface DataRuleDetail {
  id: number;
  name: string;
  model: string;
  column: string;
  operator: RoleDataRuleOperatorType;
  expression: RoleDataRuleExpressionType;
  value: string;
  created_time: string;
  updated_time: string | null;
}

export interface DataRuleColumnDetail {
  key: string;
  comment: string | null;
}

export interface DataRuleTemplateVariableDetail {
  key: string;
  comment: string;
}

export interface CreateDataRuleParam {
  name: string;
  model: string;
  column: string;
  operator: RoleDataRuleOperatorType;
  expression: RoleDataRuleExpressionType;
  value: string;
}

export interface UpdateDataRuleParam extends CreateDataRuleParam {}
