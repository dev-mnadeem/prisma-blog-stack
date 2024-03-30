import { Request, Response } from 'express';
import { ping } from '../db/prisma';
import { sendData } from '../http/respond';
import { STATUS } from '../http/statusCodes';

export function createHealthController(summaryProviderName: string) {
  return {
    /** Touches the database so a green check means more than "node is alive". */
    async check(_req: Request, res: Response): Promise<void> {
      try {
        await ping();
      } catch {
        res.status(STATUS.serverError).json({
          payload: { status: 'degraded', database: 'unreachable', summaryProvider: summaryProviderName },
        });
        return;
      }
      sendData(res, {
        status: 'ok',
        database: 'reachable',
        summaryProvider: summaryProviderName,
        uptimeSeconds: Math.round(process.uptime()),
      });
    },
  };
}
