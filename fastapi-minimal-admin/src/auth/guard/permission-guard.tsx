import type { ReactNode } from 'react';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

type PermissionGuardProps = {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { hasPermission } = useAuthContext();

  if (!hasPermission(permission)) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
