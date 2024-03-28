import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAccount, login } from '../../api/auth';
import { AuthProvider } from '../../auth/AuthContext';
import { SignInPage } from '../SignInPage';

vi.mock('../../api/auth');

function renderSignIn(state?: { from: string }) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/signin', state }]}>
      <AuthProvider>
        <Routes>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/posts/new" element={<div>editor</div>} />
          <Route path="/" element={<div>home</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

async function submitCredentials() {
  await userEvent.type(screen.getByLabelText('Email address'), 'johndoe@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'blogs-demo-2024');
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('<SignInPage />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(login).mockResolvedValue('token');
    vi.mocked(fetchAccount).mockResolvedValue({
      id: 'author-1',
      name: 'John Doe',
      email: 'johndoe@example.com',
    });
  });

  it('returns to the page that required a sign-in', async () => {
    renderSignIn({ from: '/posts/new' });
    await submitCredentials();
    expect(await screen.findByText('editor')).toBeInTheDocument();
  });

  it('goes to the feed when nothing asked for a sign-in', async () => {
    renderSignIn();
    await submitCredentials();
    expect(await screen.findByText('home')).toBeInTheDocument();
  });
});
