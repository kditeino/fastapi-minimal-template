import type { MenuTree } from 'src/types/menu';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { getMenuTree } from 'src/api/sys/menu';
import { getRoleMenuTree, updateRoleMenus } from 'src/api/sys/role';

// ----------------------------------------------------------------------

type RoleMenuTreeDialogProps = {
  open: boolean;
  onClose: () => void;
  roleId: number | null;
  roleName: string;
};

function collectAllIds(menus: MenuTree[]): number[] {
  const ids: number[] = [];
  const walk = (nodes: MenuTree[]) => {
    for (const node of nodes) {
      ids.push(node.id);
      if (node.children) walk(node.children);
    }
  };
  walk(menus);
  return ids;
}

type MenuNodeProps = {
  node: MenuTree;
  selected: number[];
  onToggle: (id: number) => void;
  depth?: number;
};

function MenuNode({ node, selected, onToggle, depth = 0 }: MenuNodeProps) {
  const childIds = node.children ? collectAllIds(node.children) : [];
  const selfAndChildIds = [node.id, ...childIds];
  const checkedCount = selfAndChildIds.filter((id) => selected.includes(id)).length;
  const indeterminate = checkedCount > 0 && checkedCount < selfAndChildIds.length;
  const checked = checkedCount === selfAndChildIds.length;

  const handleChange = () => {
    onToggle(node.id);
    if (node.children) {
      childIds.forEach((id) => onToggle(id));
    }
  };

  return (
    <Box sx={{ pl: depth * 3 }}>
      <FormControlLabel
        label={<Typography variant="body2">{node.title}</Typography>}
        control={
          <Checkbox
            size="small"
            checked={checked}
            indeterminate={indeterminate}
            onChange={handleChange}
          />
        }
      />
      {node.children?.map((child) => (
        <MenuNode
          key={child.id}
          node={child}
          selected={selected}
          onToggle={onToggle}
          depth={depth + 1}
        />
      ))}
    </Box>
  );
}

export function RoleMenuTreeDialog({ open, onClose, roleId, roleName }: RoleMenuTreeDialogProps) {
  const [menuTree, setMenuTree] = useState<MenuTree[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !roleId) return;

    const load = async () => {
      setLoading(true);
      try {
        const [tree, roleMenus] = await Promise.all([
          getMenuTree(),
          getRoleMenuTree(roleId),
        ]);
        setMenuTree(tree);
        if (roleMenus) {
          setSelected(roleMenus.map((m) => m.id));
        } else {
          setSelected([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, roleId]);

  const handleToggle = useCallback((id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleSave = async () => {
    if (!roleId) return;
    setSaving(true);
    try {
      await updateRoleMenus(roleId, { menus: selected });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>分配菜单 — {roleName}</DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ pt: 1 }}>
            {menuTree.map((node) => (
              <MenuNode
                key={node.id}
                node={node}
                selected={selected}
                onToggle={handleToggle}
              />
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          取消
        </Button>
        <Button variant="contained" loading={saving} onClick={handleSave}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
