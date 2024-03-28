import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';

export function authRoutes(): Router {
  const router = Router();
  router.post('/signup', authController.signup);
  router.post('/login', authController.login);
  router.get('/me', authenticate, authController.me);
  return router;
}
