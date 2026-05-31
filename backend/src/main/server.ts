import 'dotenv/config';
import { app } from './app';
import '../modules/webhook/infrastructure/queue/webhook.worker';

const port = Number(process.env.PORT) || 3000;
const host = '0.0.0.0';

async function start() {
  try {
    await app.listen({ port, host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
