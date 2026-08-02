import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import reserveHandler from './api/reserve.js';
import contactHandler from './api/contact.js';
import healthHandler from './api/health.js';
import sitemapHandler from './api/sitemap.js';
import robotsHandler from './api/robots.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// API Endpoints delegated to Vercel Serverless Handlers
app.all('/api/health', (req, res) => healthHandler(req as any, res as any));
app.all('/api/reserve', (req, res) => reserveHandler(req as any, res as any));
app.all('/api/contact', (req, res) => contactHandler(req as any, res as any));
app.all('/sitemap.xml', (req, res) => sitemapHandler(req as any, res as any));
app.all('/robots.txt', (req, res) => robotsHandler(req as any, res as any));

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Bastanzi Beef Co.] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

