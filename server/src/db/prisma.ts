import { Prisma, PrismaClient } from '@prisma/client';

/**
 * One client for the whole process. Prisma opens a connection pool per client,
 * so constructing one per module (as controllers used to) multiplies pools.
 */
export const prisma = new PrismaClient();

export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}

export async function ping(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}

/** P2002: a unique constraint fired. P2025: the row an update targeted no longer exists. */
export function isPrismaError(error: unknown, code: 'P2002' | 'P2025'): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}
