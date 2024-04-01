import { Express } from 'express';
import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/db/prisma';

export const app: Express = createApp();

export interface TestAccount {
  email: string;
  password: string;
  name: string;
  token: string;
}

let counter = 0;

/** Registers a throwaway account and returns a usable token for it. */
export async function createAccount(name = 'Test Author'): Promise<TestAccount> {
  counter += 1;
  const email = `test-${Date.now()}-${counter}@example.com`;
  const password = 'correct horse battery';

  await request(app).post('/api/auth/signup').send({ name, email, password }).expect(201);
  const login = await request(app).post('/api/auth/login').send({ email, password }).expect(200);

  return { email, password, name, token: login.body.payload.authtoken };
}

export function createPost(token: string, title: string, content: string) {
  return request(app).post('/api/posts').set('authtoken', token).send({ title, content });
}

export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}
