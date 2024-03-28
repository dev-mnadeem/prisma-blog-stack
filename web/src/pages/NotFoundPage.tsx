import { Button } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import { Layout } from '../components/Layout';
import { routes } from '../components/routes';
import { StateMessage } from '../components/StateMessage';
import type { JSX } from 'react';

export function NotFoundPage(): JSX.Element {
  return (
    <Layout maxWidth="md">
      <StateMessage
        title="No page here"
        body="The link may be old, or the post may have been deleted."
        action={
          <Button component={RouterLink} to={routes.home} variant="contained">
            Back to all posts
          </Button>
        }
      />
    </Layout>
  );
}
