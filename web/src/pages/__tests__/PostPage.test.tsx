import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPost } from '../../api/posts';
import { samplePosts } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import { PostPage } from '../PostPage';

vi.mock('../../api/posts');

const mockedFetchPost = vi.mocked(fetchPost);
const post = samplePosts[0];

describe('<PostPage />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

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
});
