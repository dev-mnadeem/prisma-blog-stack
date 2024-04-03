import { Box, Button, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { apiErrorMessage } from '../api/client';
import { deletePost, fetchPost } from '../api/posts';
import { useAuth } from '../auth/AuthContext';
import { formatDate, formatReadingTime } from '../components/formatting';
import { Layout } from '../components/Layout';
import { routes } from '../components/routes';
import { ErrorState } from '../components/StateMessage';
import { ink, READING_MEASURE } from '../styles/theme';
import { Post } from '../types/post';

export function PostPage(): JSX.Element {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { account } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchPost(id)
      .then((data) => {
        if (!cancelled) {
          setPost(data);
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setError(apiErrorMessage(fetchError, 'Could not load this post'));
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
  }, [id]);

  const onDelete = useCallback(async () => {
    try {
      await deletePost(id);
      navigate(routes.home);
    } catch (deleteError) {
      setError(apiErrorMessage(deleteError, 'Could not delete this post'));
    }
  }, [id, navigate]);

  if (isLoading) {
    return (
      <Layout maxWidth="md">
        <Skeleton variant="text" width={220} height={20} />
        <Skeleton variant="text" width="80%" height={56} />
        <Skeleton variant="rectangular" height={280} sx={{ mt: 3, borderRadius: 2 }} />
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout maxWidth="md">
        <ErrorState message={error ?? 'That post does not exist.'} />
        <Box sx={{ mt: 3 }}>
          <Button component={RouterLink} to={routes.home} variant="outlined">
            Back to all posts
          </Button>
        </Box>
      </Layout>
    );
  }

  const isAuthor = account?.id === post.author.id;

  return (
    <Layout maxWidth="md">
      <Box component="article" sx={{ maxWidth: READING_MEASURE, mx: 'auto' }}>
        <Typography variant="overline" sx={{ color: ink.secondary }}>
          {post.author.name} · {formatDate(post.createdAt)} · {formatReadingTime(post.readingMinutes)}
        </Typography>
        <Typography variant="h1" sx={{ mt: 1.5, mb: 3 }}>
          {post.title}
        </Typography>
        <Divider sx={{ mb: 4 }} />

        {post.content.split(/\n{2,}/).map((paragraph, index) => (
          <Typography key={index} variant="body1" paragraph>
            {paragraph}
          </Typography>
        ))}

        <Divider sx={{ my: 4 }} />
        <Stack direction="row" spacing={2}>
          <Button component={RouterLink} to={routes.home} variant="text" color="inherit">
            ← All posts
          </Button>
          {isAuthor ? (
            <>
              <Button component={RouterLink} to={routes.editPost(post.id)} variant="outlined">
                Edit
              </Button>
              <Button onClick={onDelete} variant="text" color="inherit">
                Delete
              </Button>
            </>
          ) : null}
        </Stack>
      </Box>
    </Layout>
  );
}
