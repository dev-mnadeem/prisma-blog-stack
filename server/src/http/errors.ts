import { STATUS } from './statusCodes';

/** Anything thrown with this shape is a deliberate answer, not a crash. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Invalid request') {
    super(STATUS.badRequest, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized user') {
    super(STATUS.unauthorized, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'You can only change your own posts') {
    super(STATUS.forbidden, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(STATUS.notFound, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Already exists') {
    super(STATUS.conflict, message);
  }
}
