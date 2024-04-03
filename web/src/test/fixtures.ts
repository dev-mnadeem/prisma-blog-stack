import { Post, PostPage } from '../types/post';

export const samplePosts: Post[] = [
  {
    id: '6f603f74-0a32-4176-848b-94d2969014f1',
    title: 'Why we stopped fetching authors in a loop',
    content: 'One query per row is a join you have not written yet.\n\nSo we wrote the join.',
    excerpt: 'One query per row is a join you have not written yet.',
    readingMinutes: 3,
    createdAt: '2024-04-01T09:00:00.000Z',
    updatedAt: '2024-04-01T09:00:00.000Z',
    author: { id: 'author-1', name: 'John Doe' },
  },
  {
    id: '8bfce472-ad3e-431b-8f9c-8807a1e127e5',
    title: 'Pagination is a contract, not a parameter',
    content: 'An endpoint that returns every row is a promise you cannot keep.',
    excerpt: 'An endpoint that returns every row is a promise you cannot keep.',
    readingMinutes: 2,
    createdAt: '2024-03-28T09:00:00.000Z',
    updatedAt: '2024-03-28T09:00:00.000Z',
    author: { id: 'author-2', name: 'Priya Raman' },
  },
];

export function samplePage(items: Post[] = samplePosts, overrides: Partial<PostPage> = {}): PostPage {
  return {
    items,
    page: 1,
    pageSize: 6,
    total: items.length,
    totalPages: items.length === 0 ? 0 : 1,
    ...overrides,
  };
}
