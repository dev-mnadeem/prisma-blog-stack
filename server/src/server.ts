import { createApp } from './app';
import { config } from './config';
import { disconnect } from './db/prisma';

const app = createApp();
const server = app.listen(config.port, () => {
  console.info(`API listening on http://localhost:${config.port}/api (env: ${config.env})`);
});

async function shutdown(signal: string): Promise<void> {
  console.info(`${signal} received, closing server`);
  server.close(() => {
    void disconnect().then(() => process.exit(0));
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
