import { Box, Container } from '@mui/material';
import { type JSX, PropsWithChildren } from 'react';
import { Header } from './Header';

interface LayoutProps {
  maxWidth?: 'sm' | 'md' | 'lg';
}

export function Layout({ children, maxWidth = 'lg' }: PropsWithChildren<LayoutProps>): JSX.Element {
  return (
    <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <Container
        component="main"
        id="main"
        tabIndex={-1}
        maxWidth={maxWidth}
        sx={{ flexGrow: 1, py: { xs: 4, md: 6 }, '&:focus': { outline: 'none' } }}
      >
        {children}
      </Container>
    </Box>
  );
}
