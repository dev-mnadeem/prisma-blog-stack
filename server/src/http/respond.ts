import { Response } from 'express';
import { STATUS } from './statusCodes';

export interface ApiEnvelope<T> {
  payload: T;
}

export interface ApiErrorEnvelope {
  payload: Record<string, never>;
  message: string;
}

export function sendData<T>(res: Response, payload: T, status: number = STATUS.ok): void {
  res.status(status).json({ payload } satisfies ApiEnvelope<T>);
}

export function sendError(res: Response, message: string, status: number = STATUS.serverError): void {
  res.status(status).json({ payload: {}, message } satisfies ApiErrorEnvelope);
}
