import type { RedisMonitorInfo, ServerMonitorInfo } from 'src/types/monitor';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { getRedisInfo } from 'src/api/monitor/redis';
import { getServerInfo } from 'src/api/monitor/server';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import { TableHeadCustom } from 'src/components/table';

// ----------------------------------------------------------------------

const DISK_HEAD_CELLS = [
  { id: 'dir', label: '挂载点' },
  { id: 'device', label: '设备' },
  { id: 'type', label: '类型' },
  { id: 'total', label: '总容量' },
  { id: 'used', label: '已使用' },
  { id: 'free', label: '剩余' },
  { id: 'usage', label: '使用率' },
];

// ----------------------------------------------------------------------

function UsageGauge({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={value}
          size={120}
          thickness={6}
          sx={{ color }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h5">{value.toFixed(1)}%</Typography>
        </Box>
      </Box>
      <Typography variant="subtitle2" sx={{ mt: 1 }}>
        {label}
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function MonitorView() {
  const [serverInfo, setServerInfo] = useState<ServerMonitorInfo | null>(null);
  const [redisInfo, setRedisInfo] = useState<RedisMonitorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [server, redis] = await Promise.all([getServerInfo(), getRedisInfo()]);
      setServerInfo(server);
      setRedisInfo(redis);
    } catch (error) {
      console.error('Failed to fetch monitor info:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const commandChartOptions = useChart({
    xaxis: {
      categories: redisInfo?.stats.map((s) => s.name) ?? [],
    },
    tooltip: { y: { formatter: (val: number) => `${val}` } },
  });

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!serverInfo || !redisInfo) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">无法加载监控数据</Typography>
      </Box>
    );
  }

  const { cpu, mem, sys, disk, service } = serverInfo;

  return (
    <Box sx={{ p: 3 }}>
      {/* System Info */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="系统信息" avatar={<Iconify icon="solar:file-bold-duotone" width={24} />} />
        <CardContent>
          <Grid container spacing={2}>
            {[
              { label: '主机名', value: sys.name },
              { label: '操作系统', value: sys.os },
              { label: 'IP 地址', value: sys.ip },
              { label: '架构', value: sys.arch },
              { label: '服务名', value: service.name },
              { label: '服务版本', value: service.version },
              { label: '启动时间', value: service.startup },
              { label: '运行时长', value: service.elapsed },
            ].map((item) => (
              <Grid key={item.label} size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="body2">{item.value || '—'}</Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* CPU & Memory Gauges */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <CardHeader
              title="CPU 使用率"
              avatar={<Iconify icon="solar:atom-bold-duotone" width={24} />}
              sx={{ p: 0, mb: 3 }}
            />
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={4}>
              <UsageGauge
                value={cpu.usage}
                label="CPU"
                color={cpu.usage > 80 ? '#FF4842' : cpu.usage > 60 ? '#FFC107' : '#54D62C'}
              />
              <Stack spacing={1} sx={{ minWidth: 160 }}>
                <Typography variant="body2">
                  物理核心: <strong>{cpu.physical_num}</strong>
                </Typography>
                <Typography variant="body2">
                  逻辑核心: <strong>{cpu.logical_num}</strong>
                </Typography>
                <Typography variant="body2">
                  当前频率: <strong>{cpu.current_freq.toFixed(0)} MHz</strong>
                </Typography>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <CardHeader
              title="内存使用率"
              avatar={<Iconify icon="solar:ssd-round-bold" width={24} />}
              sx={{ p: 0, mb: 3 }}
            />
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={4}>
              <UsageGauge
                value={mem.usage}
                label="内存"
                color={mem.usage > 80 ? '#FF4842' : mem.usage > 60 ? '#FFC107' : '#54D62C'}
              />
              <Stack spacing={1} sx={{ minWidth: 160 }}>
                <Typography variant="body2">
                  总计: <strong>{formatBytes(mem.total)}</strong>
                </Typography>
                <Typography variant="body2">
                  已使用: <strong>{formatBytes(mem.used)}</strong>
                </Typography>
                <Typography variant="body2">
                  空闲: <strong>{formatBytes(mem.free)}</strong>
                </Typography>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Disk Info */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="磁盘信息" avatar={<Iconify icon="solar:atom-bold-duotone" width={24} />} />
        <TableContainer>
          <Table>
            <TableHeadCustom headCells={DISK_HEAD_CELLS} />
            <TableBody>
              {disk.map((d) => (
                <TableRow key={d.dir} hover>
                  <TableCell>{d.dir}</TableCell>
                  <TableCell>{d.device}</TableCell>
                  <TableCell>{d.type}</TableCell>
                  <TableCell>{d.total}</TableCell>
                  <TableCell>{d.used}</TableCell>
                  <TableCell>{d.free}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <LinearProgress
                        variant="determinate"
                        value={parseFloat(d.usage)}
                        sx={{ width: 80, height: 6, borderRadius: 1 }}
                        color={parseFloat(d.usage) > 80 ? 'error' : 'primary'}
                      />
                      <Typography variant="body2">{d.usage}%</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Redis Info & Command Stats */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardHeader
              title="Redis 信息"
              avatar={<Iconify icon="solar:shield-keyhole-bold-duotone" width={24} />}
            />
            <CardContent>
              <Stack spacing={1.5}>
                {[
                  { label: '版本', value: redisInfo.info.redis_version },
                  { label: '模式', value: redisInfo.info.redis_mode },
                  { label: '角色', value: redisInfo.info.role },
                  { label: '端口', value: redisInfo.info.tcp_port },
                  { label: '运行时间', value: `${redisInfo.info.uptime}s` },
                  { label: '已连接客户端', value: redisInfo.info.connected_clients },
                  { label: '阻塞客户端', value: redisInfo.info.blocked_clients },
                  { label: '已用内存', value: redisInfo.info.used_memory_human },
                  { label: 'RSS 内存', value: redisInfo.info.used_memory_rss_human },
                  { label: '最大内存', value: redisInfo.info.maxmemory_human || '不限制' },
                  { label: '碎片率', value: redisInfo.info.mem_fragmentation_ratio },
                  { label: 'OPS/秒', value: redisInfo.info.instantaneous_ops_per_sec },
                  { label: '总命令数', value: redisInfo.info.total_commands_processed },
                  { label: '拒绝连接', value: redisInfo.info.rejected_connections },
                  { label: 'Key 数量', value: redisInfo.info.keys_num },
                ].map((item) => (
                  <Stack key={item.label} direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {item.value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardHeader
              title="Redis 命令统计"
              avatar={<Iconify icon="solar:bill-list-bold-duotone" width={24} />}
            />
            <CardContent>
              {redisInfo.stats.length > 0 ? (
                <Chart
                  type="bar"
                  series={[{ name: '调用次数', data: redisInfo.stats.map((s) => Number(s.value)) }]}
                  options={commandChartOptions}
                  sx={{ height: 400 }}
                />
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  暂无命令统计
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// ----------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
}
