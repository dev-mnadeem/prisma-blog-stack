import { Router } from 'express';
import { PostsController } from '../controllers/postsController';
import { authenticate } from '../middleware/authenticate';

/**
 * Reading is public — a blog nobody can read is not a blog. Writing, editing
 * and deleting require a token, and ownership is checked in the service.
 */
export function postRoutes(controller: PostsController): Router {
  const router = Router();
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', authenticate, controller.create);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.remove);
  return router;
}
