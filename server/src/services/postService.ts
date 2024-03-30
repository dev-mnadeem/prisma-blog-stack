import { config } from '../config';
import { createSummaryProvider, SummaryProvider } from '../ai';
import { readingMinutes } from '../domain/reading';
import { ForbiddenError, NotFoundError } from '../http/errors';
import { PostWithAuthor, postRepository } from '../repositories/postRepository';
import { Page, toPage } from '../types/pagination';

export interface PostView {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  readingMinutes: number;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string };
}

export interface ListPostsInput {
  search?: string;
  authorId?: string;
  page?: number;
  pageSize?: number;
}

export interface WritePostInput {
  title: string;
  content: string;
}

function toView(post: PostWithAuthor): PostView {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    readingMinutes: post.readingMinutes,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: { id: post.author.id, name: post.author.name },
  };
}

function clampPage(value: number | undefined): number {
  return value && value > 0 ? Math.floor(value) : 1;
}

function clampPageSize(value: number | undefined): number {
  if (!value || value < 1) {
    return config.defaultPageSize;
  }
  return Math.min(Math.floor(value), config.maxPageSize);
}

export function createPostService(summaryProvider: SummaryProvider = createSummaryProvider(config)) {
  async function derive(input: WritePostInput): Promise<{ excerpt: string; readingMinutes: number }> {
    const excerpt = await summaryProvider.summarise({
      title: input.title,
      content: input.content,
      maxChars: config.excerptMaxChars,
    });
    return { excerpt, readingMinutes: readingMinutes(input.content, config.wordsReadPerMinute) };
  }

  async function loadOwned(id: string, userId: string): Promise<PostWithAuthor> {
    const post = await postRepository.findById(id);
    if (!post) {
      throw new NotFoundError('Post not found');
    }
    if (post.authorId !== userId) {
      throw new ForbiddenError();
    }
    return post;
  }

  return {
    summaryProviderName: summaryProvider.name,

    async list(input: ListPostsInput): Promise<Page<PostView>> {
      const page = clampPage(input.page);
      const pageSize = clampPageSize(input.pageSize);
      const { items, total } = await postRepository.list({
        search: input.search,
        authorId: input.authorId,
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      return toPage(items.map(toView), total, page, pageSize);
    },

    async get(id: string): Promise<PostView> {
      const post = await postRepository.findById(id);
      if (!post) {
        throw new NotFoundError('Post not found');
      }
      return toView(post);
    },

    async create(authorId: string, input: WritePostInput): Promise<PostView> {
      const derived = await derive(input);
      const post = await postRepository.create({
        title: input.title,
        content: input.content,
        authorId,
        ...derived,
      });
      return toView(post);
    },

    async update(id: string, userId: string, input: WritePostInput): Promise<PostView> {
      await loadOwned(id, userId);
      const derived = await derive(input);
      const post = await postRepository.update(id, {
        title: input.title,
        content: input.content,
        ...derived,
      });
      return toView(post);
    },

    async remove(id: string, userId: string): Promise<void> {
      await loadOwned(id, userId);
      await postRepository.delete(id);
    },
  };
}

export type PostService = ReturnType<typeof createPostService>;
