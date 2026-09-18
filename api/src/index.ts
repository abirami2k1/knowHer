import { createApp } from './app';
import { CONFIG } from './config';

createApp().listen(CONFIG.port, () => {
  console.log(`knowHer API listening on http://localhost:${CONFIG.port}`);
});
