import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Cookies from 'js-cookie';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAccount } from '../../api/auth';
import { deletePost, fetchPost } from '../../api/posts';
import { samplePosts } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import { PostPage } from '../PostPage';

vi.mock('../../api/posts');
vi.mock('../../api/auth');

const mockedFetchPost = vi.mocked(fetchPost);
const post = samplePosts[0];

describe('<PostPage />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    Cookies.remove('authtoken');
  });

  async function renderAsAuthor() {
    Cookies.set('authtoken', 'token');
    vi.mocked(fetchAccount).mockResolvedValue({
      id: post.author.id,
      name: post.author.name,
      email: 'j@example.com',
    });
    mockedFetchPost.mockResolvedValue(post);
    renderWithProviders(<PostPage />, { route: `/posts/${post.id}`, path: '/posts/:id' });
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }));
  }

  it('renders the byline and every paragraph of the body', async () => {
    mockedFetchPost.mockResolvedValue(post);
    renderWithProviders(<PostPage />, { route: `/posts/${post.id}`, path: '/posts/:id' });

    expect(await screen.findByRole('heading', { level: 1, name: post.title })).toBeInTheDocument();
    expect(screen.getByText(/John Doe · 1 April 2024 · 3 min read/)).toBeInTheDocument();
    for (const paragraph of post.content.split('\n\n')) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
  });

  it('does not offer edit or delete to a reader who is not signed in', async () => {
    mockedFetchPost.mockResolvedValue(post);
    renderWithProviders(<PostPage />, { route: `/posts/${post.id}`, path: '/posts/:id' });

    await screen.findByRole('heading', { level: 1, name: post.title });
    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('explains a missing post', async () => {
    mockedFetchPost.mockRejectedValue(new Error('nope'));
    renderWithProviders(<PostPage />, { route: '/posts/unknown', path: '/posts/:id' });

    expect(await screen.findByText('That did not load')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to all posts' })).toBeInTheDocument();
  });

  it('asks before deleting, and keeping the post deletes nothing', async () => {
    await renderAsAuthor();

    expect(screen.getByRole('dialog', { name: 'Delete this post?' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Keep it' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(deletePost).not.toHaveBeenCalled();
  });

  it('deletes after confirmation and returns to the feed', async () => {
    vi.mocked(deletePost).mockResolvedValue(undefined);
    await renderAsAuthor();

    await userEvent.click(screen.getByRole('button', { name: 'Delete post' }));

    expect(deletePost).toHaveBeenCalledWith(post.id);
    expect(await screen.findByText('elsewhere')).toBeInTheDocument();
  });

  it('keeps the post on screen when the delete fails', async () => {
    vi.mocked(deletePost).mockRejectedValue(new Error('offline'));
    await renderAsAuthor();

    await userEvent.click(screen.getByRole('button', { name: 'Delete post' }));

    expect(await screen.findByText('Could not delete this post')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { level: 1, name: post.title })).toBeInTheDocument();
  });
});
