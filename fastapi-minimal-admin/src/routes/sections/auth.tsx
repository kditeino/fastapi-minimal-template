import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { AuthSplitLayout } from 'src/layouts/auth-split';

import { SplashScreen } from 'src/components/loading-screen';

import { GuestGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

const FbaSignInPage = lazy(() => import('src/pages/auth/fba/sign-in'));

// ----------------------------------------------------------------------

export const authRoutes: RouteObject[] = [
  {
    path: 'auth',
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [
      {
        path: 'fba',
        children: [
          {
            path: 'sign-in',
            element: (
              <GuestGuard>
                <AuthSplitLayout
                  slotProps={{
                    section: { title: 'Hi, Welcome back' },
                  }}
                >
                  <FbaSignInPage />
                </AuthSplitLayout>
              </GuestGuard>
            ),
          },
        ],
      },
    ],
  },
];
