import { api } from './client';
import { Account, Credentials, Registration } from '../types/auth';

interface Envelope<T> {
  payload: T;
}

export async function login(credentials: Credentials): Promise<string> {
  const response = await api.post<Envelope<{ authtoken: string }>>('/auth/login', credentials);
  return response.data.payload.authtoken;
}

export async function register(registration: Registration): Promise<Account> {
  const response = await api.post<Envelope<Account>>('/auth/signup', registration);
  return response.data.payload;
}

export async function fetchAccount(): Promise<Account> {
  const response = await api.get<Envelope<Account>>('/auth/me');
  return response.data.payload;
}
