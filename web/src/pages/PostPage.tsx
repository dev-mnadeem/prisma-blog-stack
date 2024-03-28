import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { type JSX, useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router';
import { apiErrorMessage } from '../api/client';
import { deletePost, fetchPost } from '../api/posts';
import { useAuth } from '../auth/AuthContext';
import { Byline } from '../components/Byline';
import { Layout } from '../components/Layout';
import { routes } from '../components/routes';
import { ErrorState } from '../components/StateMessage';
import { READING_MEASURE } from '../styles/theme';
import { Post } from '../types/post';

export function PostPage(): JSX.Element {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { account } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
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

  // A failed delete keeps the post on screen; replacing it with an error page lost the reader's place.
  const onConfirmDelete = useCallback(async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deletePost(id);
      navigate(routes.home, { replace: true });
    } catch (failure) {
      setDeleteError(apiErrorMessage(failure, 'Could not delete this post'));
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  }, [id, navigate]);

  const closeDeleteDialog = useCallback(() => {
    if (!isDeleting) {
      setIsConfirmingDelete(false);
    }
  }, [isDeleting]);

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
        <Byline post={post} />
        <Typography variant="h1" sx={{ mt: 1.5, mb: 3 }}>
          {post.title}
        </Typography>
        <Divider sx={{ mb: 4 }} />

        {post.content.split(/\n{2,}/).map((paragraph, index) => (
          <Typography key={index} variant="body1" component="p" sx={{ mb: 2 }}>
            {paragraph}
          </Typography>
        ))}

        <Divider sx={{ my: 4 }} />
        {deleteError ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {deleteError}
          </Alert>
        ) : null}
        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Button component={RouterLink} to={routes.home} variant="text" color="inherit">
            ← All posts
          </Button>
          {isAuthor ? (
            <>
              <Button component={RouterLink} to={routes.editPost(post.id)} variant="outlined">
                Edit
              </Button>
              <Button onClick={() => setIsConfirmingDelete(true)} variant="text" color="inherit">
                Delete
              </Button>
            </>
          ) : null}
        </Stack>
      </Box>

      <Dialog
        open={isConfirmingDelete}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-post-title"
        aria-describedby="delete-post-body"
      >
        <DialogTitle id="delete-post-title">Delete this post?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-post-body">
            “{post.title}” will be removed for every reader. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDeleteDialog} color="inherit" disabled={isDeleting}>
            Keep it
          </Button>
          <Button onClick={onConfirmDelete} variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete post'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
