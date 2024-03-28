import { ThemeProvider } from '@mui/material/styles';
import { render, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { theme } from '../styles/theme';

interface Options {
  route?: string;
  path?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', path = '/' }: Options = {}
): RenderResult {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter
        initialEntries={[route]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AuthProvider>
          <Routes>
            <Route path={path} element={ui} />
            <Route path="*" element={<div>elsewhere</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>
  );
}
