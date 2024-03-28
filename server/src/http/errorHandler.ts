import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'yup';
import { HttpError } from './errors';
import { sendError } from './respond';
import { STATUS } from './statusCodes';

const GENERIC_MESSAGE = 'Something went wrong';

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `No route for ${req.method} ${req.originalUrl}`, STATUS.notFound);
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ValidationError) {
    sendError(res, error.errors.join(', ') || error.message, STATUS.badRequest);
    return;
  }

  if (error instanceof HttpError) {
    sendError(res, error.message, error.status);
    return;
  }

  console.error('[error]', error);
  sendError(res, GENERIC_MESSAGE, STATUS.serverError);
}
