import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ink } from '../styles/theme';
import { routes } from './routes';

export function Header(): JSX.Element {
  const { account, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <AppBar
      position="static"
      color="transparent"
      sx={{ borderBottom: `1px solid ${ink.rule}`, backgroundColor: ink.surface }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2, minHeight: 68 }}>
          <Typography
            component={RouterLink}
            to={routes.home}
            variant="h3"
            sx={{ textDecoration: 'none', color: ink.primary, fontSize: '1.25rem', letterSpacing: '-0.01em' }}
          >
            Blogs
          </Typography>
          <Typography variant="overline" sx={{ color: ink.secondary, display: { xs: 'none', md: 'block' } }}>
            Notes on building things
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {account ? (
            <>
              <Typography variant="body2" sx={{ color: ink.secondary, display: { xs: 'none', sm: 'block' } }}>
                {account.name}
              </Typography>
              <Button variant="contained" onClick={() => navigate(routes.newPost)}>
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
        </Toolbar>
      </Container>
    </AppBar>
  );
}
