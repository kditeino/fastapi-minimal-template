export interface CpuInfo {
  physical_num: number;
  logical_num: number;
  max_freq: number;
  min_freq: number;
  current_freq: number;
  usage: number;
}

export interface MemInfo {
  total: number;
  used: number;
  free: number;
  usage: number;
}

export interface SysInfo {
  name: string;
  os: string;
  ip: string;
  arch: string;
}

export interface DiskInfo {
  dir: string;
  device: string;
  type: string;
  total: string;
  used: string;
  free: string;
  usage: string;
}

export interface ServiceInfo {
  name: string;
  version: string;
  home: string;
  startup: string;
  elapsed: string;
  cpu_usage: string;
  mem_vms: string;
  mem_rss: string;
  mem_free: string;
}

export interface ServerMonitorInfo {
  cpu: CpuInfo;
  mem: MemInfo;
  sys: SysInfo;
  disk: DiskInfo[];
  service: ServiceInfo;
}

export interface RedisServerInfo {
  redis_version: string;
  redis_mode: string;
  role: string;
  tcp_port: string;
  uptime: string;
  connected_clients: string;
  blocked_clients: string;
  used_memory_human: string;
  used_memory_rss_human: string;
  maxmemory_human: string;
  mem_fragmentation_ratio: string;
  instantaneous_ops_per_sec: string;
  total_commands_processed: string;
  rejected_connections: string;
  keys_num: string;
}

export interface RedisCommandStat {
  name: string;
  value: string;
}

export interface RedisMonitorInfo {
  info: RedisServerInfo;
  stats: RedisCommandStat[];
}
