import { Prisma, User } from '@prisma/client';
import { prisma } from '../db/prisma';

export type NewUser = Prisma.UserCreateInput;

export const userRepository = {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: NewUser): Promise<User> {
    return prisma.user.create({ data });
  },
};
