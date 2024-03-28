import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Route, Routes } from 'react-router';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { routes } from './components/routes';
import { EditorPage } from './pages/EditorPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PostPage } from './pages/PostPage';
import { PostsPage } from './pages/PostsPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { theme } from './styles/theme';
import type { JSX } from 'react';

export function App(): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path={routes.home} element={<PostsPage />} />
            <Route
              path={routes.newPost}
              element={
                <RequireAuth>
                  <EditorPage mode="create" />
                </RequireAuth>
              }
            />
            <Route path={routes.post()} element={<PostPage />} />
            <Route
              path={routes.editPost()}
              element={
                <RequireAuth>
                  <EditorPage mode="edit" />
                </RequireAuth>
              }
            />
            <Route path={routes.signin} element={<SignInPage />} />
            <Route path={routes.signup} element={<SignUpPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
