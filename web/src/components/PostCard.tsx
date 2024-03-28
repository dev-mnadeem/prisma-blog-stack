import { Box, Typography } from '@mui/material';
import type { JSX } from 'react';
import { Link as RouterLink } from 'react-router';
import { ink } from '../styles/theme';
import { Post } from '../types/post';
import { Byline } from './Byline';
import { routes } from './routes';

export function PostCard({ post }: { post: Post }): JSX.Element {
  return (
    <Box component="article" sx={{ py: 4, borderBottom: `1px solid ${ink.rule}` }}>
      <Byline post={post} />
      <Typography variant="h2" sx={{ mt: 1, mb: 1.5 }}>
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
      <Typography variant="body1" sx={{ color: ink.secondary, maxWidth: '62ch' }}>
        {post.excerpt}
      </Typography>
    </Box>
  );
}
