import { createApp } from './app/app.js';

const port = Number(process.env.PORT ?? 3000);

createApp().listen(port, () => {
  console.log(`Ausgaben-Rechner läuft auf http://localhost:${port}`);
});
