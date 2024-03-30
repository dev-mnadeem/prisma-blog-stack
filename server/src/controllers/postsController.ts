import { Request, Response } from 'express';
import { BadRequestError } from '../http/errors';
import { sendData } from '../http/respond';
import { STATUS } from '../http/statusCodes';
import { requireUserId } from '../middleware/authenticate';
import { PostService } from '../services/postService';
import { AuthenticatedRequest } from '../types/request';
import { listPostsSchema, writePostSchema } from '../validation/schemas';

function postId(req: Request): string {
  const id = req.params.id;
  if (!id) {
    throw new BadRequestError('A post id is required');
  }
  return id;
}

/** Controllers stay thin: validate, delegate, envelope. */
export function createPostsController(posts: PostService) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      const query = await listPostsSchema.validate(req.query, { abortEarly: false });
      sendData(
        res,
        await posts.list({
          search: query.search,
          authorId: query.author,
          page: query.page,
          pageSize: query.pageSize,
        })
      );
    },

    async get(req: Request, res: Response): Promise<void> {
      sendData(res, await posts.get(postId(req)));
    },

    async create(req: AuthenticatedRequest, res: Response): Promise<void> {
      const input = await writePostSchema.validate(req.body, { abortEarly: false });
      sendData(res, await posts.create(requireUserId(req), input), STATUS.created);
    },

    async update(req: AuthenticatedRequest, res: Response): Promise<void> {
      const input = await writePostSchema.validate(req.body, { abortEarly: false });
      sendData(res, await posts.update(postId(req), requireUserId(req), input));
    },

    async remove(req: AuthenticatedRequest, res: Response): Promise<void> {
      await posts.remove(postId(req), requireUserId(req));
      res.status(STATUS.noContent).send();
    },
  };
}

export type PostsController = ReturnType<typeof createPostsController>;
