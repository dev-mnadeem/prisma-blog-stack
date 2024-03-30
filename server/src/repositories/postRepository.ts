import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

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

function buildWhere({ search, authorId }: PostListQuery): Prisma.PostWhereInput {
  const where: Prisma.PostWhereInput = {};
  if (authorId) {
    where.authorId = authorId;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
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

  update(id: string, data: Prisma.PostUpdateInput): Promise<PostWithAuthor> {
    return prisma.post.update({ where: { id }, data, include: withAuthor });
  },

  async delete(id: string): Promise<void> {
    await prisma.post.delete({ where: { id } });
  },
};
