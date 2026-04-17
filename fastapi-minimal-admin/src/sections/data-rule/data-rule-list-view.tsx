import type { DataRuleDetail } from 'src/types/data-rule';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';

import { getDataRules, deleteDataRules } from 'src/api/sys/data-rule';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';
import {
  useTable,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { PermissionGuard } from 'src/auth/guard/permission-guard';

import { DataRuleFormDialog } from './data-rule-form-dialog';

// ----------------------------------------------------------------------

const HEAD_CELLS = [
  { id: 'name', label: '规则名称' },
  { id: 'model', label: '模型' },
  { id: 'column', label: '字段' },
  { id: 'operator', label: '运算符' },
  { id: 'expression', label: '表达式' },
  { id: 'value', label: '值' },
  { id: 'created_time', label: '创建时间' },
  { id: 'actions', label: '操作', align: 'right' as const },
];

type RowActionsProps = {
  row: DataRuleDetail;
  onEdit: (row: DataRuleDetail) => void;
  onDelete: (id: number) => void;
};

function RowActions({ row, onEdit, onDelete }: RowActionsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Iconify icon="solar:pen-bold" />
      </IconButton>

      <CustomPopover open={!!anchorEl} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
        <Box sx={{ p: 0.5 }}>
          <MenuItem onClick={() => { onEdit(row); setAnchorEl(null); }}>
            <Iconify icon="solar:pen-bold" />
            编辑
          </MenuItem>
          <PermissionGuard permission="sys:data-rule:del">
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

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="删除数据规则"
        content={`确认删除规则 "${row.name}" ？`}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => { onDelete(row.id); setConfirmOpen(false); }}
          >
            删除
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

export function DataRuleListView() {
  const table = useTable({ defaultRowsPerPage: 10 });

  const [rules, setRules] = useState<DataRuleDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState<DataRuleDetail | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: table.page + 1,
        size: table.rowsPerPage,
      };
      if (searchName) params.name = searchName;

      const data = await getDataRules(params);
      setRules(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, searchName]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleEdit = useCallback((row: DataRuleDetail) => {
    setEditRow(row);
    setDialogOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditRow(null);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteDataRules([id]);
      fetchRules();
    } catch (error) {
      console.error(error);
    }
  }, [fetchRules]);

  const notFound = !loading && rules.length === 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, gap: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="搜索规则名称"
          value={searchName}
          onChange={(e) => {
            setSearchName(e.target.value);
            table.onResetPage();
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={16} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 220 }}
        />

        <Box sx={{ flexGrow: 1 }} />

        <PermissionGuard permission="sys:data-rule:add">
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={handleCreate}
          >
            新建规则
          </Button>
        </PermissionGuard>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHeadCustom headCells={HEAD_CELLS} />
            <TableBody>
              {rules.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.model}</TableCell>
                  <TableCell>{row.column}</TableCell>
                  <TableCell>{row.operator}</TableCell>
                  <TableCell>{row.expression}</TableCell>
                  <TableCell>{row.value}</TableCell>
                  <TableCell>{row.created_time}</TableCell>
                  <TableCell align="right">
                    <RowActions
                      row={row}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </TableCell>
                </TableRow>
              ))}

              <TableEmptyRows emptyRows={table.rowsPerPage - rules.length} height={52} />
              <TableNoData notFound={notFound} />
            </TableBody>
          </Table>
        </TableContainer>

        <TablePaginationCustom
          page={table.page}
          count={total}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <DataRuleFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchRules}
        editRow={editRow}
      />
    </Box>
  );
}
