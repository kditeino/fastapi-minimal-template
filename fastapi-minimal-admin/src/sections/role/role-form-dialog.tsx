import type { RoleDetail } from 'src/types/role';

import * as z from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { StatusType } from 'src/api/types';
import { createRole, updateRole } from 'src/api/sys/role';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const RoleSchema = z.object({
  name: z.string().min(1, { message: '角色名必填' }),
  statusEnabled: z.boolean(),
  is_filter_scopes: z.boolean(),
  remark: z.string().optional(),
});

type RoleFormValues = z.infer<typeof RoleSchema>;

type RoleFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRow: RoleDetail | null;
};

export function RoleFormDialog({ open, onClose, onSuccess, editRow }: RoleFormDialogProps) {
  const isEdit = !!editRow;

  const methods = useForm<RoleFormValues>({
    resolver: zodResolver(RoleSchema),
    defaultValues: {
      name: '',
      statusEnabled: true,
      is_filter_scopes: false,
      remark: '',
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
        statusEnabled: editRow.status === StatusType.ENABLE,
        is_filter_scopes: editRow.is_filter_scopes,
        remark: editRow.remark ?? '',
      });
    } else if (open && !editRow) {
      reset({
        name: '',
        statusEnabled: true,
        is_filter_scopes: false,
        remark: '',
      });
    }
  }, [open, editRow, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        name: data.name,
        status: data.statusEnabled ? StatusType.ENABLE : StatusType.DISABLE,
        is_filter_scopes: data.is_filter_scopes,
        remark: data.remark || null,
      };

      if (isEdit && editRow) {
        await updateRole(editRow.id, payload);
      } else {
        await createRole(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? '编辑角色' : '新建角色'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Field.Text name="name" label="角色名称" />
            </Grid>

            <Grid size={6}>
              <Field.Switch name="statusEnabled" label="启用" />
            </Grid>

            <Grid size={6}>
              <Field.Switch name="is_filter_scopes" label="过滤数据范围" />
            </Grid>

            <Grid size={12}>
              <Field.Text name="remark" label="备注" multiline rows={3} />
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
