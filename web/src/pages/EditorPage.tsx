import { Box, Skeleton, Typography } from '@mui/material';
import { type JSX, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { apiErrorMessage } from '../api/client';
import { createPost, fetchPost, updatePost } from '../api/posts';
import { useAuth } from '../auth/AuthContext';
import { Layout } from '../components/Layout';
import { PostForm } from '../components/PostForm';
import { routes } from '../components/routes';
import { ErrorState } from '../components/StateMessage';
import { ink } from '../styles/theme';
import { PostDraft } from '../types/post';

/** One page for both "write" and "edit" — the only difference is where it loads from. */
export function EditorPage({ mode }: { mode: 'create' | 'edit' }): JSX.Element {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { account } = useAuth();
  const accountId = account?.id;

  const [draft, setDraft] = useState<PostDraft | undefined>(
    mode === 'create' ? { title: '', content: '' } : undefined
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'edit' || !accountId) {
      return;
    }
    let cancelled = false;
    fetchPost(id)
      .then((post) => {
        if (cancelled) {
          return;
        }
        // The API would refuse the save with a 403; say so before anyone types into the form.
        if (post.author.id !== accountId) {
          setError('You can only edit your own posts.');
          return;
        }
        setDraft({ title: post.title, content: post.content });
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setError(apiErrorMessage(fetchError, 'Could not load this post'));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [accountId, id, mode]);

  const onSubmit = useCallback(
    async (values: PostDraft) => {
      const saved = mode === 'create' ? await createPost(values) : await updatePost(id, values);
      navigate(routes.post(saved.id));
    },
    [id, mode, navigate]
  );

  return (
    <Layout maxWidth="md">
      <Typography variant="h1" sx={{ mb: 1 }}>
        {mode === 'create' ? 'Write a post' : 'Edit post'}
      </Typography>
      <Typography variant="body2" sx={{ color: ink.secondary, mb: 4, maxWidth: '58ch' }}>
        The standfirst shown in the list and the reading time are generated when you save.
      </Typography>

      {error ? (
        <ErrorState message={error} />
      ) : draft ? (
        <PostForm
          initialValues={draft}
          submitLabel={mode === 'create' ? 'Publish' : 'Save changes'}
          onSubmit={onSubmit}
          onCancel={() => navigate(-1)}
        />
      ) : (
        <Box>
          <Skeleton variant="rectangular" height={56} sx={{ mb: 3, borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 1 }} />
        </Box>
      )}
    </Layout>
  );
}
