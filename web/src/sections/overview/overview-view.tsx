import type { OperaLogDetail } from 'src/types/log';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { StatusType } from 'src/api/types';
import { getUsers } from 'src/api/sys/user';
import { getRoles } from 'src/api/sys/role';
import { getLoginLogs } from 'src/api/log/login';
import { getOperaLogs } from 'src/api/log/operation';
import { getSessions } from 'src/api/monitor/session';

import { Label } from 'src/components/label';
import { Iconify, type IconifyName } from 'src/components/iconify';
import { TableNoData, TableEmptyRows, TableHeadCustom } from 'src/components/table';

// ----------------------------------------------------------------------

interface StatCard {
  icon: IconifyName;
  label: string;
  value: string | number;
  color: string;
}

const LOG_HEAD_CELLS = [
  { id: 'username', label: '用户名' },
  { id: 'method', label: '请求方法' },
  { id: 'title', label: '操作' },
  { id: 'path', label: '路径' },
  { id: 'ip', label: 'IP' },
  { id: 'status', label: '状态' },
  { id: 'cost_time', label: '耗时' },
  { id: 'opera_time', label: '操作时间' },
];

// ----------------------------------------------------------------------

export function OverviewView() {
  const PAGE_SIZE = 10;

  const [logs, setLogs] = useState<OperaLogDetail[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, onlineUsers: 0, todayLogins: 0, totalRoles: 0 });

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [usersData, rolesData, sessions, todayLoginData] = await Promise.all([
        getUsers({ page: 1, size: 1 }),
        getRoles({ page: 1, size: 1 }),
        getSessions(),
        getLoginLogs({ page: 1, size: 1 }),
      ]);
      setStats({
        totalUsers: usersData.total,
        onlineUsers: sessions.length,
        todayLogins: todayLoginData.total,
        totalRoles: rolesData.total,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const fetchLogs = async () => {
      setLogsLoading(true);
      try {
        const data = await getOperaLogs({ page: 1, size: 10 });
        setLogs(data.items);
      } catch (error) {
        console.error(error);
      } finally {
        setLogsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const statCards: StatCard[] = [
    {
      icon: 'solar:users-group-rounded-bold-duotone',
      label: '总用户数',
      value: stats.totalUsers,
      color: 'primary.main',
    },
    {
      icon: 'solar:users-group-rounded-bold',
      label: '在线用户',
      value: stats.onlineUsers,
      color: 'success.main',
    },
    {
      icon: 'solar:home-angle-bold-duotone',
      label: '今日登录',
      value: stats.todayLogins,
      color: 'warning.main',
    },
    {
      icon: 'solar:shield-keyhole-bold-duotone',
      label: '角色总数',
      value: stats.totalRoles,
      color: 'info.main',
    },
  ];

  const notFound = !logsLoading && logs.length === 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Iconify icon={card.icon} width={48} sx={{ color: card.color, mb: 1 }} />
              {statsLoading ? (
                <Skeleton variant="text" width={60} sx={{ mx: 'auto', fontSize: '2rem' }} />
              ) : (
                <Typography variant="h3">{card.value}</Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {card.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Operation Logs */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        最近操作日志
      </Typography>

      <Card>
        <TableContainer>
          <Table>
            <TableHeadCustom headCells={LOG_HEAD_CELLS} />
            <TableBody>
              {logs.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.username ?? '—'}</TableCell>
                  <TableCell>{row.method}</TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.path}
                  </TableCell>
                  <TableCell>{row.ip}</TableCell>
                  <TableCell>
                    <Label
                      variant="soft"
                      color={row.status === StatusType.ENABLE ? 'success' : 'error'}
                    >
                      {row.status === StatusType.ENABLE ? '成功' : '失败'}
                    </Label>
                  </TableCell>
                  <TableCell>{row.cost_time}ms</TableCell>
                  <TableCell>{row.opera_time}</TableCell>
                </TableRow>
              ))}

              <TableEmptyRows emptyRows={PAGE_SIZE - logs.length} height={52} />
              <TableNoData notFound={notFound} />
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
