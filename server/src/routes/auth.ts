import { Router } from 'express';
import { authController } from '../controllers/authController';
import { asyncHandler } from '../http/asyncHandler';
import { authenticate } from '../middleware/authenticate';

export function authRoutes(): Router {
  const router = Router();
  router.post('/signup', asyncHandler(authController.signup));
  router.post('/login', asyncHandler(authController.login));
  router.get('/me', authenticate, asyncHandler(authController.me));
  return router;
}
