import { Box, Button, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { ink } from '../styles/theme';

interface StateMessageProps {
  title: string;
  body: string;
  action?: ReactNode;
}

/** Empty, error and "no results" all look the same here on purpose. */
export function StateMessage({ title, body, action }: StateMessageProps): JSX.Element {
  return (
    <Box
      sx={{
        border: `1px dashed ${ink.rule}`,
        borderRadius: 2,
        px: 4,
        py: 6,
        textAlign: 'center',
        backgroundColor: ink.surface,
      }}
    >
      <Typography variant="h3" component="p" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: ink.secondary, maxWidth: '46ch', mx: 'auto' }}>
        {body}
      </Typography>
      {action ? <Box sx={{ mt: 3 }}>{action}</Box> : null}
    </Box>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }): JSX.Element {
  return (
    <StateMessage
      title="That did not load"
      body={message}
      action={
        onRetry ? (
          <Button variant="outlined" onClick={onRetry}>
            Try again
          </Button>
        ) : undefined
      }
    />
  );
}
