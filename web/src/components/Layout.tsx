import { Box, Container } from '@mui/material';
import { PropsWithChildren } from 'react';
import { Header } from './Header';

interface LayoutProps {
  maxWidth?: 'sm' | 'md' | 'lg';
}

export function Layout({ children, maxWidth = 'lg' }: PropsWithChildren<LayoutProps>): JSX.Element {
  return (
    <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container component="main" maxWidth={maxWidth} sx={{ flexGrow: 1, py: { xs: 4, md: 6 } }}>
        {children}
      </Container>
    </Box>
  );
}
