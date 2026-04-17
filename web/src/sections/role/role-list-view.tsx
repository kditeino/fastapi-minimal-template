import type { RoleDetail } from 'src/types/role';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { StatusType } from 'src/api/types';
import { getRoles, deleteRoles } from 'src/api/sys/role';

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

import { RoleFormDialog } from './role-form-dialog';
import { RoleMenuTreeDialog } from './role-menu-tree-dialog';

// ----------------------------------------------------------------------

const HEAD_CELLS = [
  { id: 'name', label: '角色名称' },
  { id: 'status', label: '状态' },
  { id: 'is_filter_scopes', label: '数据范围过滤' },
  { id: 'remark', label: '备注' },
  { id: 'actions', label: '操作', align: 'right' as const },
];

type RowActionsProps = {
  row: RoleDetail;
  onEdit: (row: RoleDetail) => void;
  onDelete: (id: number) => void;
  onAssignMenus: (row: RoleDetail) => void;
};

function RowActions({ row, onEdit, onDelete, onAssignMenus }: RowActionsProps) {
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
          <MenuItem onClick={() => { onAssignMenus(row); setAnchorEl(null); }}>
            <Iconify icon="solar:list-bold" />
            分配菜单
          </MenuItem>
          <PermissionGuard permission="sys:role:del">
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
        title="删除角色"
        content={`确认删除角色 "${row.name}" ？`}
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

export function RoleListView() {
  const table = useTable({ defaultRowsPerPage: 10 });

  const [roles, setRoles] = useState<RoleDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState<RoleDetail | null>(null);
  const [menuRole, setMenuRole] = useState<RoleDetail | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRoles({ page: table.page + 1, size: table.rowsPerPage });
      setRoles(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleEdit = useCallback((row: RoleDetail) => {
    setEditRow(row);
    setDialogOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditRow(null);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteRoles([id]);
      fetchRoles();
    } catch (error) {
      console.error(error);
    }
  }, [fetchRoles]);

  const handleAssignMenus = useCallback((row: RoleDetail) => {
    setMenuRole(row);
    setMenuDialogOpen(true);
  }, []);

  const notFound = !loading && roles.length === 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <PermissionGuard permission="sys:role:add">
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={handleCreate}
          >
            新建角色
          </Button>
        </PermissionGuard>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHeadCustom headCells={HEAD_CELLS} />
            <TableBody>
              {roles.map((row) => (
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
                  <TableCell>
                    <Label variant="soft" color={row.is_filter_scopes ? 'info' : 'default'}>
                      {row.is_filter_scopes ? '是' : '否'}
                    </Label>
                  </TableCell>
                  <TableCell>{row.remark ?? '—'}</TableCell>
                  <TableCell align="right">
                    <RowActions
                      row={row}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onAssignMenus={handleAssignMenus}
                    />
                  </TableCell>
                </TableRow>
              ))}

              <TableEmptyRows emptyRows={table.rowsPerPage - roles.length} height={52} />
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

      <RoleFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchRoles}
        editRow={editRow}
      />

      <RoleMenuTreeDialog
        open={menuDialogOpen}
        onClose={() => setMenuDialogOpen(false)}
        roleId={menuRole?.id ?? null}
        roleName={menuRole?.name ?? ''}
      />
    </Box>
  );
}
