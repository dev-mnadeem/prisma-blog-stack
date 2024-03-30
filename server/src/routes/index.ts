import { Router } from 'express';
import { createHealthController } from '../controllers/healthController';
import { PostsController } from '../controllers/postsController';
import { asyncHandler } from '../http/asyncHandler';
import { authRoutes } from './auth';
import { postRoutes } from './posts';

export interface RouterDependencies {
  posts: PostsController;
  summaryProviderName: string;
}

export function apiRouter({ posts, summaryProviderName }: RouterDependencies): Router {
  const router = Router();
  const health = createHealthController(summaryProviderName);

  router.get('/health', asyncHandler(health.check));
  router.use('/auth', authRoutes());
  router.use('/posts', postRoutes(posts));

  return router;
}
