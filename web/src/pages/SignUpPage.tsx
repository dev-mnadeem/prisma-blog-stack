import { Box, Link, Paper, Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../auth/AuthContext';
import { CredentialsForm, CredentialsFormValues } from '../components/CredentialsForm';
import { Layout } from '../components/Layout';
import { routes } from '../components/routes';
import { ink } from '../styles/theme';

export function SignUpPage(): JSX.Element {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  /** Registering then signing in saves the reader an immediate second form. */
  const onSubmit = useCallback(
    async (values: CredentialsFormValues) => {
      await register({ name: values.name ?? '', email: values.email, password: values.password });
      await signIn({ email: values.email, password: values.password });
      navigate(routes.home);
    },
    [navigate, signIn]
  );

  return (
    <Layout maxWidth="sm">
      <Paper sx={{ p: { xs: 3, md: 5 }, border: `1px solid ${ink.rule}` }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h1" sx={{ fontSize: '2rem' }}>
            Create an account
          </Typography>
          <Typography variant="body2" sx={{ color: ink.secondary }}>
            Passwords need at least 8 characters.
          </Typography>
        </Stack>
        <CredentialsForm withName submitLabel="Create account" onSubmit={onSubmit} />
        <Box sx={{ mt: 3 }}>
          <Link component={RouterLink} to={routes.signin} underline="hover" variant="body2">
            Already have an account? Sign in
          </Link>
        </Box>
      </Paper>
    </Layout>
  );
}
