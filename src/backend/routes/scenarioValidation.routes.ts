// =========================================================================
// SCOS PHASE 9C — SCENARIO VALIDATION & MODEL CALIBRATION API ROUTES
// Research Validation & Calibration Endpoints for Urban Digital Twin
// =========================================================================

import { Router, Response } from 'express';
import { PermissionType } from '../../types/auth';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { scenarioValidationService } from '../../services/scenarioValidationService';
import { scenarioCalibrationService } from '../../services/scenarioCalibrationService';
import { dbStore } from '../db/store';
import { runScenarioValidationTestSuite } from '../../tests/scenarioValidation.spec';

export const scenarioValidationRouter = Router();

/**
 * GET /api/scenario-validation/cases
 * Retrieves the registry of all controlled research validation cases (VC-01 to VC-07)
 */
scenarioValidationRouter.get(
  '/scenario-validation/cases',
  authenticateToken,
  requirePermission(PermissionType.SCENARIO_VALIDATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const cases = scenarioValidationService.getValidationCases();
      res.json({
        status: 'SUCCESS',
        data: cases,
        meta: {
          totalCases: cases.length,
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
          disclaimer: 'Validation cases assess internal model consistency; they do not establish real-world municipal predictive accuracy.',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'VALIDATION_CASES_FAILED',
        message: error.message || 'Failed to retrieve scenario validation cases',
      });
    }
  }
);

/**
 * GET /api/scenario-validation/cases/:id
 * Retrieves a specific validation case specification
 */
scenarioValidationRouter.get(
  '/scenario-validation/cases/:id',
  authenticateToken,
  requirePermission(PermissionType.SCENARIO_VALIDATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const caseId = req.params.id;
      const valCase = scenarioValidationService.getValidationCase(caseId);

      if (!valCase) {
        return res.status(404).json({
          error: 'VALIDATION_CASE_NOT_FOUND',
          message: `Validation case ${caseId} does not exist in registry`,
        });
      }

      res.json({
        status: 'SUCCESS',
        data: valCase,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'VALIDATION_CASE_LOOKUP_FAILED',
        message: error.message || 'Failed to retrieve validation case',
      });
    }
  }
);

/**
 * POST /api/scenario-validation/run
 * Executes a controlled validation case and evaluates all 7 research criteria
 */
scenarioValidationRouter.post(
  '/scenario-validation/run',
  authenticateToken,
  requirePermission(PermissionType.SCENARIO_VALIDATION_EXECUTE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { caseId, overrides } = req.body || {};
      if (!caseId) {
        return res.status(400).json({
          error: 'MISSING_CASE_ID',
          message: 'caseId (e.g. "VC-01", "VC-02", "VC-04") is required',
        });
      }

      const userEmail = req.user?.email || 'officer@scos.kanpur.gov.in';
      const output = scenarioValidationService.runValidationCase(caseId, overrides, userEmail);

      // Audit Log Record
      dbStore.addAuditLog({
        actorId: req.user?.id || 'system',
        actorEmail: userEmail,
        actorRole: req.user?.role || ('SUPER_ADMIN' as any),
        action: 'SCENARIO_VALIDATION_RUN',
        resource: `scenario_validation:${caseId}`,
        districtId: req.user?.districtId || 'dist-kanpur',
        status: 'SUCCESS',
        details: {
          caseId,
          overallStatus: output.validationResult.overallStatus,
          reproducibilityHash: output.validationResult.reproducibilityHash,
          cascadeStepsCount: output.simulationResult.cascadeSteps.length,
          departmentsCount: output.simulationResult.affectedDepartments.length,
        },
      });

      res.json({
        status: 'SUCCESS',
        data: output,
        meta: {
          classification: 'SIMULATED / PROTOTYPE DATA',
          notice: 'Validation results assess internal model consistency and prototype behaviour; they do not establish real-world predictive accuracy.',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'VALIDATION_RUN_FAILED',
        message: error.message || 'Failed to execute validation case',
      });
    }
  }
);

/**
 * POST /api/scenario-validation/compare
 * Compares a validation scenario against Baseline (VC-01)
 */
scenarioValidationRouter.post(
  '/scenario-validation/compare',
  authenticateToken,
  requirePermission(PermissionType.SCENARIO_VALIDATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { caseId } = req.body || {};
      if (!caseId) {
        return res.status(400).json({
          error: 'MISSING_CASE_ID',
          message: 'caseId is required for baseline comparison',
        });
      }

      const comparison = scenarioValidationService.compareScenarioWithBaseline(caseId);
      res.json({
        status: 'SUCCESS',
        data: comparison,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'COMPARISON_FAILED',
        message: error.message || 'Failed to generate baseline comparison',
      });
    }
  }
);

/**
 * GET /api/scenario-validation/report/:id
 * Generates a full structured validation and calibration report
 */
scenarioValidationRouter.get(
  '/scenario-validation/report/:id',
  authenticateToken,
  requirePermission(PermissionType.SCENARIO_VALIDATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const caseId = req.params.id;
      const report = scenarioValidationService.generateValidationReport(caseId);

      res.json({
        status: 'SUCCESS',
        data: report,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'REPORT_GENERATION_FAILED',
        message: error.message || 'Failed to generate validation report',
      });
    }
  }
);

/**
 * GET /api/scenario-validation/parameters
 * Retrieves controlled calibration parameters and engineering assumptions
 */
scenarioValidationRouter.get(
  '/scenario-validation/parameters',
  authenticateToken,
  requirePermission(PermissionType.SCENARIO_VALIDATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const parameters = scenarioCalibrationService.getAllParameters();
      const assumptions = scenarioCalibrationService.getAllAssumptions();

      res.json({
        status: 'SUCCESS',
        data: {
          parameters,
          assumptions,
        },
        meta: {
          disclaimer: 'Prototype modelling parameters — not real-time municipal measurements.',
          classification: 'SIMULATED / PROTOTYPE',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'PARAMETERS_LOOKUP_FAILED',
        message: error.message || 'Failed to retrieve calibration parameters',
      });
    }
  }
);

/**
 * POST /api/scenario-validation/test-suite
 * Executes the entire automated Phase 9C validation test suite
 */
scenarioValidationRouter.post(
  '/scenario-validation/test-suite',
  authenticateToken,
  requirePermission(PermissionType.SCENARIO_VALIDATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const testResults = runScenarioValidationTestSuite();

      // Audit Log Record
      dbStore.addAuditLog({
        actorId: req.user?.id || 'system',
        actorEmail: req.user?.email || 'officer@scos.kanpur.gov.in',
        actorRole: req.user?.role || ('SUPER_ADMIN' as any),
        action: 'SCENARIO_VALIDATION_TEST_SUITE',
        resource: 'scenario_validation:test_suite',
        districtId: req.user?.districtId || 'dist-kanpur',
        status: testResults.success ? 'SUCCESS' : 'FAILURE',
        details: {
          totalTests: testResults.totalTests,
          passedCount: testResults.passedCount,
          failedCount: testResults.failedCount,
        },
      });

      res.json(testResults);
    } catch (error: any) {
      res.status(500).json({
        error: 'TEST_SUITE_EXECUTION_FAILED',
        message: error.message || 'Failed to execute Scenario Validation test suite',
      });
    }
  }
);
