import type { PageParams } from 'src/api/types';
import type { OperaLogDetail } from 'src/types/log';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';

import { StatusType } from 'src/api/types';
import { getOperaLogs } from 'src/api/log/operation';

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
  { id: 'trace_id', label: '追踪ID' },
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

export function OperaLogListView() {
  const table = useTable({ defaultRowsPerPage: 10 });

  const [rows, setRows] = useState<OperaLogDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: PageParams & { username?: string; status?: number } = {
        page: table.page + 1,
        size: table.rowsPerPage,
      };
      if (searchUsername) params.username = searchUsername;
      if (filterStatus !== '') params.status = Number(filterStatus);

      const data = await getOperaLogs(params);
      setRows(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, searchUsername, filterStatus]);

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

        <FormControl size="small" sx={{ width: 120 }}>
          <InputLabel>状态</InputLabel>
          <Select
            label="状态"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              table.onResetPage();
            }}
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value={String(StatusType.ENABLE)}>成功</MenuItem>
            <MenuItem value={String(StatusType.DISABLE)}>失败</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHeadCustom headCells={HEAD_CELLS} />
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {row.trace_id}
                  </TableCell>
                  <TableCell>{row.username ?? '—'}</TableCell>
                  <TableCell>{row.method}</TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
