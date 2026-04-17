import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';

import { SplashScreen } from 'src/components/loading-screen';

import { authRoutes } from './auth';
import { mainRoutes } from './main';
import { dashboardRoutes } from './dashboard';

// ----------------------------------------------------------------------

const Page404 = lazy(() => import('src/pages/error/404'));

export const routesSection: RouteObject[] = [
  // Auth
  ...authRoutes,

  // Dashboard
  ...dashboardRoutes,

  // Main (redirect / -> /dashboard, error pages)
  ...mainRoutes,

  // No match
  { path: '*', element: <Suspense fallback={<SplashScreen />}><Page404 /></Suspense> },
];
