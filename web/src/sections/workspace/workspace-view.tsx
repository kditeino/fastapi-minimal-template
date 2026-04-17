import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const QUICK_ACTIONS = [
  {
    title: '用户管理',
    description: '管理系统用户账号',
    icon: 'solar:users-group-rounded-bold-duotone',
    path: '/system/user',
    color: '#2065D1',
  },
  {
    title: '角色管理',
    description: '配置角色和权限',
    icon: 'solar:shield-keyhole-bold-duotone',
    path: '/system/role',
    color: '#0CD66E',
  },
  {
    title: '菜单管理',
    description: '管理系统菜单结构',
    icon: 'solar:widget-bold-duotone',
    path: '/system/menu',
    color: '#FF9800',
  },
  {
    title: '操作日志',
    description: '查看系统操作记录',
    icon: 'solar:document-text-bold-duotone',
    path: '/log/opera',
    color: '#8E33FF',
  },
  {
    title: '系统监控',
    description: '服务器状态监控',
    icon: 'solar:monitor-bold-duotone',
    path: '/monitor',
    color: '#FF5630',
  },
];

// ----------------------------------------------------------------------

export function WorkspaceView() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('早上好');
    } else if (hour < 18) {
      setGreeting('下午好');
    } else {
      setGreeting('晚上好');
    }
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Section */}
      <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <CardContent sx={{ py: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon={"solar:hand-shake-bold-duotone" as any} width={48} />
            <Box>
              <Typography variant="h4">
                {greeting}，{user?.nickname || user?.username || '用户'}！
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, mt: 0.5 }}>
                欢迎回到工作台，祝您工作愉快
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        快捷入口
      </Typography>

      <Grid container spacing={3}>
        {QUICK_ACTIONS.map((action) => (
          <Grid key={action.title} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[8],
                },
              }}
              onClick={() => router.push(action.path)}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${action.color}20`,
                    }}
                  >
                    <Iconify icon={action.icon as any} width={32} sx={{ color: action.color }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </Box>
                  <Iconify icon={"solar:arrow-right-bold" as any} width={20} sx={{ color: 'text.disabled' }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tips Section */}
      <Card sx={{ mt: 3, bgcolor: 'background.neutral' }}>
        <CardContent>
          <Stack direction="row" alignItems="flex-start" spacing={2}>
            <Iconify icon={"solar:lightbulb-bolt-bold-duotone" as any} width={24} sx={{ color: 'warning.main', mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                使用提示
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 点击上方卡片可快速进入对应功能模块<br />
                • 使用左侧菜单可以访问所有系统功能<br />
                • 如需帮助，请联系系统管理员
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
