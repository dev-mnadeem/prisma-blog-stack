import { disconnect } from './helpers';

after(async () => {
  await disconnect();
});
