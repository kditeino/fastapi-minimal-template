import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router';

import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const Page500 = lazy(() => import('src/pages/error/500'));
const Page403 = lazy(() => import('src/pages/error/403'));
const Page404 = lazy(() => import('src/pages/error/404'));

// ----------------------------------------------------------------------

export const mainRoutes: RouteObject[] = [
  {
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Navigate to="/dashboard" replace />
      </Suspense>
    ),
    index: true,
  },
  {
    path: 'error',
    children: [
      { path: '500', element: <Suspense fallback={<SplashScreen />}><Page500 /></Suspense> },
      { path: '404', element: <Suspense fallback={<SplashScreen />}><Page404 /></Suspense> },
      { path: '403', element: <Suspense fallback={<SplashScreen />}><Page403 /></Suspense> },
    ],
  },
];
