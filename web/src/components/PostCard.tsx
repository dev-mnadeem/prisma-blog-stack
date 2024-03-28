import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ink } from '../styles/theme';
import { Post } from '../types/post';
import { formatDate, formatReadingTime } from './formatting';
import { routes } from './routes';

export function PostCard({ post }: { post: Post }): JSX.Element {
  return (
    <Box component="article" sx={{ py: 4, borderBottom: `1px solid ${ink.rule}` }}>
      <Typography variant="overline" sx={{ color: ink.secondary }}>
        {post.author.name} · {formatDate(post.createdAt)} · {formatReadingTime(post.readingMinutes)}
      </Typography>
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
