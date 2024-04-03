import { Box, Skeleton } from '@mui/material';
import { ink } from '../styles/theme';

export function PostCardSkeleton(): JSX.Element {
  return (
    <Box sx={{ py: 4, borderBottom: `1px solid ${ink.rule}` }} data-testid="post-skeleton">
      <Skeleton variant="text" width={180} height={18} />
      <Skeleton variant="text" width="70%" height={40} />
      <Skeleton variant="text" width="95%" height={22} />
      <Skeleton variant="text" width="88%" height={22} />
    </Box>
  );
}
