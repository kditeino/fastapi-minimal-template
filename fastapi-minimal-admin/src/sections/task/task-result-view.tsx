import type { TaskResultDetail } from 'src/types/task';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';

import { getTaskResults, deleteTaskResults } from 'src/api/task/result';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  useTable,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { PermissionGuard } from 'src/auth/guard/permission-guard';

// ----------------------------------------------------------------------

const HEAD_CELLS = [
  { id: 'task_id', label: '任务ID' },
  { id: 'name', label: '任务名称' },
  { id: 'status', label: '状态' },
  { id: 'worker', label: 'Worker' },
  { id: 'date_done', label: '完成时间' },
  { id: 'retries', label: '重试次数' },
  { id: 'actions', label: '操作', align: 'right' as const },
];

function getStatusColor(status: string): 'success' | 'error' | 'warning' | 'default' {
  if (status === 'SUCCESS') return 'success';
  if (status === 'FAILURE') return 'error';
  if (status === 'PENDING') return 'warning';
  return 'default';
}

// ----------------------------------------------------------------------

type RowActionsProps = {
  row: TaskResultDetail;
  onDelete: (id: number) => void;
};

function RowActions({ row, onDelete }: RowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <PermissionGuard permission="task:result:del">
        <IconButton color="error" onClick={() => setConfirmOpen(true)}>
          <Iconify icon="solar:trash-bin-trash-bold" />
        </IconButton>
      </PermissionGuard>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="删除任务结果"
        content={`确认删除任务结果 "${row.task_id}" ？`}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => { onDelete(row.id); setConfirmOpen(false); }}
          >
            删除
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

export function TaskResultView() {
  const table = useTable({ defaultRowsPerPage: 10 });

  const [results, setResults] = useState<TaskResultDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: table.page + 1,
        size: table.rowsPerPage,
      };
      if (searchName) params.name = searchName;

      const data = await getTaskResults(params);
      setResults(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, searchName]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteTaskResults([id]);
      fetchResults();
    } catch (error) {
      console.error(error);
    }
  }, [fetchResults]);

  const notFound = !loading && results.length === 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="搜索任务名称"
          value={searchName}
          onChange={(e) => {
            setSearchName(e.target.value);
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
          sx={{ width: 240 }}
        />
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHeadCustom headCells={HEAD_CELLS} />
            <TableBody>
              {results.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {row.task_id}
                  </TableCell>
                  <TableCell>{row.name ?? '—'}</TableCell>
                  <TableCell>
                    <Label variant="soft" color={getStatusColor(row.status)}>
                      {row.status}
                    </Label>
                  </TableCell>
                  <TableCell>{row.worker ?? '—'}</TableCell>
                  <TableCell>{row.date_done ?? '—'}</TableCell>
                  <TableCell>{row.retries ?? 0}</TableCell>
                  <TableCell align="right">
                    <RowActions row={row} onDelete={handleDelete} />
                  </TableCell>
                </TableRow>
              ))}

              <TableEmptyRows emptyRows={table.rowsPerPage - results.length} height={52} />
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
