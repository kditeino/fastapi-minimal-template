import type { DataRuleDetail } from 'src/types/data-rule';

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

import { createDataRule, updateDataRule } from 'src/api/sys/data-rule';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const DataRuleSchema = z.object({
  name: z.string().min(1, { message: '规则名称必填' }),
  model: z.string().min(1, { message: '模型必填' }),
  column: z.string().min(1, { message: '字段必填' }),
  operator: z.enum(['AND', 'OR']),
  expression: z.enum([
    'eq', 'ne', 'gt', 'ge', 'lt', 'le',
    'in', 'not_in', 'like', 'not_like', 'is_null', 'is_not_null',
  ]),
  value: z.string().min(1, { message: '值必填' }),
});

type DataRuleFormValues = z.infer<typeof DataRuleSchema>;

type DataRuleFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRow: DataRuleDetail | null;
};

export function DataRuleFormDialog({ open, onClose, onSuccess, editRow }: DataRuleFormDialogProps) {
  const isEdit = !!editRow;

  const methods = useForm<DataRuleFormValues>({
    resolver: zodResolver(DataRuleSchema),
    defaultValues: {
      name: '',
      model: '',
      column: '',
      operator: 'AND',
      expression: 'eq',
      value: '',
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
        model: editRow.model,
        column: editRow.column,
        operator: editRow.operator,
        expression: editRow.expression,
        value: editRow.value,
      });
    } else if (open && !editRow) {
      reset({
        name: '',
        model: '',
        column: '',
        operator: 'AND',
        expression: 'eq',
        value: '',
      });
    }
  }, [open, editRow, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit && editRow) {
        await updateDataRule(editRow.id, data);
      } else {
        await createDataRule(data);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? '编辑数据规则' : '新建数据规则'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Field.Text name="name" label="规则名称" />
            </Grid>

            <Grid size={6}>
              <Field.Text name="model" label="模型" />
            </Grid>

            <Grid size={6}>
              <Field.Text name="column" label="字段" />
            </Grid>

            <Grid size={6}>
              <Field.Select name="operator" label="运算符">
                <MenuItem value="AND">AND</MenuItem>
                <MenuItem value="OR">OR</MenuItem>
              </Field.Select>
            </Grid>

            <Grid size={6}>
              <Field.Select name="expression" label="表达式">
                <MenuItem value="eq">eq（等于）</MenuItem>
                <MenuItem value="ne">ne（不等于）</MenuItem>
                <MenuItem value="gt">gt（大于）</MenuItem>
                <MenuItem value="ge">ge（大于等于）</MenuItem>
                <MenuItem value="lt">lt（小于）</MenuItem>
                <MenuItem value="le">le（小于等于）</MenuItem>
                <MenuItem value="in">in（包含）</MenuItem>
                <MenuItem value="not_in">not_in（不包含）</MenuItem>
                <MenuItem value="like">like（模糊匹配）</MenuItem>
                <MenuItem value="not_like">not_like（不匹配）</MenuItem>
                <MenuItem value="is_null">is_null（为空）</MenuItem>
                <MenuItem value="is_not_null">is_not_null（不为空）</MenuItem>
              </Field.Select>
            </Grid>

            <Grid size={12}>
              <Field.Text name="value" label="值" />
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
