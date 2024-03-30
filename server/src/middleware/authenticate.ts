import { NextFunction, Response } from 'express';
import { UnauthorizedError } from '../http/errors';
import { verifyToken } from '../services/authService';
import { AuthenticatedRequest } from '../types/request';

const BEARER_PREFIX = 'Bearer ';

/**
 * Accepts the `authtoken` header the web client sends and the standard
 * `Authorization: Bearer` form, so the API is usable from curl without
 * learning a bespoke header.
 */
function readToken(req: AuthenticatedRequest): string | undefined {
  const authorization = req.headers.authorization;
  if (authorization?.startsWith(BEARER_PREFIX)) {
    return authorization.slice(BEARER_PREFIX.length).trim();
  }
  const custom = req.headers.authtoken;
  if (typeof custom === 'string' && custom.trim().length > 0) {
    return custom.trim();
  }
  return undefined;
}

export function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const token = readToken(req);
  if (!token) {
    throw new UnauthorizedError();
  }
  req.userId = verifyToken(token);
  next();
}

export function requireUserId(req: AuthenticatedRequest): string {
  if (!req.userId) {
    throw new UnauthorizedError();
  }
  return req.userId;
}
