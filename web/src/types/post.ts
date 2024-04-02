export interface PostAuthor {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  readingMinutes: number;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
}

export interface PostPage {
  items: Post[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PostDraft {
  title: string;
  content: string;
}
