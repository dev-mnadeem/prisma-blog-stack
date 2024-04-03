import { Box, CircularProgress } from '@mui/material';
import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { routes } from './routes';

/** Waits for the session check before redirecting, so a refresh does not bounce. */
export function RequireAuth({ children }: PropsWithChildren): JSX.Element {
  const { account, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!account) {
    return <Navigate to={routes.signin} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
