import type { DeptTree } from 'src/types/dept';
import type { RoleDetail } from 'src/types/role';
import type { UserInfoWithRelation } from 'src/types/user';

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

import { createUser, updateUser } from 'src/api/sys/user';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const CreateSchema = z.object({
  username: z.string().min(1, { message: '用户名必填' }),
  password: z.string().min(6, { message: '密码至少6位' }),
  nickname: z.string().optional(),
  email: z.string().email({ message: '邮箱格式错误' }).optional().or(z.literal('')),
  phone: z.string().optional(),
  dept_id: z.number({ error: '部门必填' }),
  roles: z.array(z.string()).min(1, { message: '至少选择一个角色' }),
});

const UpdateSchema = z.object({
  username: z.string().min(1, { message: '用户名必填' }),
  nickname: z.string().optional(),
  email: z.string().email({ message: '邮箱格式错误' }).optional().or(z.literal('')),
  phone: z.string().optional(),
  dept_id: z.number({ error: '部门必填' }),
  roles: z.array(z.string()).min(1, { message: '至少选择一个角色' }),
});

type CreateFormValues = z.infer<typeof CreateSchema>;
type UpdateFormValues = z.infer<typeof UpdateSchema>;

type UserFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRow: UserInfoWithRelation | null;
  deptList: DeptTree[];
  roleList: RoleDetail[];
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

export function UserFormDialog({
  open,
  onClose,
  onSuccess,
  editRow,
  deptList,
  roleList,
}: UserFormDialogProps) {
  const isEdit = !!editRow;

  const methods = useForm<CreateFormValues>({
    resolver: zodResolver(isEdit ? (UpdateSchema as any) : CreateSchema),
    defaultValues: {
      username: '',
      password: '',
      nickname: '',
      email: '',
      phone: '',
      dept_id: undefined,
      roles: [],
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
        username: editRow.username,
        nickname: editRow.nickname ?? '',
        email: editRow.email ?? '',
        phone: editRow.phone ?? '',
        dept_id: editRow.dept_id ?? undefined,
        roles: editRow.roles.map((r) => String(r.id)),
      });
    } else if (open && !editRow) {
      reset({
        username: '',
        password: '',
        nickname: '',
        email: '',
        phone: '',
        dept_id: undefined,
        roles: [],
      });
    }
  }, [open, editRow, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit && editRow) {
        await updateUser(editRow.id, {
          username: data.username,
          nickname: data.nickname ?? '',
          email: data.email || undefined,
          phone: data.phone || undefined,
          dept_id: data.dept_id,
          roles: data.roles.map(Number),
        });
      } else {
        await createUser({
          username: data.username,
          password: (data as CreateFormValues).password,
          nickname: data.nickname || undefined,
          email: data.email || undefined,
          phone: data.phone || undefined,
          dept_id: data.dept_id,
          roles: data.roles.map(Number),
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    }
  });

  const flatDepts = flattenDeptTree(deptList);

  const roleOptions = roleList.map((r) => ({
    label: r.name,
    value: String(r.id),
  }));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? '编辑用户' : '新建用户'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <Field.Text name="username" label="用户名" disabled={isEdit} />
            </Grid>

            {!isEdit && (
              <Grid size={6}>
                <Field.Text name="password" label="密码" type="password" />
              </Grid>
            )}

            <Grid size={6}>
              <Field.Text name="nickname" label="昵称" />
            </Grid>

            <Grid size={6}>
              <Field.Text name="email" label="邮箱" />
            </Grid>

            <Grid size={6}>
              <Field.Text name="phone" label="手机号" />
            </Grid>

            <Grid size={6}>
              <Field.Select name="dept_id" label="部门">
                {flatDepts.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>

            <Grid size={12}>
              <Field.MultiSelect
                name="roles"
                label="角色"
                chip
                checkbox
                options={roleOptions}
                fullWidth
              />
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
