import { Link, Typography } from '@mui/material';
import type { JSX } from 'react';
import { Link as RouterLink } from 'react-router';
import { ink } from '../styles/theme';
import { Post } from '../types/post';
import { formatDate, formatReadingTime } from './formatting';
import { routes } from './routes';

export function Byline({ post }: { post: Post }): JSX.Element {
  return (
    <Typography variant="overline" component="p" sx={{ color: ink.secondary, lineHeight: 1.8 }}>
      <Link component={RouterLink} to={routes.byAuthor(post.author.id)} color="inherit" underline="hover">
        {post.author.name}
      </Link>
      {' · '}
      <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
      {' · '}
      {formatReadingTime(post.readingMinutes)}
    </Typography>
  );
}
