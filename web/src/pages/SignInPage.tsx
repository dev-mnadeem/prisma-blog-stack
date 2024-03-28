import { Box, Link, Paper, Stack, Typography } from '@mui/material';
import { type JSX, useCallback } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { CredentialsForm, CredentialsFormValues } from '../components/CredentialsForm';
import { Layout } from '../components/Layout';
import { routes } from '../components/routes';
import { useDocumentTitle } from '../components/useDocumentTitle';
import { ink } from '../styles/theme';

export function SignInPage(): JSX.Element {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  useDocumentTitle('Sign in');
  const location = useLocation();
  // RequireAuth sends readers here with the page they were trying to open.
  const returnTo = (location.state as { from?: string } | null)?.from ?? routes.home;

  const onSubmit = useCallback(
    async (values: CredentialsFormValues) => {
      await signIn({ email: values.email, password: values.password });
      navigate(returnTo, { replace: true });
    },
    [navigate, returnTo, signIn]
  );

  return (
    <Layout maxWidth="sm">
      <Paper sx={{ p: { xs: 3, md: 5 }, border: `1px solid ${ink.rule}` }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h1" sx={{ fontSize: '2rem' }}>
            Sign in
          </Typography>
          <Typography variant="body2" sx={{ color: ink.secondary }}>
            You only need an account to publish. Reading is open to everyone.
          </Typography>
        </Stack>
        <CredentialsForm submitLabel="Sign in" onSubmit={onSubmit} />
        <Box sx={{ mt: 3 }}>
          <Link component={RouterLink} to={routes.signup} underline="hover" variant="body2">
            Don&apos;t have an account? Create one
          </Link>
        </Box>
      </Paper>
    </Layout>
  );
}
