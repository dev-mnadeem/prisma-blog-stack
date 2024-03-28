import { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Express 4 swallows rejected promises from async handlers, which turns a
 * failed query into a hung request. Wrapping forwards them to the error
 * middleware instead.
 */
export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
