import type { PageParams } from 'src/api/types';
import type { LoginLogDetail } from 'src/types/log';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';

import { getLoginLogs } from 'src/api/log/login';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import {
  useTable,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

// ----------------------------------------------------------------------

const HEAD_CELLS = [
  { id: 'username', label: '用户名' },
  { id: 'ip', label: 'IP' },
  { id: 'browser', label: '浏览器' },
  { id: 'os', label: '操作系统' },
  { id: 'msg', label: '消息' },
  { id: 'status', label: '状态' },
  { id: 'login_time', label: '登录时间' },
];

// ----------------------------------------------------------------------

export function LoginLogListView() {
  const table = useTable({ defaultRowsPerPage: 10 });

  const [rows, setRows] = useState<LoginLogDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: PageParams & { username?: string } = {
        page: table.page + 1,
        size: table.rowsPerPage,
      };
      if (searchUsername) params.username = searchUsername;

      const data = await getLoginLogs(params);
      setRows(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, searchUsername]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const notFound = !loading && rows.length === 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, gap: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="搜索用户名"
          value={searchUsername}
          onChange={(e) => {
            setSearchUsername(e.target.value);
            table.onResetPage();
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={16} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 200 }}
        />
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHeadCustom headCells={HEAD_CELLS} />
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.username}</TableCell>
                  <TableCell>{row.ip}</TableCell>
                  <TableCell>{row.browser ?? '—'}</TableCell>
                  <TableCell>{row.os ?? '—'}</TableCell>
                  <TableCell>{row.msg}</TableCell>
                  <TableCell>
                    <Label
                      variant="soft"
                      color={row.status === 0 ? 'success' : 'error'}
                    >
                      {row.status === 0 ? '成功' : '失败'}
                    </Label>
                  </TableCell>
                  <TableCell>{row.login_time}</TableCell>
                </TableRow>
              ))}

              <TableEmptyRows emptyRows={table.rowsPerPage - rows.length} height={52} />
              <TableNoData notFound={notFound} />
            </TableBody>
          </Table>
        </TableContainer>

        <TablePaginationCustom
          page={table.page}
          count={total}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
}
