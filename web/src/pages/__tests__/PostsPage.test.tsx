import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPosts } from '../../api/posts';
import { samplePage, samplePosts } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import { PostsPage } from '../PostsPage';

vi.mock('../../api/posts');

const mockedFetchPosts = vi.mocked(fetchPosts);

describe('<PostsPage />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows skeletons before the posts arrive', async () => {
    mockedFetchPosts.mockResolvedValue(samplePage());
    renderWithProviders(<PostsPage />);

    expect(screen.getAllByTestId('post-skeleton').length).toBeGreaterThan(0);
    await waitFor(() => expect(screen.getByText(samplePosts[0].title)).toBeInTheDocument());
  });

  it('renders each post with its author, date and reading time', async () => {
    mockedFetchPosts.mockResolvedValue(samplePage());
    renderWithProviders(<PostsPage />);

    expect(await screen.findByText(samplePosts[0].title)).toBeInTheDocument();
    expect(screen.getByText(samplePosts[1].title)).toBeInTheDocument();
    expect(screen.getByText(/John Doe · 1 April 2024 · 3 min read/)).toBeInTheDocument();
    expect(screen.getByText(samplePosts[0].excerpt)).toBeInTheDocument();
  });

  it('asks the API for a bounded page rather than every post', async () => {
    mockedFetchPosts.mockResolvedValue(samplePage());
    renderWithProviders(<PostsPage />);

    await waitFor(() => expect(mockedFetchPosts).toHaveBeenCalled());
    expect(mockedFetchPosts).toHaveBeenCalledWith({ search: undefined, page: 1, pageSize: 6 });
  });

  it('passes a search term through to the API', async () => {
    mockedFetchPosts.mockResolvedValue(samplePage());
    renderWithProviders(<PostsPage />);
    await waitFor(() => expect(mockedFetchPosts).toHaveBeenCalled());

    await userEvent.type(screen.getByLabelText('Search posts'), 'pagination{enter}');

    await waitFor(() =>
      expect(mockedFetchPosts).toHaveBeenLastCalledWith({ search: 'pagination', page: 1, pageSize: 6 })
    );
  });

  it('explains an empty feed instead of rendering a blank page', async () => {
    mockedFetchPosts.mockResolvedValue(samplePage([]));
    renderWithProviders(<PostsPage />);

    expect(await screen.findByText('No posts yet')).toBeInTheDocument();
  });

  it('surfaces an API failure with a retry', async () => {
    mockedFetchPosts.mockRejectedValue(new Error('boom'));
    renderWithProviders(<PostsPage />);

    expect(await screen.findByText('That did not load')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('hides pagination when everything fits on one page', async () => {
    mockedFetchPosts.mockResolvedValue(samplePage());
    renderWithProviders(<PostsPage />);

    await screen.findByText(samplePosts[0].title);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('shows pagination when there is more than one page', async () => {
    mockedFetchPosts.mockResolvedValue(samplePage(samplePosts, { total: 14, totalPages: 3 }));
    renderWithProviders(<PostsPage />);

    await screen.findByText(samplePosts[0].title);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('14 posts')).toBeInTheDocument();
  });
});
