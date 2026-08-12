import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './src/backend/routes/auth.routes';
import { incidentsRouter } from './src/backend/routes/incidents.routes';
import { predictiveRouter } from './src/backend/routes/predictive.routes';
import { knowledgeGraphRouter } from './src/backend/routes/knowledgeGraph.routes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser Middleware
  app.use(express.json());

  // Health Check Endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'OK',
      service: 'AI-SCOS Authentication & Governance Kernel',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount Auth, Incidents, Predictive Intelligence & Knowledge Graph API Routes
  app.use('/api', authRouter);
  app.use('/api', incidentsRouter);
  app.use('/api', predictiveRouter);
  app.use('/api', knowledgeGraphRouter);

  // Development vs Production Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI-SCOS Kernel] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[AI-SCOS Kernel] Failed to start server:', err);
  process.exit(1);
});
