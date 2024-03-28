import { Box, Link, Pagination, Stack, Typography } from '@mui/material';
import { type JSX, useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router';
import { apiErrorMessage } from '../api/client';
import { fetchPosts } from '../api/posts';
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

interface FeedQuery {
  search: string;
  author: string;
  page: number;
}

/** Only non-default values go into the URL, so the plain feed stays at "/". */
function toSearchParams({ search, author, page }: FeedQuery): Record<string, string> {
  const params: Record<string, string> = {};
  if (search) {
    params.search = search;
  }
  if (author) {
    params.author = author;
  }
  if (page > 1) {
    params.page = String(page);
  }
  return params;
}

function feedHref(query: FeedQuery): string {
  const queryString = new URLSearchParams(toSearchParams(query)).toString();
  return queryString ? `/?${queryString}` : routes.home;
}

export function PostsPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const author = searchParams.get('author') ?? '';
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10) || 1;

  const [result, setResult] = useState<PostPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchPosts({ search: search || undefined, author: author || undefined, page, pageSize: PAGE_SIZE })
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
  }, [search, author, page, reloadToken]);

  const onSearch = useCallback(
    (term: string) => setSearchParams(toSearchParams({ search: term, author, page: 1 })),
    [author, setSearchParams]
  );

  const onPageChange = useCallback(
    (_event: unknown, next: number) => {
      setSearchParams(toSearchParams({ search, author, page: next }));
      window.scrollTo({ top: 0 });
    },
    [search, author, setSearchParams]
  );

  const authorName = author ? result?.items[0]?.author.name : undefined;
  const heading = author ? `Posts by ${authorName ?? 'this author'}` : 'Latest posts';

  return (
    <Layout maxWidth="md">
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h1">{heading}</Typography>
        {author ? (
          <Link component={RouterLink} to={routes.home} underline="hover" variant="body2">
            Show posts by everyone
          </Link>
        ) : (
          <Typography variant="body2" sx={{ color: ink.secondary, maxWidth: '58ch' }}>
            Short pieces on databases, APIs and the parts of a web app that only hurt once there is real
            traffic.
          </Typography>
        )}
      </Stack>

      <Box sx={{ mb: 2, maxWidth: 420 }}>
        <SearchField value={search} onSearch={onSearch} />
      </Box>

      {isLoading ? (
        <Box aria-busy="true" aria-label="Loading posts">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </Box>
      ) : error ? (
        <ErrorState message={error} onRetry={() => setReloadToken((token) => token + 1)} />
      ) : result && result.items.length > 0 ? (
        <>
          <Typography variant="overline" component="p" sx={{ color: ink.secondary }}>
            {result.total} {result.total === 1 ? 'post' : 'posts'}
            {search ? ` matching “${search}”` : ''}
            {search ? (
              <>
                {' · '}
                <Link component="button" type="button" onClick={() => onSearch('')} sx={{ font: 'inherit' }}>
                  Clear search
                </Link>
              </>
            ) : null}
          </Typography>
          <Box component="section" aria-label="Posts">
            {result.items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </Box>
          {result.totalPages > 1 ? (
            <Stack sx={{ alignItems: 'center', mt: 4 }}>
              <Pagination count={result.totalPages} page={result.page} onChange={onPageChange} />
            </Stack>
          ) : null}
        </>
      ) : result && result.total > 0 ? (
        <StateMessage
          title={`There is no page ${page}`}
          body={`These posts fit on ${result.totalPages} ${result.totalPages === 1 ? 'page' : 'pages'}.`}
          action={
            <Link component={RouterLink} to={feedHref({ search, author, page: 1 })}>
              Go to the first page
            </Link>
          }
        />
      ) : search ? (
        <StateMessage
          title="Nothing matched that"
          body={`No post mentions “${search}”. Clear the search to see everything.`}
          action={
            <Link component="button" type="button" onClick={() => onSearch('')}>
              Clear search
            </Link>
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
