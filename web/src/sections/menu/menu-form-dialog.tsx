import type { MenuTree, MenuDetail } from 'src/types/menu';

import * as z from 'zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { MenuType, StatusType } from 'src/api/types';
import { createMenu, updateMenu } from 'src/api/sys/menu';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const MenuSchema = z.object({
  title: z.string().min(1, { message: '标题必填' }),
  name: z.string().min(1, { message: '名称必填' }),
  type: z.nativeEnum(MenuType),
  parent_id: z.number().nullable().optional(),
  sort: z.number().optional(),
  icon: z.string().optional(),
  path: z.string().optional(),
  component: z.string().optional(),
  perms: z.string().optional(),
  statusEnabled: z.boolean(),
  displayEnabled: z.boolean(),
  cacheEnabled: z.boolean(),
  link: z.string().optional(),
  remark: z.string().optional(),
});

type MenuFormValues = z.infer<typeof MenuSchema>;

type MenuFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRow: MenuDetail | null;
  parentId?: number | null;
  menuTree: MenuTree[];
};

function flattenMenuTree(tree: MenuTree[]): MenuTree[] {
  const result: MenuTree[] = [];
  const walk = (nodes: MenuTree[]) => {
    for (const node of nodes) {
      result.push(node);
      if (node.children) walk(node.children);
    }
  };
  walk(tree);
  return result;
}

export function MenuFormDialog({
  open,
  onClose,
  onSuccess,
  editRow,
  parentId,
  menuTree,
}: MenuFormDialogProps) {
  const isEdit = !!editRow;

  const methods = useForm<MenuFormValues>({
    resolver: zodResolver(MenuSchema),
    defaultValues: {
      title: '',
      name: '',
      type: MenuType.DIRECTORY,
      parent_id: parentId ?? null,
      sort: 0,
      icon: '',
      path: '',
      component: '',
      perms: '',
      statusEnabled: true,
      displayEnabled: true,
      cacheEnabled: true,
      link: '',
      remark: '',
    },
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const menuType = useWatch({ control, name: 'type' });

  useEffect(() => {
    if (open && editRow) {
      reset({
        title: editRow.title,
        name: editRow.name,
        type: editRow.type,
        parent_id: editRow.parent_id,
        sort: editRow.sort,
        icon: editRow.icon ?? '',
        path: editRow.path ?? '',
        component: editRow.component ?? '',
        perms: editRow.perms ?? '',
        statusEnabled: editRow.status === StatusType.ENABLE,
        displayEnabled: editRow.display === StatusType.ENABLE,
        cacheEnabled: editRow.cache === StatusType.ENABLE,
        link: editRow.link ?? '',
        remark: editRow.remark ?? '',
      });
    } else if (open && !editRow) {
      reset({
        title: '',
        name: '',
        type: MenuType.DIRECTORY,
        parent_id: parentId ?? null,
        sort: 0,
        icon: '',
        path: '',
        component: '',
        perms: '',
        statusEnabled: true,
        displayEnabled: true,
        cacheEnabled: true,
        link: '',
        remark: '',
      });
    }
  }, [open, editRow, parentId, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        title: data.title,
        name: data.name,
        type: data.type,
        parent_id: data.parent_id,
        sort: data.sort,
        icon: data.icon || null,
        path: data.path || null,
        component: data.component || null,
        perms: data.perms || null,
        status: data.statusEnabled ? StatusType.ENABLE : StatusType.DISABLE,
        display: data.displayEnabled ? StatusType.ENABLE : StatusType.DISABLE,
        cache: data.cacheEnabled ? StatusType.ENABLE : StatusType.DISABLE,
        link: data.link || null,
        remark: data.remark || null,
      };

      if (isEdit && editRow) {
        await updateMenu(editRow.id, payload);
      } else {
        await createMenu(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    }
  });

  const flatMenus = flattenMenuTree(menuTree).filter((m) => !editRow || m.id !== editRow.id);

  const showPath = menuType === MenuType.DIRECTORY || menuType === MenuType.MENU || menuType === MenuType.EMBEDDED;
  const showComponent = menuType === MenuType.MENU || menuType === MenuType.EMBEDDED;
  const showIcon = menuType === MenuType.DIRECTORY || menuType === MenuType.MENU;
  const showPerms = menuType === MenuType.MENU || menuType === MenuType.BUTTON;
  const showLink = menuType === MenuType.LINK || menuType === MenuType.EMBEDDED;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? '编辑菜单' : '新建菜单'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Field.Select name="type" label="菜单类型">
                <MenuItem value={MenuType.DIRECTORY}>目录</MenuItem>
                <MenuItem value={MenuType.MENU}>菜单</MenuItem>
                <MenuItem value={MenuType.BUTTON}>按钮</MenuItem>
                <MenuItem value={MenuType.EMBEDDED}>内嵌</MenuItem>
                <MenuItem value={MenuType.LINK}>外链</MenuItem>
              </Field.Select>
            </Grid>

            <Grid size={6}>
              <Field.Text name="title" label="标题" />
            </Grid>

            <Grid size={6}>
              <Field.Text name="name" label="名称" />
            </Grid>

            <Grid size={6}>
              <Field.Select name="parent_id" label="上级菜单">
                <MenuItem value="">无</MenuItem>
                {flatMenus.map((menu) => (
                  <MenuItem key={menu.id} value={menu.id}>
                    {menu.title}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>

            <Grid size={6}>
              <Field.Text name="sort" label="排序" type="number" />
            </Grid>

            {showIcon && (
              <Grid size={6}>
                <Field.Text name="icon" label="图标" placeholder="e.g. solar:home-bold" />
              </Grid>
            )}

            {showPath && (
              <Grid size={6}>
                <Field.Text name="path" label="路径" />
              </Grid>
            )}

            {showComponent && (
              <Grid size={6}>
                <Field.Text name="component" label="组件路径" />
              </Grid>
            )}

            {showPerms && (
              <Grid size={6}>
                <Field.Text name="perms" label="权限标识" placeholder="e.g. sys:menu:add" />
              </Grid>
            )}

            {showLink && (
              <Grid size={6}>
                <Field.Text name="link" label="外链地址" />
              </Grid>
            )}

            <Grid size={4}>
              <Field.Switch name="statusEnabled" label="启用" />
            </Grid>

            <Grid size={4}>
              <Field.Switch name="displayEnabled" label="显示" />
            </Grid>

            <Grid size={4}>
              <Field.Switch name="cacheEnabled" label="缓存" />
            </Grid>

            <Grid size={12}>
              <Field.Text name="remark" label="备注" multiline rows={2} />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {isEdit ? '保存' : '创建'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
