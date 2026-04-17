import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

// Dashboard
const OverviewPage = lazy(() => import('src/pages/dashboard/overview'));
const WorkspacePage = lazy(() => import('src/pages/dashboard/workspace'));

// System
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
const RolePage = lazy(() => import('src/pages/dashboard/role'));
const DeptPage = lazy(() => import('src/pages/dashboard/dept'));
const MenuPage = lazy(() => import('src/pages/dashboard/menu'));
const DataRulePage = lazy(() => import('src/pages/dashboard/data-rule'));
const DataScopePage = lazy(() => import('src/pages/dashboard/data-scope'));
const PluginPage = lazy(() => import('src/pages/dashboard/plugin'));

// Scheduler
const TaskPage = lazy(() => import('src/pages/dashboard/task'));
const TaskResultPage = lazy(() => import('src/pages/dashboard/task/result'));
const TaskSchedulerPage = lazy(() => import('src/pages/dashboard/task/scheduler'));

// Log
const OperaLogPage = lazy(() => import('src/pages/dashboard/log/opera'));
const LoginLogPage = lazy(() => import('src/pages/dashboard/log/login'));

// Monitor
const MonitorPage = lazy(() => import('src/pages/dashboard/monitor'));
const SessionPage = lazy(() => import('src/pages/dashboard/session'));

// ----------------------------------------------------------------------

const layoutElement = (
  <AuthGuard>
    <DashboardLayout>
      <Suspense fallback={<LoadingScreen />}>
        <Outlet />
      </Suspense>
    </DashboardLayout>
  </AuthGuard>
);

export const dashboardRoutes: RouteObject[] = [
  // Dashboard
  {
    path: 'dashboard',
    element: layoutElement,
    children: [
      { element: <OverviewPage />, index: true },
      { path: 'workspace', element: <WorkspacePage /> },
    ],
  },
  // System
  {
    path: 'system',
    element: layoutElement,
    children: [
      { path: 'user', element: <UserListPage /> },
      { path: 'user/:id/edit', element: <UserEditPage /> },
      { path: 'role', element: <RolePage /> },
      { path: 'dept', element: <DeptPage /> },
      { path: 'menu', element: <MenuPage /> },
      { path: 'data-rule', element: <DataRulePage /> },
      { path: 'data-scope', element: <DataScopePage /> },
      { path: 'plugin', element: <PluginPage /> },
    ],
  },
  // Scheduler
  {
    path: 'scheduler',
    element: layoutElement,
    children: [
      { path: 'manage', element: <TaskPage /> },
      { path: 'record', element: <TaskResultPage /> },
      { path: 'scheduler', element: <TaskSchedulerPage /> },
    ],
  },
  // Log
  {
    path: 'log',
    element: layoutElement,
    children: [
      { path: 'login', element: <LoginLogPage /> },
      { path: 'opera', element: <OperaLogPage /> },
    ],
  },
  // Monitor
  {
    path: 'monitor',
    element: layoutElement,
    children: [
      { element: <MonitorPage />, index: true },
      { path: 'online', element: <SessionPage /> },
    ],
  },
];
