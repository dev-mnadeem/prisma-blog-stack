import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'yup';
import { HttpError } from './errors';
import { sendError } from './respond';
import { STATUS } from './statusCodes';

const GENERIC_MESSAGE = 'Something went wrong';

/**
 * express.json() rejects bad bodies with an http-errors object (`expose: true`)
 * before any route runs. Without this, a typo in a JSON body surfaced as a 500.
 */
const BODY_PARSER_MESSAGES: Record<string, string> = {
  'entity.parse.failed': 'Request body is not valid JSON',
  'entity.too.large': 'Request body is too large',
};

interface BodyParserError {
  status: number;
  type: string;
  expose: true;
}

function isBodyParserError(error: unknown): error is BodyParserError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as Partial<BodyParserError>).expose === true &&
    typeof (error as Partial<BodyParserError>).status === 'number' &&
    typeof (error as Partial<BodyParserError>).type === 'string'
  );
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `No route for ${req.method} ${req.originalUrl}`, STATUS.notFound);
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ValidationError) {
    sendError(res, error.errors.join(', ') || error.message, STATUS.badRequest);
    return;
  }

  if (isBodyParserError(error)) {
    sendError(res, BODY_PARSER_MESSAGES[error.type] ?? 'Invalid request body', error.status);
    return;
  }

  if (error instanceof HttpError) {
    sendError(res, error.message, error.status);
    return;
  }

  console.error('[error]', error);
  sendError(res, GENERIC_MESSAGE, STATUS.serverError);
}
