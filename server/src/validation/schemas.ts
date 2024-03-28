import { InferType, number, object, string } from 'yup';

const MIN_NAME = 3;
const MIN_PASSWORD = 8;
const MIN_TITLE = 3;
const MIN_CONTENT = 10;

export const registrationSchema = object({
  name: string().trim().required('Name is required').min(MIN_NAME),
  email: string().trim().lowercase().email('Please enter a valid email').required('Email is required'),
  password: string().required('Password is required').min(MIN_PASSWORD),
});

export const credentialsSchema = object({
  email: string().trim().lowercase().email('Please enter a valid email').required('Email is required'),
  password: string().required('Password is required'),
});

export const writePostSchema = object({
  title: string().trim().required('Title is required').min(MIN_TITLE),
  content: string().trim().required('Content is required').min(MIN_CONTENT),
});

export const listPostsSchema = object({
  search: string().trim().optional(),
  author: string().trim().optional(),
  page: number().integer().min(1).optional(),
  pageSize: number().integer().min(1).optional(),
});

export type RegistrationInput = InferType<typeof registrationSchema>;
export type CredentialsInput = InferType<typeof credentialsSchema>;
export type WritePostInput = InferType<typeof writePostSchema>;
export type ListPostsInput = InferType<typeof listPostsSchema>;
