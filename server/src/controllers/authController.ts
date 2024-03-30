import { Request, Response } from 'express';
import { sendData } from '../http/respond';
import { STATUS } from '../http/statusCodes';
import { requireUserId } from '../middleware/authenticate';
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../types/request';
import { credentialsSchema, registrationSchema } from '../validation/schemas';

export const authController = {
  async signup(req: Request, res: Response): Promise<void> {
    const input = await registrationSchema.validate(req.body, { abortEarly: false });
    const user = await authService.register(input);
    sendData(res, user, STATUS.created);
  },

  async login(req: Request, res: Response): Promise<void> {
    const input = await credentialsSchema.validate(req.body, { abortEarly: false });
    sendData(res, await authService.login(input));
  },

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    sendData(res, await authService.profile(requireUserId(req)));
  },
};
