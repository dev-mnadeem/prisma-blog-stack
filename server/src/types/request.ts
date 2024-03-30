import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}
