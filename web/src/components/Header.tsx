import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { ink } from '../styles/theme';
import { routes } from './routes';
import type { JSX } from 'react';

export function Header(): JSX.Element {
  const { account, signOut } = useAuth();

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        borderTop: `4px solid ${ink.accent}`,
        borderBottom: `1px solid ${ink.rule}`,
        backgroundColor: ink.surface,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2, minHeight: 68 }}>
          <Typography
            component={RouterLink}
            to={routes.home}
            variant="h3"
            sx={{ textDecoration: 'none', color: ink.primary, fontSize: '1.5rem', letterSpacing: '-0.02em' }}
          >
            Blogs
          </Typography>
          <Typography variant="overline" sx={{ color: ink.secondary, display: { xs: 'none', md: 'block' } }}>
            Notes on building things
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box
            component="nav"
            aria-label="Account"
            sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}
          >
            {account ? (
              <>
                <Typography
                  variant="body2"
                  sx={{ color: ink.secondary, display: { xs: 'none', sm: 'block' } }}
                >
                  {account.name}
                </Typography>
                <Button component={RouterLink} to={routes.newPost} variant="contained">
                  Write a post
                </Button>
                <Button variant="text" color="inherit" onClick={signOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button component={RouterLink} to={routes.signin} variant="text" color="inherit">
                  Sign in
                </Button>
                <Button component={RouterLink} to={routes.signup} variant="contained">
                  Create account
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
