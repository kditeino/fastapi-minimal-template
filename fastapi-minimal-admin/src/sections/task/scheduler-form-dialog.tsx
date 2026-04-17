import type {
  PeriodType,
  TaskSchedulerType,
  TaskSchedulerDetail,
  CreateTaskSchedulerParam,
  UpdateTaskSchedulerParam,
} from 'src/types/task';

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

import { createScheduler, updateScheduler } from 'src/api/task/scheduler';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const SchedulerSchema = z.object({
  name: z.string().min(1, { message: '名称必填' }),
  task: z.string().min(1, { message: '任务路径必填' }),
  type: z.number(),
  crontab: z.string().optional(),
  interval_every: z.number().optional(),
  interval_period: z.string().optional(),
  args: z.string().optional(),
  kwargs: z.string().optional(),
  one_off: z.boolean(),
  remark: z.string().optional(),
});

type SchedulerFormValues = z.infer<typeof SchedulerSchema>;

type SchedulerFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRow: TaskSchedulerDetail | null;
};

const PERIOD_OPTIONS: { value: PeriodType; label: string }[] = [
  { value: 'seconds', label: '秒' },
  { value: 'minutes', label: '分钟' },
  { value: 'hours', label: '小时' },
  { value: 'days', label: '天' },
];

// ----------------------------------------------------------------------

export function SchedulerFormDialog({ open, onClose, onSuccess, editRow }: SchedulerFormDialogProps) {
  const isEdit = !!editRow;

  const methods = useForm<SchedulerFormValues>({
    resolver: zodResolver(SchedulerSchema),
    defaultValues: {
      name: '',
      task: '',
      type: 1,
      crontab: '',
      interval_every: undefined,
      interval_period: 'seconds',
      args: '',
      kwargs: '',
      one_off: false,
      remark: '',
    },
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const scheduleType = watch('type');

  useEffect(() => {
    if (open && editRow) {
      reset({
        name: editRow.name,
        task: editRow.task,
        type: editRow.type,
        crontab: editRow.crontab || '',
        interval_every: editRow.interval_every ?? undefined,
        interval_period: editRow.interval_period || 'seconds',
        args: editRow.args ? JSON.stringify(editRow.args) : '',
        kwargs: editRow.kwargs ? JSON.stringify(editRow.kwargs) : '',
        one_off: editRow.one_off,
        remark: editRow.remark ?? '',
      });
    } else if (open && !editRow) {
      reset({
        name: '',
        task: '',
        type: 1,
        crontab: '',
        interval_every: undefined,
        interval_period: 'seconds',
        args: '',
        kwargs: '',
        one_off: false,
        remark: '',
      });
    }
  }, [open, editRow, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload: Record<string, any> = {
        name: data.name,
        task: data.task,
        type: data.type as TaskSchedulerType,
        one_off: data.one_off,
        remark: data.remark || null,
        args: data.args ? JSON.parse(data.args) : null,
        kwargs: data.kwargs ? JSON.parse(data.kwargs) : null,
      };

      if (data.type === 1) {
        payload.crontab = data.crontab || '';
      } else {
        payload.interval_every = data.interval_every || null;
        payload.interval_period = (data.interval_period as PeriodType) || null;
      }

      if (isEdit && editRow) {
        await updateScheduler(editRow.id, payload as UpdateTaskSchedulerParam);
      } else {
        await createScheduler(payload as CreateTaskSchedulerParam);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? '编辑调度任务' : '新建调度任务'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Field.Text name="name" label="名称" />
            </Grid>

            <Grid size={12}>
              <Field.Text name="task" label="任务路径" placeholder="app.tasks.my_task" />
            </Grid>

            <Grid size={12}>
              <Field.Select name="type" label="调度类型">
                <MenuItem value={1}>Crontab</MenuItem>
                <MenuItem value={0}>Interval</MenuItem>
              </Field.Select>
            </Grid>

            {scheduleType === 1 ? (
              <Grid size={12}>
                <Field.Text name="crontab" label="Crontab 表达式" placeholder="* * * * *" />
              </Grid>
            ) : (
              <>
                <Grid size={6}>
                  <Field.Text name="interval_every" label="间隔数值" type="number" />
                </Grid>
                <Grid size={6}>
                  <Field.Select name="interval_period" label="间隔单位">
                    {PERIOD_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Field.Select>
                </Grid>
              </>
            )}

            <Grid size={12}>
              <Field.Text name="args" label="参数 (JSON 数组)" placeholder='["arg1", "arg2"]' />
            </Grid>

            <Grid size={12}>
              <Field.Text name="kwargs" label="关键字参数 (JSON 对象)" placeholder='{"key": "value"}' />
            </Grid>

            <Grid size={6}>
              <Field.Switch name="one_off" label="仅执行一次" />
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
