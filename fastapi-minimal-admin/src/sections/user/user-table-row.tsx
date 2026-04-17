import type { UserInfoWithRelation } from 'src/types/user';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { StatusType } from 'src/api/types';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

import { PermissionGuard } from 'src/auth/guard/permission-guard';

// ----------------------------------------------------------------------

type UserTableRowProps = {
  row: UserInfoWithRelation;
  onEdit: (row: UserInfoWithRelation) => void;
  onDelete: (id: number) => void;
  onResetPassword: (row: UserInfoWithRelation) => void;
};

export function UserTableRow({ row, onEdit, onDelete, onResetPassword }: UserTableRowProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleEdit = useCallback(() => {
    onEdit(row);
    handleClosePopover();
  }, [onEdit, row, handleClosePopover]);

  const handleResetPassword = useCallback(() => {
    onResetPassword(row);
    handleClosePopover();
  }, [onResetPassword, row, handleClosePopover]);

  const handleDeleteClick = useCallback(() => {
    setConfirmOpen(true);
    handleClosePopover();
  }, [handleClosePopover]);

  const handleDeleteConfirm = useCallback(() => {
    onDelete(row.id);
    setConfirmOpen(false);
  }, [onDelete, row.id]);

  return (
    <>
      <TableRow hover>
        <TableCell>{row.real_name ?? '—'}</TableCell>
        <TableCell>{row.nickname}</TableCell>
        <TableCell>{row.username}</TableCell>
        <TableCell>{row.dept?.name ?? '—'}</TableCell>
        <TableCell>
          {row.roles && row.roles.length > 0 ? (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
              {row.roles.map((r) => (
                <Chip key={r.id} label={r.name} size="small" variant="soft" color="info" />
              ))}
            </Stack>
          ) : (
            '—'
          )}
        </TableCell>
        <TableCell>{row.phone ?? '—'}</TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={row.status === StatusType.ENABLE ? 'success' : 'error'}
          >
            {row.status === StatusType.ENABLE ? '启用' : '禁用'}
          </Label>
        </TableCell>
        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
      >
        <Box sx={{ p: 0.5 }}>
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            编辑
          </MenuItem>

          <MenuItem onClick={handleResetPassword}>
            <Iconify icon="solar:restart-bold" />
            重置密码
          </MenuItem>

          <PermissionGuard permission="sys:user:del">
            <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:trash-bin-trash-bold" />
              删除
            </MenuItem>
          </PermissionGuard>
        </Box>
      </CustomPopover>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="删除用户"
        content={`确认删除用户 "${row.username}" ？此操作不可撤销。`}
        action={
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            删除
          </Button>
        }
      />
    </>
  );
}
