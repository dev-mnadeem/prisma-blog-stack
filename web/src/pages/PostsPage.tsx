import { Box, Pagination, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { fetchPosts } from '../api/posts';
import { apiErrorMessage } from '../api/client';
import { Layout } from '../components/Layout';
import { PostCard } from '../components/PostCard';
import { PostCardSkeleton } from '../components/PostCardSkeleton';
import { routes } from '../components/routes';
import { SearchField } from '../components/SearchField';
import { ErrorState, StateMessage } from '../components/StateMessage';
import { ink } from '../styles/theme';
import { PostPage } from '../types/post';

const PAGE_SIZE = 6;
const SKELETON_COUNT = 3;

export function PostsPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10) || 1;

  const [result, setResult] = useState<PostPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchPosts({ search: search || undefined, page, pageSize: PAGE_SIZE })
      .then((data) => {
        if (!cancelled) {
          setResult(data);
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setError(apiErrorMessage(fetchError, 'Could not load posts'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [search, page, reloadToken]);

  const onSearch = useCallback(
    (term: string) => {
      setSearchParams(term ? { search: term } : {});
    },
    [setSearchParams]
  );

  const onPageChange = useCallback(
    (_event: unknown, next: number) => {
      const params: Record<string, string> = { page: String(next) };
      if (search) {
        params.search = search;
      }
      setSearchParams(params);
      window.scrollTo({ top: 0 });
    },
    [search, setSearchParams]
  );

  return (
    <Layout maxWidth="md">
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h1">Latest posts</Typography>
        <Typography variant="body2" sx={{ color: ink.secondary, maxWidth: '58ch' }}>
          Short pieces on databases, APIs and the parts of a web app that only hurt once there is real
          traffic.
        </Typography>
      </Stack>

      <Box sx={{ mb: 2, maxWidth: 420 }}>
        <SearchField value={search} onSearch={onSearch} />
      </Box>

      {isLoading ? (
        <Box aria-busy="true">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </Box>
      ) : error ? (
        <ErrorState message={error} onRetry={() => setReloadToken((token) => token + 1)} />
      ) : result && result.items.length > 0 ? (
        <>
          <Typography variant="overline" sx={{ color: ink.secondary }}>
            {result.total} {result.total === 1 ? 'post' : 'posts'}
            {search ? ` matching “${search}”` : ''}
          </Typography>
          <Box component="section">
            {result.items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </Box>
          {result.totalPages > 1 ? (
            <Stack alignItems="center" sx={{ mt: 4 }}>
              <Pagination count={result.totalPages} page={result.page} onChange={onPageChange} />
            </Stack>
          ) : null}
        </>
      ) : search ? (
        <StateMessage
          title="Nothing matched that"
          body={`No post mentions “${search}”. Clear the search to see everything.`}
          action={
            <Box component={RouterLink} to={routes.home} sx={{ color: ink.accent }}>
              Show all posts
            </Box>
          }
        />
      ) : (
        <StateMessage
          title="No posts yet"
          body="Once someone publishes, it shows up here newest first. Sign in to write the first one."
        />
      )}
    </Layout>
  );
}
