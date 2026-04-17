import type { DeptTree } from 'src/types/dept';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { StatusType } from 'src/api/types';
import { deleteDept, getDeptTree } from 'src/api/sys/dept';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

import { PermissionGuard } from 'src/auth/guard/permission-guard';

import { DeptFormDialog } from './dept-form-dialog';

// ----------------------------------------------------------------------

type DeptNodeProps = {
  node: DeptTree;
  deptList: DeptTree[];
  onRefresh: () => void;
  depth?: number;
};

function DeptNode({ node, deptList, onRefresh, depth = 0 }: DeptNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [editRow, setEditRow] = useState<DeptTree | null>(null);

  const hasChildren = node.children && node.children.length > 0;

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setEditRow(node);
    setFormOpen(true);
    handleClosePopover();
  };

  const handleAddChild = () => {
    setEditRow(null);
    setAddChildOpen(true);
    handleClosePopover();
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDept(node.id);
      onRefresh();
    } catch (error) {
      console.error(error);
    }
    setConfirmOpen(false);
  };

  return (
    <Box>
      <Box
        sx={{
          pl: depth * 3,
          py: 1,
          pr: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        {hasChildren ? (
          <IconButton size="small" onClick={() => setExpanded((prev) => !prev)}>
            <Iconify
              icon={expanded ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
              width={16}
            />
          </IconButton>
        ) : (
          <Box sx={{ width: 28 }} />
        )}

        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
          {node.name}
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ width: 120 }}>
          {node.leader ?? '—'}
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ width: 120 }}>
          {node.phone ?? '—'}
        </Typography>

        <Label
          variant="soft"
          color={node.status === StatusType.ENABLE ? 'success' : 'error'}
          sx={{ minWidth: 48 }}
        >
          {node.status === StatusType.ENABLE ? '启用' : '禁用'}
        </Label>

        <IconButton size="small" onClick={handleOpenPopover}>
          <Iconify icon="solar:pen-bold" width={16} />
        </IconButton>

        <CustomPopover open={!!anchorEl} anchorEl={anchorEl} onClose={handleClosePopover}>
          <Box sx={{ p: 0.5 }}>
            <PermissionGuard permission="sys:dept:add">
              <MenuItem onClick={handleAddChild}>
                <Iconify icon="solar:add-circle-bold" />
                添加子部门
              </MenuItem>
            </PermissionGuard>

            <PermissionGuard permission="sys:dept:edit">
              <MenuItem onClick={handleEdit}>
                <Iconify icon="solar:pen-bold" />
                编辑
              </MenuItem>
            </PermissionGuard>

            <PermissionGuard permission="sys:dept:del">
              <MenuItem
                onClick={() => { setConfirmOpen(true); handleClosePopover(); }}
                sx={{ color: 'error.main' }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" />
                删除
              </MenuItem>
            </PermissionGuard>
          </Box>
        </CustomPopover>
      </Box>

      {hasChildren && (
        <Collapse in={expanded}>
          {node.children!.map((child) => (
            <DeptNode
              key={child.id}
              node={child}
              deptList={deptList}
              onRefresh={onRefresh}
              depth={depth + 1}
            />
          ))}
        </Collapse>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="删除部门"
        content={`确认删除部门 "${node.name}" ？`}
        action={
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            删除
          </Button>
        }
      />

      <DeptFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={onRefresh}
        editRow={editRow}
        deptList={deptList}
      />

      <DeptFormDialog
        open={addChildOpen}
        onClose={() => setAddChildOpen(false)}
        onSuccess={onRefresh}
        editRow={null}
        parentId={node.id}
        deptList={deptList}
      />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function DeptTreeView() {
  const [deptTree, setDeptTree] = useState<DeptTree[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchDeptTree = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDeptTree();
      setDeptTree(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeptTree();
  }, [fetchDeptTree]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">部门管理</Typography>
        <PermissionGuard permission="sys:dept:add">
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={() => setCreateOpen(true)}
          >
            新建部门
          </Button>
        </PermissionGuard>
      </Box>

      {/* Header row */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'background.neutral',
          borderRadius: 1,
          mb: 0.5,
        }}
      >
        <Box sx={{ width: 28 }} />
        <Typography variant="caption" fontWeight={700} sx={{ flex: 1 }}>
          部门名称
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ width: 120 }}>
          负责人
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ width: 120 }}>
          联系电话
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ width: 48 }}>
          状态
        </Typography>
        <Box sx={{ width: 32 }} />
      </Box>

      <Card>
        {deptTree.map((node) => (
          <DeptNode
            key={node.id}
            node={node}
            deptList={deptTree}
            onRefresh={fetchDeptTree}
          />
        ))}
        {!loading && deptTree.length === 0 && (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">暂无数据</Typography>
          </Box>
        )}
      </Card>

      <DeptFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchDeptTree}
        editRow={null}
        deptList={deptTree}
      />
    </Box>
  );
}
