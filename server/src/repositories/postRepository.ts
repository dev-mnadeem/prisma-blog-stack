import { Prisma } from '@prisma/client';
import { isPrismaError, prisma } from '../db/prisma';

/**
 * Every read pulls the author in the same round trip. Fetching posts and then
 * looking each author up is the N+1 this shape exists to prevent.
 */
const withAuthor = {
  author: { select: { id: true, name: true, email: true } },
} satisfies Prisma.PostInclude;

export type PostWithAuthor = Prisma.PostGetPayload<{ include: typeof withAuthor }>;

export interface PostListQuery {
  search?: string;
  authorId?: string;
  skip: number;
  take: number;
}

/** Prisma's `contains` drops the term into ILIKE as is, so % and _ would act as wildcards. */
function escapeLikePattern(term: string): string {
  return term.replace(/[\\%_]/g, '\\$&');
}

function buildWhere({ search, authorId }: PostListQuery): Prisma.PostWhereInput {
  const where: Prisma.PostWhereInput = {};
  if (authorId) {
    where.authorId = authorId;
  }
  if (search) {
    const pattern = escapeLikePattern(search);
    where.OR = [
      { title: { contains: pattern, mode: 'insensitive' } },
      { content: { contains: pattern, mode: 'insensitive' } },
    ];
  }
  return where;
}

export const postRepository = {
  /**
   * Count and page are issued as one transaction so the total cannot drift
   * from the rows on a busy table.
   */
  async list(query: PostListQuery): Promise<{ items: PostWithAuthor[]; total: number }> {
    const where = buildWhere(query);
    const [items, total] = await prisma.$transaction([
      prisma.post.findMany({
        where,
        include: withAuthor,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      prisma.post.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string): Promise<PostWithAuthor | null> {
    return prisma.post.findUnique({ where: { id }, include: withAuthor });
  },

  create(data: Prisma.PostUncheckedCreateInput): Promise<PostWithAuthor> {
    return prisma.post.create({ data, include: withAuthor });
  },

  /** Null when the post was deleted after the caller's ownership check. */
  async update(id: string, data: Prisma.PostUpdateInput): Promise<PostWithAuthor | null> {
    try {
      return await prisma.post.update({ where: { id }, data, include: withAuthor });
    } catch (error) {
      if (isPrismaError(error, 'P2025')) {
        return null;
      }
      throw error;
    }
  },

  /** False when there was nothing left to delete. */
  async delete(id: string): Promise<boolean> {
    const { count } = await prisma.post.deleteMany({ where: { id } });
    return count > 0;
  },
};
