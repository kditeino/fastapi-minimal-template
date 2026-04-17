import type { DeptTree, DeptDetail } from 'src/types/dept';

import * as z from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { StatusType } from 'src/api/types';
import { createDept, updateDept } from 'src/api/sys/dept';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const DeptSchema = z.object({
  name: z.string().min(1, { message: '部门名称必填' }),
  parent_id: z.number().nullable().optional(),
  sort: z.number().optional(),
  leader: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: '邮箱格式错误' }).optional().or(z.literal('')),
  statusEnabled: z.boolean(),
});

type DeptFormValues = z.infer<typeof DeptSchema>;

type DeptFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRow: DeptDetail | null;
  parentId?: number | null;
  deptList: DeptTree[];
};

function flattenDeptTree(tree: DeptTree[]): DeptTree[] {
  const result: DeptTree[] = [];
  const walk = (nodes: DeptTree[]) => {
    for (const node of nodes) {
      result.push(node);
      if (node.children) walk(node.children);
    }
  };
  walk(tree);
  return result;
}

export function DeptFormDialog({
  open,
  onClose,
  onSuccess,
  editRow,
  parentId,
  deptList,
}: DeptFormDialogProps) {
  const isEdit = !!editRow;

  const methods = useForm<DeptFormValues>({
    resolver: zodResolver(DeptSchema),
    defaultValues: {
      name: '',
      parent_id: parentId ?? null,
      sort: 0,
      leader: '',
      phone: '',
      email: '',
      statusEnabled: true,
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open && editRow) {
      reset({
        name: editRow.name,
        parent_id: editRow.parent_id,
        sort: editRow.sort,
        leader: editRow.leader ?? '',
        phone: editRow.phone ?? '',
        email: editRow.email ?? '',
        statusEnabled: editRow.status === StatusType.ENABLE,
      });
    } else if (open && !editRow) {
      reset({
        name: '',
        parent_id: parentId ?? null,
        sort: 0,
        leader: '',
        phone: '',
        email: '',
        statusEnabled: true,
      });
    }
  }, [open, editRow, parentId, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        name: data.name,
        parent_id: data.parent_id,
        sort: data.sort,
        leader: data.leader || null,
        phone: data.phone || null,
        email: data.email || null,
        status: data.statusEnabled ? StatusType.ENABLE : StatusType.DISABLE,
      };

      if (isEdit && editRow) {
        await updateDept(editRow.id, payload);
      } else {
        await createDept(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    }
  });

  const flatDepts = flattenDeptTree(deptList).filter((d) => !editRow || d.id !== editRow.id);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? '编辑部门' : '新建部门'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Field.Text name="name" label="部门名称" />
            </Grid>

            <Grid size={6}>
              <Field.Select name="parent_id" label="上级部门">
                <MenuItem value="">无</MenuItem>
                {flatDepts.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>

            <Grid size={6}>
              <Field.Text name="sort" label="排序" type="number" />
            </Grid>

            <Grid size={6}>
              <Field.Text name="leader" label="负责人" />
            </Grid>

            <Grid size={6}>
              <Field.Text name="phone" label="联系电话" />
            </Grid>

            <Grid size={12}>
              <Field.Text name="email" label="邮箱" />
            </Grid>

            <Grid size={12}>
              <Field.Switch name="statusEnabled" label="启用" />
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
