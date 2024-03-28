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
    expect(screen.getAllByRole('link', { name: 'John Doe' })[0]).toHaveAttribute('href', '/?author=author-1');
    expect(screen.getByText('1 April 2024')).toHaveAttribute('datetime', samplePosts[0].createdAt);
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

  it('narrows the feed to one author from the URL', async () => {
    mockedFetchPosts.mockResolvedValue(samplePage([samplePosts[0]]));
    renderWithProviders(<PostsPage />, { route: '/?author=author-1' });

    expect(await screen.findByRole('heading', { level: 1, name: 'Posts by John Doe' })).toBeInTheDocument();
    expect(mockedFetchPosts).toHaveBeenCalledWith({ author: 'author-1', page: 1, pageSize: 6 });
    expect(screen.getByRole('link', { name: 'Show posts by everyone' })).toHaveAttribute('href', '/');
  });

  it('keeps the author filter when searching within it', async () => {
    mockedFetchPosts.mockResolvedValue(samplePage([samplePosts[0]]));
    renderWithProviders(<PostsPage />, { route: '/?author=author-1' });
    await screen.findByText(samplePosts[0].title);

    await userEvent.type(screen.getByLabelText('Search posts'), 'join{enter}');

    await waitFor(() =>
      expect(mockedFetchPosts).toHaveBeenLastCalledWith({
        search: 'join',
        author: 'author-1',
        page: 1,
        pageSize: 6,
      })
    );
  });

  it('says so when the page number is past the end', async () => {
    mockedFetchPosts.mockResolvedValue(samplePage([], { total: 9, totalPages: 2, page: 7 }));
    renderWithProviders(<PostsPage />, { route: '/?page=7' });

    expect(await screen.findByText('There is no page 7')).toBeInTheDocument();
    expect(screen.queryByText('No posts yet')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to the first page' })).toHaveAttribute('href', '/');
  });

  it('clears a search from the result count', async () => {
    mockedFetchPosts.mockResolvedValue(samplePage());
    renderWithProviders(<PostsPage />, { route: '/?search=loop' });
    await screen.findByText(samplePosts[0].title);

    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));

    await waitFor(() => expect(mockedFetchPosts).toHaveBeenLastCalledWith({ page: 1, pageSize: 6 }));
  });
});
