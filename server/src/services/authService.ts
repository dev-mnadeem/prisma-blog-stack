import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { isPrismaError } from '../db/prisma';
import { ConflictError, UnauthorizedError } from '../http/errors';
import { userRepository } from '../repositories/userRepository';
import { AuthenticatedUser } from '../types/request';

const TOKEN_ALGORITHM = 'HS256';

interface TokenPayload {
  user: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface Registration extends Credentials {
  name: string;
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, config.bcryptRounds);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function signToken(userId: string): string {
  return jwt.sign({ user: userId } satisfies TokenPayload, config.jwtSecret, {
    algorithm: TOKEN_ALGORITHM,
    expiresIn: config.jwtTtlSeconds,
  });
}

export function verifyToken(token: string): string {
  try {
    const decoded = jwt.verify(token, config.jwtSecret, { algorithms: [TOKEN_ALGORITHM] }) as TokenPayload;
    if (!decoded?.user) {
      throw new UnauthorizedError();
    }
    return decoded.user;
  } catch {
    throw new UnauthorizedError();
  }
}

export const authService = {
  async register({ name, email, password }: Registration): Promise<AuthenticatedUser> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('User already exists');
    }
    try {
      const user = await userRepository.create({ name, email, password: hashPassword(password) });
      return { id: user.id, name: user.name, email: user.email };
    } catch (error) {
      // Two sign-ups for one email can both pass the lookup above; the unique index decides.
      if (isPrismaError(error, 'P2002')) {
        throw new ConflictError('User already exists');
      }
      throw error;
    }
  },

  /**
   * One message for "no such account" and "wrong password" on purpose: a
   * different answer for each turns the login form into an account oracle.
   */
  async login({ email, password }: Credentials): Promise<{ authtoken: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user || !verifyPassword(password, user.password)) {
      throw new UnauthorizedError('Invalid email/password');
    }
    return { authtoken: signToken(user.id) };
  },

  async profile(userId: string): Promise<AuthenticatedUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError();
    }
    return { id: user.id, name: user.name, email: user.email };
  },
};
