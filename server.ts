import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './src/backend/routes/auth.routes';
import { incidentsRouter } from './src/backend/routes/incidents.routes';
import { predictiveRouter } from './src/backend/routes/predictive.routes';
import { knowledgeGraphRouter } from './src/backend/routes/knowledgeGraph.routes';
import { evaluationRouter } from './src/backend/routes/evaluation.routes';
import { dataSourceRouter } from './src/backend/routes/dataSource.routes';
import { dataValidationRouter } from './src/backend/routes/dataValidation.routes';
import { infrastructureRouter } from './src/backend/routes/infrastructure.routes';
import { departmentCoordinationRouter } from './src/backend/routes/departmentCoordination.routes';
import { operationalMonitoringRouter } from './src/backend/routes/operationalMonitoring.routes';
import { operationalDecisionSupportRouter } from './src/backend/routes/operationalDecisionSupport.routes';
import { urbanDigitalTwinRouter } from './src/backend/routes/urbanDigitalTwin.routes';
import { scenarioValidationRouter } from './src/backend/routes/scenarioValidation.routes';
import { comparativeEvaluationRouter } from './src/backend/routes/comparativeEvaluation.routes';
import { researchDatasetRouter } from './src/backend/routes/researchDataset.routes';
import { experimentalExecutionRouter } from './src/backend/routes/experimentalExecution.routes';
import { statisticalAnalysisRouter } from './src/backend/routes/statisticalAnalysis.routes';
import { researchEvidenceRouter } from './src/backend/routes/researchEvidence.routes';
import { researchFrameworkRouter } from './src/backend/routes/researchFramework.routes';
import { sensitivityAnalysisRouter } from './src/backend/routes/sensitivityAnalysis.routes';
import { researchValidationRouter } from './src/backend/routes/researchValidation.routes';
import { researchClaimsRouter } from './src/backend/routes/researchClaims.routes';
import { thesisEvidenceRouter } from './src/backend/routes/thesisEvidence.routes';
import researchDemonstrationRouter from './src/backend/routes/researchDemonstration.routes';

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

  // Mount Auth, Incidents, Predictive Intelligence, Knowledge Graph, Evaluation & Data Sources API Routes
  app.use('/api', authRouter);
  app.use('/api', incidentsRouter);
  app.use('/api', predictiveRouter);
  app.use('/api', knowledgeGraphRouter);
  app.use('/api', evaluationRouter);
  app.use('/api', dataSourceRouter);
  app.use('/api', dataValidationRouter);
  app.use('/api', infrastructureRouter);
  app.use('/api', departmentCoordinationRouter);
  app.use('/api', operationalMonitoringRouter);
  app.use('/api', operationalDecisionSupportRouter);
  app.use('/api', urbanDigitalTwinRouter);
  app.use('/api', scenarioValidationRouter);
  app.use('/api', comparativeEvaluationRouter);
  app.use('/api', researchDatasetRouter);
  app.use('/api', experimentalExecutionRouter);
  app.use('/api', statisticalAnalysisRouter);
  app.use('/api', researchEvidenceRouter);
  app.use('/api', researchFrameworkRouter);
  app.use('/api', sensitivityAnalysisRouter);
  app.use('/api', researchValidationRouter);
  app.use('/api', researchClaimsRouter);
  app.use('/api', thesisEvidenceRouter);
  app.use('/api/research-demonstration', researchDemonstrationRouter);

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
