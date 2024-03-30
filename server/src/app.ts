import cors from 'cors';
import express, { Express } from 'express';
import morgan from 'morgan';
import { config } from './config';
import { createPostsController } from './controllers/postsController';
import { errorHandler, notFoundHandler } from './http/errorHandler';
import { apiRouter } from './routes';
import { createPostService, PostService } from './services/postService';

const JSON_BODY_LIMIT = '256kb';

export interface AppDependencies {
  postService?: PostService;
}

/**
 * Builds the app without binding a port, so tests can drive it over supertest
 * and the entry point stays the only thing that listens.
 */
export function createApp({ postService }: AppDependencies = {}): Express {
  const posts = postService ?? createPostService();
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: config.corsOrigins }));
  if (config.env !== 'test') {
    app.use(morgan('dev'));
  }
  app.use(express.json({ limit: JSON_BODY_LIMIT }));

  app.use(
    '/api',
    apiRouter({
      posts: createPostsController(posts),
      summaryProviderName: posts.summaryProviderName,
    })
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
