export type PeriodType = 'days' | 'hours' | 'minutes' | 'seconds' | 'microseconds';
export type TaskSchedulerType = 0 | 1; // 0=interval, 1=crontab

export interface TaskSchedulerDetail {
  id: number;
  name: string;
  task: string;
  args: any | null;
  kwargs: any | null;
  queue: string | null;
  exchange: string | null;
  routing_key: string | null;
  start_time: string | null;
  expire_time: string | null;
  expire_seconds: number | null;
  type: TaskSchedulerType;
  interval_every: number | null;
  interval_period: PeriodType | null;
  crontab: string;
  one_off: boolean;
  remark: string | null;
  enabled: boolean;
  total_run_count: number;
  last_run_time: string | null;
  created_time: string;
  updated_time: string | null;
}

export interface CreateTaskSchedulerParam {
  name: string;
  task: string;
  args?: any | null;
  kwargs?: any | null;
  queue?: string | null;
  exchange?: string | null;
  routing_key?: string | null;
  start_time?: string | null;
  expire_time?: string | null;
  expire_seconds?: number | null;
  type: TaskSchedulerType;
  interval_every?: number | null;
  interval_period?: PeriodType | null;
  crontab?: string;
  one_off?: boolean;
  remark?: string | null;
}

export interface UpdateTaskSchedulerParam extends CreateTaskSchedulerParam {}

export interface TaskResultDetail {
  id: number;
  task_id: string;
  status: string;
  result: any | null;
  date_done: string | null;
  traceback: string | null;
  name: string | null;
  args: any | null;
  kwargs: any | null;
  worker: string | null;
  retries: number | null;
  queue: string | null;
}
