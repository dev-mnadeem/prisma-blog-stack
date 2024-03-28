import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { apiErrorMessage, isUnauthorized } from '../client';

function axiosErrorWithStatus(status: number, data: unknown): AxiosError {
  const error = new AxiosError('Request failed');
  error.response = {
    status,
    statusText: '',
    data,
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe('apiErrorMessage', () => {
  it('prefers the message the API sent', () => {
    expect(
      apiErrorMessage(axiosErrorWithStatus(403, { message: 'You can only change your own posts' }))
    ).toBe('You can only change your own posts');
  });

  it('explains a request that never reached the API', () => {
    expect(apiErrorMessage(new AxiosError('Network Error'))).toBe(
      'Cannot reach the API. Is the server running?'
    );
  });

  it('falls back for anything that is not an axios error', () => {
    expect(apiErrorMessage(new Error('boom'), 'Could not load posts')).toBe('Could not load posts');
  });
});

describe('isUnauthorized', () => {
  it('is true only for a 401', () => {
    expect(isUnauthorized(axiosErrorWithStatus(401, {}))).toBe(true);
    expect(isUnauthorized(axiosErrorWithStatus(403, {}))).toBe(false);
    expect(isUnauthorized(new Error('boom'))).toBe(false);
  });
});
