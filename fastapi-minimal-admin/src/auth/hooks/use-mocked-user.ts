import { useAuthContext } from './use-auth-context';

// To get the user from the <AuthContext/>, use:
// import { useAuthContext } from 'src/auth/hooks';
// const { user } = useAuthContext();

// ----------------------------------------------------------------------

export function useMockedUser() {
  const { user } = useAuthContext();
  return { user };
}
