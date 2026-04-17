import type { DeptTree } from 'src/types/dept';
import type { RoleDetail } from 'src/types/role';
import type { UserInfoWithRelation } from 'src/types/user';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';

import { StatusType } from 'src/api/types';
import { getUsers } from 'src/api/sys/user';
import { syncWecom } from 'src/api/sys/wecom';
import { getAllRoles } from 'src/api/sys/role';
import { getDeptTree } from 'src/api/sys/dept';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import {
  useTable,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { PermissionGuard } from 'src/auth/guard/permission-guard';

import { UserTableRow } from './user-table-row';
import { UserFormDialog } from './user-form-dialog';

// ----------------------------------------------------------------------

const HEAD_CELLS = [
  { id: 'real_name', label: '真实姓名' },
  { id: 'nickname', label: '昵称' },
  { id: 'username', label: '用户名' },
  { id: 'dept', label: '部门' },
  { id: 'roles', label: '岗位/角色' },
  { id: 'phone', label: '手机号' },
  { id: 'status', label: '状态' },
  { id: 'actions', label: '操作', align: 'right' as const },
];

export function UserListView() {
  const table = useTable({ defaultRowsPerPage: 10 });

  const [users, setUsers] = useState<UserInfoWithRelation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [deptList, setDeptList] = useState<DeptTree[]>([]);
  const [roleList, setRoleList] = useState<RoleDetail[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState<UserInfoWithRelation | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: table.page + 1,
        size: table.rowsPerPage,
      };
      if (searchUsername) params.username = searchUsername;
      if (filterStatus !== '') params.status = Number(filterStatus);

      const data = await getUsers(params);
      setUsers(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, searchUsername, filterStatus]);

  const fetchSupport = useCallback(async () => {
    try {
      const [depts, roles] = await Promise.all([getDeptTree(), getAllRoles()]);
      setDeptList(depts);
      setRoleList(roles);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchSupport();
  }, [fetchSupport]);

  const handleEdit = useCallback((row: UserInfoWithRelation) => {
    setEditRow(row);
    setDialogOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditRow(null);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      const { deleteUser } = await import('src/api/sys/user');
      await deleteUser(id);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  }, [fetchUsers]);

  const handleResetPassword = useCallback(async (row: UserInfoWithRelation) => {
    try {
      const { resetPassword } = await import('src/api/sys/user');
      await resetPassword(row.id, '123456');
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditRow(null);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSyncWecom = useCallback(async () => {
    setSyncing(true);
    try {
      const r = await syncWecom();
      toast.success(
        `同步完成：部门 +${r.dept_created}/更新 ${r.dept_updated}，` +
          `用户 +${r.user_created}/更新 ${r.user_updated}/禁用 ${r.user_disabled}`
      );
      if (r.errors?.length) {
        toast.error(`有 ${r.errors.length} 条错误，详见控制台`);
        console.warn('[wecom sync errors]', r.errors);
      }
      fetchUsers();
    } catch (error: any) {
      toast.error(`同步失败：${error?.message || error}`);
    } finally {
      setSyncing(false);
    }
  }, [fetchUsers]);

  const notFound = !loading && users.length === 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Toolbar */}
      <Box sx={{ mb: 2, gap: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="搜索 用户名 / 昵称 / 姓名 / 岗位"
          value={searchUsername}
          onChange={(e) => {
            setSearchUsername(e.target.value);
            table.onResetPage();
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:list-bold" width={16} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 300 }}
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

        <Button
          variant="outlined"
          startIcon={<Iconify icon="solar:restart-bold" />}
          onClick={handleSyncWecom}
          disabled={syncing}
        >
          {syncing ? '同步中…' : '同步企业微信通讯录'}
        </Button>

        <PermissionGuard permission="sys:user:add">
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:user-plus-bold" />}
            onClick={handleCreate}
          >
            新建用户
          </Button>
        </PermissionGuard>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHeadCustom headCells={HEAD_CELLS} />
            <TableBody>
              {users.map((row) => (
                <UserTableRow
                  key={row.id}
                  row={row}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onResetPassword={handleResetPassword}
                />
              ))}

              <TableEmptyRows emptyRows={table.rowsPerPage - users.length} height={52} />

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

      <UserFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
        editRow={editRow}
        deptList={deptList}
        roleList={roleList}
      />
    </Box>
  );
}
