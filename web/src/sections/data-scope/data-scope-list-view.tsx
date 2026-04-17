import type { DataScopeDetail } from 'src/types/data-scope';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';

import { StatusType } from 'src/api/types';
import { getDataScopes, deleteDataScopes } from 'src/api/sys/data-scope';

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

import { DataScopeFormDialog } from './data-scope-form-dialog';

// ----------------------------------------------------------------------

const HEAD_CELLS = [
  { id: 'name', label: '范围名称' },
  { id: 'status', label: '状态' },
  { id: 'created_time', label: '创建时间' },
  { id: 'actions', label: '操作', align: 'right' as const },
];

type RowActionsProps = {
  row: DataScopeDetail;
  onEdit: (row: DataScopeDetail) => void;
  onDelete: (id: number) => void;
};

function RowActions({ row, onEdit, onDelete }: RowActionsProps) {
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

          <PermissionGuard permission="sys:data-scope:del">
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
        title="删除数据范围"
        content={`确认删除数据范围 "${row.name}" ？`}
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

export function DataScopeListView() {
  const table = useTable({ defaultRowsPerPage: 10 });

  const [dataScopes, setDataScopes] = useState<DataScopeDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState<DataScopeDetail | null>(null);

  const fetchDataScopes = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: table.page + 1,
        size: table.rowsPerPage,
      };
      if (searchName) params.name = searchName;
      if (filterStatus !== '') params.status = Number(filterStatus);

      const data = await getDataScopes(params);
      setDataScopes(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, searchName, filterStatus]);

  useEffect(() => {
    fetchDataScopes();
  }, [fetchDataScopes]);

  const handleEdit = useCallback((row: DataScopeDetail) => {
    setEditRow(row);
    setDialogOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditRow(null);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteDataScopes([id]);
      fetchDataScopes();
    } catch (error) {
      console.error(error);
    }
  }, [fetchDataScopes]);

  const notFound = !loading && dataScopes.length === 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Toolbar */}
      <Box sx={{ mb: 2, gap: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="搜索范围名称"
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
          sx={{ width: 200 }}
        />

        <TextField
          select
          size="small"
          label="状态"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            table.onResetPage();
          }}
          sx={{ width: 120 }}
        >
          <MenuItem value="">全部</MenuItem>
          <MenuItem value={String(StatusType.ENABLE)}>启用</MenuItem>
          <MenuItem value={String(StatusType.DISABLE)}>禁用</MenuItem>
        </TextField>

        <Box sx={{ flexGrow: 1 }} />

        <PermissionGuard permission="sys:data-scope:add">
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={handleCreate}
          >
            新建数据范围
          </Button>
        </PermissionGuard>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHeadCustom headCells={HEAD_CELLS} />
            <TableBody>
              {dataScopes.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <Label
                      variant="soft"
                      color={row.status === StatusType.ENABLE ? 'success' : 'error'}
                    >
                      {row.status === StatusType.ENABLE ? '启用' : '禁用'}
                    </Label>
                  </TableCell>
                  <TableCell>{row.created_time}</TableCell>
                  <TableCell align="right">
                    <RowActions
                      row={row}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </TableCell>
                </TableRow>
              ))}

              <TableEmptyRows emptyRows={table.rowsPerPage - dataScopes.length} height={52} />
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

      <DataScopeFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchDataScopes}
        editRow={editRow}
      />
    </Box>
  );
}
