import { api } from './client';
import { Post, PostDraft, PostPage } from '../types/post';

export interface PostQuery {
  search?: string;
  author?: string;
  page?: number;
  pageSize?: number;
}

interface Envelope<T> {
  payload: T;
}

export async function fetchPosts(query: PostQuery = {}): Promise<PostPage> {
  const response = await api.get<Envelope<PostPage>>('/posts', { params: query });
  return response.data.payload;
}

export async function fetchPost(id: string): Promise<Post> {
  const response = await api.get<Envelope<Post>>(`/posts/${id}`);
  return response.data.payload;
}

export async function createPost(draft: PostDraft): Promise<Post> {
  const response = await api.post<Envelope<Post>>('/posts', draft);
  return response.data.payload;
}

export async function updatePost(id: string, draft: PostDraft): Promise<Post> {
  const response = await api.put<Envelope<Post>>(`/posts/${id}`, draft);
  return response.data.payload;
}

export async function deletePost(id: string): Promise<void> {
  await api.delete(`/posts/${id}`);
}
