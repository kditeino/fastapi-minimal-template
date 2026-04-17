import type { PluginInfo } from 'src/api/sys/plugin';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';

import { StatusType } from 'src/api/types';
import { getPlugins, uninstallPlugin, updatePluginStatus } from 'src/api/sys/plugin';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useTable, TableNoData, TableEmptyRows, TableHeadCustom } from 'src/components/table';

import { PermissionGuard } from 'src/auth/guard/permission-guard';

// ----------------------------------------------------------------------

const HEAD_CELLS = [
  { id: 'name', label: '插件名' },
  { id: 'version', label: '版本' },
  { id: 'description', label: '描述' },
  { id: 'status', label: '状态' },
  { id: 'actions', label: '操作', align: 'right' as const },
];

// ----------------------------------------------------------------------

type RowActionsProps = {
  row: PluginInfo;
  onToggleStatus: (name: string) => void;
  onUninstall: (name: string) => void;
};

function RowActions({ row, onToggleStatus, onUninstall }: RowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isEnabled = Number(row.plugin.enable) === StatusType.ENABLE;

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Iconify icon="solar:restart-bold" />}
        onClick={() => onToggleStatus(row.plugin.name)}
        sx={{ mr: 1 }}
      >
        {isEnabled ? '禁用' : '启用'}
      </Button>

      <PermissionGuard permission="sys:plugin:del">
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
          onClick={() => setConfirmOpen(true)}
        >
          卸载
        </Button>
      </PermissionGuard>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="卸载插件"
        content={`确认卸载插件 "${row.plugin.name}" ？`}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => { onUninstall(row.plugin.name); setConfirmOpen(false); }}
          >
            卸载
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

export function PluginListView() {
  const table = useTable({ defaultRowsPerPage: 10 });

  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlugins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPlugins();
      setPlugins(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlugins();
  }, [fetchPlugins]);

  const handleToggleStatus = useCallback(async (name: string) => {
    try {
      await updatePluginStatus(name);
      fetchPlugins();
    } catch (error) {
      console.error(error);
    }
  }, [fetchPlugins]);

  const handleUninstall = useCallback(async (name: string) => {
    try {
      await uninstallPlugin(name);
      fetchPlugins();
    } catch (error) {
      console.error(error);
    }
  }, [fetchPlugins]);

  const notFound = !loading && plugins.length === 0;

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <TableContainer>
          <Table>
            <TableHeadCustom headCells={HEAD_CELLS} />
            <TableBody>
              {plugins.map((row, index) => {
                const p = row.plugin;
                const isEnabled = Number(p.enable) === StatusType.ENABLE;
                return (
                <TableRow key={p.name ?? index} hover>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.version}</TableCell>
                  <TableCell>{p.summary || p.description}</TableCell>
                  <TableCell>
                    <Label
                      variant="soft"
                      color={isEnabled ? 'success' : 'error'}
                    >
                      {isEnabled ? '启用' : '禁用'}
                    </Label>
                  </TableCell>
                  <TableCell align="right">
                    <RowActions
                      row={row}
                      onToggleStatus={handleToggleStatus}
                      onUninstall={handleUninstall}
                    />
                  </TableCell>
                </TableRow>
              );
              })}

              <TableEmptyRows emptyRows={table.rowsPerPage - plugins.length} height={52} />
              <TableNoData notFound={notFound} />
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
