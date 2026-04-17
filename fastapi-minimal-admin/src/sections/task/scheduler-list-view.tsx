import type { TaskSchedulerDetail } from 'src/types/task';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import {
  getSchedulers,
  toggleScheduler,
  deleteSchedulers,
  executeScheduler,
} from 'src/api/task/scheduler';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';
import {
  useTable,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { PermissionGuard } from 'src/auth/guard/permission-guard';

import { SchedulerFormDialog } from './scheduler-form-dialog';

// ----------------------------------------------------------------------

const HEAD_CELLS = [
  { id: 'name', label: '任务名称' },
  { id: 'task', label: '任务路径' },
  { id: 'type', label: '调度类型' },
  { id: 'schedule', label: '调度规则' },
  { id: 'enabled', label: '启用' },
  { id: 'total_run_count', label: '运行次数' },
  { id: 'last_run_time', label: '上次运行' },
  { id: 'actions', label: '操作', align: 'right' as const },
];

// ----------------------------------------------------------------------

type RowActionsProps = {
  row: TaskSchedulerDetail;
  onEdit: (row: TaskSchedulerDetail) => void;
  onDelete: (id: number) => void;
  onExecute: (id: number) => void;
};

function RowActions({ row, onEdit, onDelete, onExecute }: RowActionsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Iconify icon="solar:pen-bold" />
      </IconButton>

      <CustomPopover open={!!anchorEl} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
        <Box sx={{ p: 0.5 }}>
          <MenuItem onClick={() => { onEdit(row); setAnchorEl(null); }}>
            <Iconify icon="solar:pen-bold" />
            编辑
          </MenuItem>
          <MenuItem onClick={() => { onExecute(row.id); setAnchorEl(null); }}>
            <Iconify icon="solar:play-circle-bold" />
            立即执行
          </MenuItem>
          <PermissionGuard permission="task:scheduler:del">
            <MenuItem
              onClick={() => { setConfirmOpen(true); setAnchorEl(null); }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
              删除
            </MenuItem>
          </PermissionGuard>
        </Box>
      </CustomPopover>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="删除调度任务"
        content={`确认删除调度任务 "${row.name}" ？`}
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

function getScheduleDisplay(row: TaskSchedulerDetail): string {
  if (row.type === 1) return row.crontab || '—';
  if (row.interval_every && row.interval_period) {
    return `每 ${row.interval_every} ${row.interval_period}`;
  }
  return '—';
}

// ----------------------------------------------------------------------

export function SchedulerListView() {
  const table = useTable({ defaultRowsPerPage: 10 });

  const [schedulers, setSchedulers] = useState<TaskSchedulerDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState<TaskSchedulerDetail | null>(null);

  const fetchSchedulers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSchedulers({ page: table.page + 1, size: table.rowsPerPage });
      setSchedulers(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage]);

  useEffect(() => {
    fetchSchedulers();
  }, [fetchSchedulers]);

  const handleCreate = useCallback(() => {
    setEditRow(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((row: TaskSchedulerDetail) => {
    setEditRow(row);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteSchedulers(id);
      fetchSchedulers();
    } catch (error) {
      console.error(error);
    }
  }, [fetchSchedulers]);

  const handleToggle = useCallback(async (id: number) => {
    try {
      await toggleScheduler(id);
      fetchSchedulers();
    } catch (error) {
      console.error(error);
    }
  }, [fetchSchedulers]);

  const handleExecute = useCallback(async (id: number) => {
    try {
      await executeScheduler(id);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const notFound = !loading && schedulers.length === 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <PermissionGuard permission="task:scheduler:add">
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={handleCreate}
          >
            新建调度
          </Button>
        </PermissionGuard>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHeadCustom headCells={HEAD_CELLS} />
            <TableBody>
              {schedulers.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{row.task}</TableCell>
                  <TableCell>
                    <Label variant="soft" color={row.type === 1 ? 'info' : 'warning'}>
                      {row.type === 1 ? 'Crontab' : 'Interval'}
                    </Label>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {getScheduleDisplay(row)}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={row.enabled}
                      onChange={() => handleToggle(row.id)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{row.total_run_count}</TableCell>
                  <TableCell>{row.last_run_time ?? '—'}</TableCell>
                  <TableCell align="right">
                    <RowActions
                      row={row}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onExecute={handleExecute}
                    />
                  </TableCell>
                </TableRow>
              ))}

              <TableEmptyRows emptyRows={table.rowsPerPage - schedulers.length} height={52} />
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

      <SchedulerFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchSchedulers}
        editRow={editRow}
      />
    </Box>
  );
}
