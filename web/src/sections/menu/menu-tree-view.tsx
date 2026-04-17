import type { MenuTree } from 'src/types/menu';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { MenuType, StatusType } from 'src/api/types';
import { deleteMenu, getMenuTree } from 'src/api/sys/menu';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

import { PermissionGuard } from 'src/auth/guard/permission-guard';

import { MenuFormDialog } from './menu-form-dialog';

// ----------------------------------------------------------------------

const MENU_TYPE_LABELS: Record<MenuType, string> = {
  [MenuType.DIRECTORY]: '目录',
  [MenuType.MENU]: '菜单',
  [MenuType.BUTTON]: '按钮',
  [MenuType.EMBEDDED]: '内嵌',
  [MenuType.LINK]: '外链',
};

const MENU_TYPE_COLORS: Record<MenuType, 'primary' | 'info' | 'warning' | 'secondary' | 'default'> = {
  [MenuType.DIRECTORY]: 'primary',
  [MenuType.MENU]: 'info',
  [MenuType.BUTTON]: 'warning',
  [MenuType.EMBEDDED]: 'secondary',
  [MenuType.LINK]: 'default',
};

// ----------------------------------------------------------------------

type MenuNodeProps = {
  node: MenuTree;
  menuTree: MenuTree[];
  onRefresh: () => void;
  depth?: number;
};

function MenuNode({ node, menuTree, onRefresh, depth = 0 }: MenuNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [editRow, setEditRow] = useState<MenuTree | null>(null);

  const hasChildren = node.children && node.children.length > 0;

  const handleEdit = () => {
    setEditRow(node);
    setFormOpen(true);
    setAnchorEl(null);
  };

  const handleAddChild = () => {
    setEditRow(null);
    setAddChildOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMenu(node.id);
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

        {node.icon && (
          <Iconify icon={node.icon as any} width={18} sx={{ color: 'text.secondary' }} />
        )}

        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            width: 200,
            flexShrink: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={node.title}
        >
          {node.title}
        </Typography>

        <Label
          variant="soft"
          color={MENU_TYPE_COLORS[node.type]}
          sx={{ width: 48, flexShrink: 0 }}
        >
          {MENU_TYPE_LABELS[node.type]}
        </Label>

        <Typography variant="caption" color="text.secondary" sx={{ width: 120, flexShrink: 0 }}>
          {node.name}
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ width: 140, flexShrink: 0 }}>
          {node.path ?? '—'}
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ width: 140, flexShrink: 0 }}>
          {node.perms ?? '—'}
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ width: 50, flexShrink: 0, textAlign: 'center' }}>
          {node.sort}
        </Typography>

        <Label
          variant="soft"
          color={node.status === StatusType.ENABLE ? 'success' : 'error'}
          sx={{ width: 48, flexShrink: 0 }}
        >
          {node.status === StatusType.ENABLE ? '启用' : '禁用'}
        </Label>

        <Box sx={{ flex: 1 }} />

        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <Iconify icon="eva:more-vertical-fill" width={18} />
        </IconButton>

        <CustomPopover open={!!anchorEl} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
          <Box sx={{ p: 0.5 }}>
            <PermissionGuard permission="sys:menu:add">
              <MenuItem onClick={handleAddChild}>
                <Iconify icon="solar:add-circle-bold" />
                添加子菜单
              </MenuItem>
            </PermissionGuard>

            <PermissionGuard permission="sys:menu:edit">
              <MenuItem onClick={handleEdit}>
                <Iconify icon="solar:pen-bold" />
                编辑
              </MenuItem>
            </PermissionGuard>

            <PermissionGuard permission="sys:menu:del">
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
      </Box>

      {hasChildren && (
        <Collapse in={expanded}>
          {node.children!.map((child) => (
            <MenuNode
              key={child.id}
              node={child}
              menuTree={menuTree}
              onRefresh={onRefresh}
              depth={depth + 1}
            />
          ))}
        </Collapse>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="删除菜单"
        content={`确认删除菜单 "${node.title}" ？`}
        action={
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            删除
          </Button>
        }
      />

      <MenuFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={onRefresh}
        editRow={editRow}
        menuTree={menuTree}
      />

      <MenuFormDialog
        open={addChildOpen}
        onClose={() => setAddChildOpen(false)}
        onSuccess={onRefresh}
        editRow={null}
        parentId={node.id}
        menuTree={menuTree}
      />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function MenuTreeView() {
  const [menuTree, setMenuTree] = useState<MenuTree[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchMenuTree = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMenuTree();
      setMenuTree(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuTree();
  }, [fetchMenuTree]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">菜单管理</Typography>
        <PermissionGuard permission="sys:menu:add">
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={() => setCreateOpen(true)}
          >
            新建菜单
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
        <Box sx={{ width: 28, flexShrink: 0 }} />
        <Typography variant="caption" fontWeight={700} sx={{ width: 200, flexShrink: 0 }}>
          标题
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ width: 48, flexShrink: 0 }}>
          类型
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ width: 120, flexShrink: 0 }}>
          名称
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ width: 140, flexShrink: 0 }}>
          路径
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ width: 140, flexShrink: 0 }}>
          权限标识
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ width: 50, flexShrink: 0, textAlign: 'center' }}>
          排序
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ width: 48, flexShrink: 0 }}>
          状态
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ width: 32 }} />
      </Box>

      <Card>
        {menuTree.map((node) => (
          <MenuNode
            key={node.id}
            node={node}
            menuTree={menuTree}
            onRefresh={fetchMenuTree}
          />
        ))}
        {!loading && menuTree.length === 0 && (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">暂无数据</Typography>
          </Box>
        )}
      </Card>

      <MenuFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchMenuTree}
        editRow={null}
        menuTree={menuTree}
      />
    </Box>
  );
}
