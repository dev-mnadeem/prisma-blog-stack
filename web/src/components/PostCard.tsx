import { Box, Typography } from '@mui/material';
import type { JSX } from 'react';
import { Link as RouterLink } from 'react-router';
import { ink } from '../styles/theme';
import { Post } from '../types/post';
import { Byline } from './Byline';
import { routes } from './routes';

interface PostCardProps {
  post: Post;
  /** The newest post on the front page gets a larger title and standfirst. */
  lead?: boolean;
}

export function PostCard({ post, lead = false }: PostCardProps): JSX.Element {
  return (
    <Box
      component="article"
      sx={{
        py: lead ? { xs: 4, md: 5 } : 4,
        borderBottom: `1px solid ${ink.rule}`,
        ...(lead && { borderTop: `2px solid ${ink.primary}`, mt: 2 }),
      }}
    >
      <Byline post={post} />
      <Typography
        variant="h2"
        sx={{ mt: 1, mb: 1.5, ...(lead && { fontSize: { xs: '2rem', md: '2.5rem' }, lineHeight: 1.15 }) }}
      >
        <Box
          component={RouterLink}
          to={routes.post(post.id)}
          sx={{
            color: ink.primary,
            textDecoration: 'none',
            '&:hover': { color: ink.accent, textDecorationLine: 'underline', textUnderlineOffset: '4px' },
          }}
        >
          {post.title}
        </Box>
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: ink.secondary, maxWidth: '62ch', ...(lead && { fontSize: { md: '1.25rem' } }) }}
      >
        {post.excerpt}
      </Typography>
    </Box>
  );
}
