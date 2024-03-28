import { screen } from '@testing-library/react';
import Cookies from 'js-cookie';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAccount } from '../../api/auth';
import { fetchPost } from '../../api/posts';
import { samplePosts } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import { EditorPage } from '../EditorPage';

vi.mock('../../api/posts');
vi.mock('../../api/auth');

const post = samplePosts[0];

function renderEditorAs(accountId: string) {
  Cookies.set('authtoken', 'token');
  vi.mocked(fetchAccount).mockResolvedValue({ id: accountId, name: 'Someone', email: 's@example.com' });
  vi.mocked(fetchPost).mockResolvedValue(post);
  renderWithProviders(<EditorPage mode="edit" />, {
    route: `/posts/${post.id}/edit`,
    path: '/posts/:id/edit',
  });
}

describe('<EditorPage mode="edit" />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    Cookies.remove('authtoken');
  });

  it('loads the post into the form for its author', async () => {
    renderEditorAs(post.author.id);
    expect(await screen.findByDisplayValue(post.title)).toBeInTheDocument();
  });

  it('refuses to open someone else’s post', async () => {
    renderEditorAs('someone-else');
    expect(await screen.findByText('You can only edit your own posts.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();
  });
});
