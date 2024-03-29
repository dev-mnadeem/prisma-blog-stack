import { PrismaClient } from '@prisma/client';

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
