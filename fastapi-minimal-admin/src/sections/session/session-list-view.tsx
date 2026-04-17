import type { TokenDetail } from 'src/types/token';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';

import { StatusType } from 'src/api/types';
import { getSessions, forceOffline } from 'src/api/monitor/session';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useTable, TableNoData, TableEmptyRows, TableHeadCustom } from 'src/components/table';

import { PermissionGuard } from 'src/auth/guard/permission-guard';

// ----------------------------------------------------------------------

const HEAD_CELLS = [
  { id: 'username', label: '用户名' },
  { id: 'nickname', label: '昵称' },
  { id: 'ip', label: 'IP' },
  { id: 'browser', label: '浏览器' },
  { id: 'os', label: '系统' },
  { id: 'device', label: '设备' },
  { id: 'status', label: '状态' },
  { id: 'last_login_time', label: '登录时间' },
  { id: 'expire_time', label: '过期时间' },
  { id: 'actions', label: '操作', align: 'right' as const },
];

// ----------------------------------------------------------------------

type RowActionsProps = {
  row: TokenDetail;
  onForceOffline: (pk: number, session_uuid: string) => void;
};

function RowActions({ row, onForceOffline }: RowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <PermissionGuard permission="sys:session:del">
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<Iconify icon="solar:forbidden-circle-bold" />}
          onClick={() => setConfirmOpen(true)}
        >
          强制下线
        </Button>
      </PermissionGuard>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="强制下线"
        content={`确认将用户 "${row.username}" 强制下线？`}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => { onForceOffline(row.id, row.session_uuid); setConfirmOpen(false); }}
          >
            确认
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

export function SessionListView() {
  const table = useTable({ defaultRowsPerPage: 10 });

  const [sessions, setSessions] = useState<TokenDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');

  const fetchSessions = useCallback(async (username?: string) => {
    setLoading(true);
    try {
      const data = await getSessions(username ? { username } : undefined);
      setSessions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSearch = useCallback(() => {
    fetchSessions(searchUsername || undefined);
  }, [fetchSessions, searchUsername]);

  const handleForceOffline = useCallback(async (pk: number, session_uuid: string) => {
    try {
      await forceOffline(pk, session_uuid);
      fetchSessions(searchUsername || undefined);
    } catch (error) {
      console.error(error);
    }
  }, [fetchSessions, searchUsername]);

  const notFound = !loading && sessions.length === 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="搜索用户名"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mr: 1 }}
        />
        <Button variant="contained" onClick={handleSearch}>
          搜索
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHeadCustom headCells={HEAD_CELLS} />
            <TableBody>
              {sessions.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.username}</TableCell>
                  <TableCell>{row.nickname}</TableCell>
                  <TableCell>{row.ip}</TableCell>
                  <TableCell>{row.browser}</TableCell>
                  <TableCell>{row.os}</TableCell>
                  <TableCell>{row.device}</TableCell>
                  <TableCell>
                    <Label
                      variant="soft"
                      color={row.status === StatusType.ENABLE ? 'success' : 'error'}
                    >
                      {row.status === StatusType.ENABLE ? '在线' : '离线'}
                    </Label>
                  </TableCell>
                  <TableCell>{row.last_login_time}</TableCell>
                  <TableCell>{row.expire_time}</TableCell>
                  <TableCell align="right">
                    <RowActions row={row} onForceOffline={handleForceOffline} />
                  </TableCell>
                </TableRow>
              ))}

              <TableEmptyRows emptyRows={table.rowsPerPage - sessions.length} height={52} />
              <TableNoData notFound={notFound} />
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
