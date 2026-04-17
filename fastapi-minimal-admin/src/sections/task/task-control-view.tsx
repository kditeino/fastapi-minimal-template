import type { TaskRegisteredDetail } from 'src/api/task/control';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';

import { revokeTask, getRegisteredTasks } from 'src/api/task/control';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  useTable,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
} from 'src/components/table';

// ----------------------------------------------------------------------

const HEAD_CELLS = [
  { id: 'name', label: '任务名称' },
  { id: 'task', label: '任务路径' },
  { id: 'actions', label: '操作', align: 'right' as const },
];

// ----------------------------------------------------------------------

type RowActionsProps = {
  row: TaskRegisteredDetail;
  onRevoke: (taskName: string) => void;
};

function RowActions({ row, onRevoke }: RowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color="error"
        startIcon={<Iconify icon="solar:stop-circle-bold" />}
        onClick={() => setConfirmOpen(true)}
      >
        撤销
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="撤销任务"
        content={`确认撤销任务 "${row.name}" ？`}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => { onRevoke(row.task); setConfirmOpen(false); }}
          >
            确认
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

export function TaskControlView() {
  const table = useTable({ defaultRowsPerPage: 20 });

  const [tasks, setTasks] = useState<TaskRegisteredDetail[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRegisteredTasks();
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleRevoke = useCallback(async (taskPath: string) => {
    try {
      await revokeTask(taskPath);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  }, [fetchTasks]);

  const notFound = !loading && tasks.length === 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="solar:restart-bold" />}
          onClick={fetchTasks}
        >
          刷新
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHeadCustom headCells={HEAD_CELLS} />
            <TableBody>
              {tasks.map((row) => (
                <TableRow key={row.task} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{row.task}</TableCell>
                  <TableCell align="right">
                    <RowActions row={row} onRevoke={handleRevoke} />
                  </TableCell>
                </TableRow>
              ))}

              <TableEmptyRows emptyRows={table.rowsPerPage - tasks.length} height={52} />
              <TableNoData notFound={notFound} />
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
