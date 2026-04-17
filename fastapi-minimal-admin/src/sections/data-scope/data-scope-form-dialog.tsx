import type { DataScopeDetail } from 'src/types/data-scope';

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
import { createDataScope, updateDataScope } from 'src/api/sys/data-scope';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const DataScopeSchema = z.object({
  name: z.string().min(1, { message: '范围名称必填' }),
  statusEnabled: z.boolean(),
});

type DataScopeFormValues = z.infer<typeof DataScopeSchema>;

type DataScopeFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRow: DataScopeDetail | null;
};

export function DataScopeFormDialog({ open, onClose, onSuccess, editRow }: DataScopeFormDialogProps) {
  const isEdit = !!editRow;

  const methods = useForm<DataScopeFormValues>({
    resolver: zodResolver(DataScopeSchema),
    defaultValues: {
      name: '',
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
        statusEnabled: editRow.status === StatusType.ENABLE,
      });
    } else if (open && !editRow) {
      reset({
        name: '',
        statusEnabled: true,
      });
    }
  }, [open, editRow, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        name: data.name,
        status: data.statusEnabled ? StatusType.ENABLE : StatusType.DISABLE,
      };

      if (isEdit && editRow) {
        await updateDataScope(editRow.id, payload);
      } else {
        await createDataScope(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? '编辑数据范围' : '新建数据范围'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Field.Text name="name" label="范围名称" />
            </Grid>

            <Grid size={6}>
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
