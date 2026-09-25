import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express, { Request, Response } from 'express';
import { createExpressApp } from './server/app.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const app = createExpressApp();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Setup Vite (dev) or Static File Serving (prod)
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MawwwHub] Server running on http://0.0.0.0:${PORT}`);
  });
}

main().catch(err => {
  console.error("Fatal server error:", err);
  process.exit(1);
});
