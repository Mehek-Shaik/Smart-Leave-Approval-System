import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/apiRoutes.js';
import { openApiSpec } from './server/openapi.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'UP',
      service: 'Smart Leave Approval System',
      timestamp: new Date().toISOString(),
    });
  });

  // OpenAPI JSON documentation endpoint
  app.get(['/api/openapi.json', '/api/api-docs', '/api-docs'], (req, res) => {
    res.json(openApiSpec);
  });

  // Mount API router under both /api and root paths to satisfy all client conventions
  app.use('/api', apiRouter);
  app.use(apiRouter);

  // Vite middleware for development / static serving in production
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
    console.log(`Smart Leave Approval System server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
});
