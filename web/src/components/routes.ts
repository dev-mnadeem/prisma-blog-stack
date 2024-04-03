export const routes = {
  home: '/',
  post: (id = ':id') => `/posts/${id}`,
  newPost: '/posts/new',
  editPost: (id = ':id') => `/posts/${id}/edit`,
  signin: '/signin',
  signup: '/signup',
} as const;
