import { config as loadEnv } from 'dotenv';
import { createApp } from './app';

loadEnv({ quiet: true });

const PORT = Number(process.env.PORT ?? 4000);

createApp().listen(PORT, () => {
  console.log(`knowHer API listening on http://localhost:${PORT}`);
});
