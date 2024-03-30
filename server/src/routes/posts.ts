import { Router } from 'express';
import { PostsController } from '../controllers/postsController';
import { asyncHandler } from '../http/asyncHandler';
import { authenticate } from '../middleware/authenticate';

/**
 * Reading is public — a blog nobody can read is not a blog. Writing, editing
 * and deleting require a token, and ownership is checked in the service.
 */
export function postRoutes(controller: PostsController): Router {
  const router = Router();
  router.get('/', asyncHandler(controller.list));
  router.get('/:id', asyncHandler(controller.get));
  router.post('/', authenticate, asyncHandler(controller.create));
  router.put('/:id', authenticate, asyncHandler(controller.update));
  router.delete('/:id', authenticate, asyncHandler(controller.remove));
  return router;
}
