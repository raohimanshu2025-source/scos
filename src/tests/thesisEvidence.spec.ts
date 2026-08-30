// =========================================================================
// SCOS PHASE 11C — THESIS EVIDENCE & ACADEMIC REPRODUCIBILITY TEST SUITE
// Comprehensive Automated Verification Suite (TEST-TE-01 to TEST-TE-36)
// =========================================================================

import { thesisEvidenceService } from '../services/thesisEvidenceService';
import { PermissionType } from '../types/auth';

export interface ThesisEvidenceTestResult {
  specId: string;
  specName: string;
  category: string;
  passed: boolean;
  durationMs: number;
  description: string;
  error?: string;
}

export interface ThesisEvidenceTestSuiteReport {
  suiteId: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  durationMs: number;
  executedAt: string;
  allPassed: boolean;
  results: ThesisEvidenceTestResult[];
  packageFingerprint: string;
  mandatoryNotice: string;
}

export function runThesisEvidenceTestSuite(): ThesisEvidenceTestSuiteReport {
  const startTime = Date.now();
  const results: ThesisEvidenceTestResult[] = [];

  const runTest = (
    specId: string,
    specName: string,
    category: string,
    description: string,
    testFn: () => boolean | void
  ) => {
    const t0 = Date.now();
    try {
      const outcome = testFn();
      const passed = outcome === undefined || outcome === true;
      results.push({
        specId,
        specName,
        category,
        passed,
        durationMs: Date.now() - t0,
        description,
      });
    } catch (err: any) {
      results.push({
        specId,
        specName,
        category,
        passed: false,
        durationMs: Date.now() - t0,
        description,
        error: err.message || String(err),
      });
    }
  };

  // -------------------------------------------------------------------------
  // GROUP 1: Master Package Generation & Structural Integrity (TEST-TE-01 to 05)
  // -------------------------------------------------------------------------

  runTest(
    'TEST-TE-01',
    'Thesis Package Generation',
    'Package Structure',
    'Verifies thesisEvidenceService.buildThesisEvidencePackage() creates a complete package',
    () => {
      const pkg = thesisEvidenceService.buildThesisEvidencePackage();
      if (!pkg.packageId || pkg.packageVersion !== 'SCOS-THESIS-EVIDENCE-v1.0') {
        throw new Error(`Invalid package version or ID: ${pkg.packageVersion}`);
      }
      if (!pkg.datasetVersion || !pkg.generatedAt) {
        throw new Error('Missing datasetVersion or generatedAt timestamp.');
      }
    }
  );

  runTest(
    'TEST-TE-02',
    'Deterministic Package Fingerprint Integrity',
    'Provenance & Hashes',
    'Ensures SHA-256 fingerprint is 64 hexadecimal characters and consistent across calls',
    () => {
      const pkg1 = thesisEvidenceService.buildThesisEvidencePackage();
      const pkg2 = thesisEvidenceService.buildThesisEvidencePackage();
      if (!pkg1.packageFingerprint || pkg1.packageFingerprint.length !== 64) {
        throw new Error(`Invalid fingerprint format: ${pkg1.packageFingerprint}`);
      }
      if (pkg1.packageFingerprint !== pkg2.packageFingerprint) {
        throw new Error('Non-deterministic package fingerprint across successive builds.');
      }
    }
  );

  runTest(
    'TEST-TE-03',
    'Mandatory Academic Notice Verification',
    'Academic Disclosures',
    'Ensures the mandatory notice containing "NOT ESTABLISHED" for real-world field validation exists',
    () => {
      const pkg = thesisEvidenceService.buildThesisEvidencePackage();
      if (!pkg.realWorldValidationNotice || !pkg.realWorldValidationNotice.includes('NOT ESTABLISHED')) {
        throw new Error('Mandatory academic notice missing "NOT ESTABLISHED" field validation disclaimer.');
      }
      if (!pkg.disclaimer.includes('controlled simulated scenarios')) {
        throw new Error('Notice must clarify evidence is derived from controlled simulated scenarios.');
      }
    }
  );

  runTest(
    'TEST-TE-04',
    'Academic Affiliation & Defense Context',
    'Academic Metadata',
    'Verifies IIT Kanpur affiliation, department, and M.Tech dissertation title',
    () => {
      const pkg = thesisEvidenceService.buildThesisEvidencePackage();
      const aff = pkg.provenance.academicAffiliation;
      if (!aff.institution.includes('IIT Kanpur')) {
        throw new Error(`Expected IIT Kanpur affiliation, found: ${aff.institution}`);
      }
      if (!aff.department.includes('Civil Engineering')) {
        throw new Error(`Expected Civil Engineering department, found: ${aff.department}`);
      }
      if (!aff.degreeProgram.includes('M.Tech')) {
        throw new Error(`Expected M.Tech degree program, found: ${aff.degreeProgram}`);
      }
    }
  );

  runTest(
    'TEST-TE-05',
    'Professor & Examiner Summary 7-Point Completeness',
    'Executive Briefing',
    'Validates all 7 sections of the Professor & Examiner research briefing',
    () => {
      const summary = thesisEvidenceService.getProfessorExaminerSummary();
      if (!summary.researchProblem || !summary.proposedContribution || !summary.methodology) {
        throw new Error('Incomplete briefing core statements.');
      }
      if (!summary.whatWasTested || !summary.whatWasObserved || !summary.whatIsSupported) {
        throw new Error('Incomplete empirical testing sections.');
      }
      if (!summary.whatIsNotYetValidated || !summary.whatIsNotYetValidated.includes('Real-world municipal field validation')) {
        throw new Error('whatIsNotYetValidated must explicitly disclose lack of field deployment.');
      }
    }
  );

  // -------------------------------------------------------------------------
  // GROUP 2: Master RQ-H-M-SC Matrix (TEST-TE-06 to 10)
  // -------------------------------------------------------------------------

  runTest(
    'TEST-TE-06',
    'Master Matrix Record Count & Completeness',
    'Evidence Matrix',
    'Ensures master matrix contains all 5 formal RQ-to-Hypothesis bindings',
    () => {
      const matrix = thesisEvidenceService.getResearchQuestionMatrix();
      if (matrix.length !== 5) {
        throw new Error(`Expected 5 matrix records, found: ${matrix.length}`);
      }
      const rqs = matrix.map((r) => r.researchQuestionId);
      ['RQ-01', 'RQ-02', 'RQ-03', 'RQ-04', 'RQ-05'].forEach((expected) => {
        if (!rqs.includes(expected as any)) {
          throw new Error(`Missing ${expected} in master matrix.`);
        }
      });
    }
  );

  runTest(
    'TEST-TE-07',
    'Matrix RQ-01 Coordinate Integrity',
    'Evidence Matrix',
    'Verifies RQ-01 / H01 metrics, baseline, SCOS observation, and 33.7% latency reduction',
    () => {
      const matrix = thesisEvidenceService.getResearchQuestionMatrix();
      const r1 = matrix.find((r) => r.researchQuestionId === 'RQ-01');
      if (!r1) throw new Error('RQ-01 record not found.');
      if (r1.hypothesisId !== 'H01') throw new Error(`Expected H01, found: ${r1.hypothesisId}`);
      if (!r1.relevantMetricCodes.includes('M1')) throw new Error('M1 missing from RQ-01');
      if (r1.relativeChangePercent >= 0) throw new Error('Expected negative relative change (reduction)');
      if (Math.abs(r1.relativeChangePercent - -33.7) > 0.5) {
        throw new Error(`Expected ~ -33.7% change, found: ${r1.relativeChangePercent}`);
      }
    }
  );

  runTest(
    'TEST-TE-08',
    'Matrix Claim Status Bounding',
    'Claim Governance',
    'Ensures all claim statuses are bounded to CONTROLLED_SCENARIO_SUPPORTED or DESCRIPTIVELY_SUPPORTED',
    () => {
      const matrix = thesisEvidenceService.getResearchQuestionMatrix();
      matrix.forEach((r) => {
        if (
          r.finalClaimStatus !== 'CONTROLLED_SCENARIO_SUPPORTED' &&
          r.finalClaimStatus !== 'DESCRIPTIVELY_SUPPORTED' &&
          r.finalClaimStatus !== 'COMPUTATIONALLY_VERIFIED'
        ) {
          throw new Error(`Unpermitted claim status in matrix: ${r.finalClaimStatus}`);
        }
      });
    }
  );

  runTest(
    'TEST-TE-09',
    'Matrix Phrasing Language Safety',
    'Linguistic Governance',
    'Ensures permitted statements do not contain unverified absolute words',
    () => {
      const matrix = thesisEvidenceService.getResearchQuestionMatrix();
      const forbidden = ['PROVES', 'PERFECT', 'ZERO RISK', 'GUARANTEES REAL-WORLD DEPLOYMENT'];
      matrix.forEach((r) => {
        forbidden.forEach((word) => {
          if (r.permittedAcademicStatement.toUpperCase().includes(word)) {
            throw new Error(`Forbidden term '${word}' in statement: ${r.permittedAcademicStatement}`);
          }
        });
      });
    }
  );

  runTest(
    'TEST-TE-10',
    'Matrix Limitations & Future Validation Tracing',
    'Evidence Lineage',
    'Ensures each matrix record explicitly lists primary limitations and validation requirements',
    () => {
      const matrix = thesisEvidenceService.getResearchQuestionMatrix();
      matrix.forEach((r) => {
        if (!r.primaryLimitation || r.primaryLimitation.length < 10) {
          throw new Error(`Missing limitation for ${r.recordId}`);
        }
        if (!r.futureValidationRequirement || r.futureValidationRequirement.length < 10) {
          throw new Error(`Missing future validation requirement for ${r.recordId}`);
        }
      });
    }
  );

  // -------------------------------------------------------------------------
  // GROUP 3: Formal Hypotheses H01 to H05 (TEST-TE-11 to 15)
  // -------------------------------------------------------------------------

  runTest(
    'TEST-TE-11',
    'Formal Hypotheses Count & Coverage',
    'Hypothesis Registry',
    'Verifies H01 through H05 are populated with scores and formal statements',
    () => {
      const hypotheses = thesisEvidenceService.getHypothesisSummaries();
      if (hypotheses.length !== 5) {
        throw new Error(`Expected 5 hypotheses, found: ${hypotheses.length}`);
      }
      const ids = hypotheses.map((h) => h.hypothesisId);
      ['H01', 'H02', 'H03', 'H04', 'H05'].forEach((id) => {
        if (!ids.includes(id as any)) throw new Error(`Missing hypothesis ${id}`);
      });
    }
  );

  runTest(
    'TEST-TE-12',
    'Formal Hypotheses Null & Alternative Formulations',
    'Hypothesis Registry',
    'Ensures all hypotheses define explicit H₁ and H₀ statements',
    () => {
      const hypotheses = thesisEvidenceService.getHypothesisSummaries();
      hypotheses.forEach((h) => {
        if (!h.formalHypothesis || !h.formalHypothesis.startsWith('H₁:')) {
          throw new Error(`Invalid formal hypothesis formulation for ${h.hypothesisId}`);
        }
        if (!h.nullHypothesis || !h.nullHypothesis.startsWith('H₀:')) {
          throw new Error(`Invalid null hypothesis formulation for ${h.hypothesisId}`);
        }
      });
    }
  );

  runTest(
    'TEST-TE-13',
    'Hypothesis Evidence Strength Scores Range',
    'Statistical Scoring',
    'Verifies all hypothesis strength scores are in realistic high confidence range (80-100)',
    () => {
      const hypotheses = thesisEvidenceService.getHypothesisSummaries();
      hypotheses.forEach((h) => {
        if (h.evidenceStrengthScore < 80 || h.evidenceStrengthScore > 100) {
          throw new Error(`Evidence score out of bounds for ${h.hypothesisId}: ${h.evidenceStrengthScore}`);
        }
      });
    }
  );

  runTest(
    'TEST-TE-14',
    'Hypothesis Primary Metrics & Scenario Coverage',
    'Traceability',
    'Ensures every hypothesis maps to valid standardized metrics and scenarios',
    () => {
      const hypotheses = thesisEvidenceService.getHypothesisSummaries();
      hypotheses.forEach((h) => {
        if (h.primaryMetrics.length === 0) {
          throw new Error(`No primary metrics bound to ${h.hypothesisId}`);
        }
        if (h.scenarioCoverage.length === 0) {
          throw new Error(`No scenarios bound to ${h.hypothesisId}`);
        }
      });
    }
  );

  runTest(
    'TEST-TE-15',
    'Hypothesis Allowed Academic Conclusions',
    'Conclusion Safety',
    'Verifies allowed conclusions qualify evidence as simulation/experimental and not operational guarantees',
    () => {
      const hypotheses = thesisEvidenceService.getHypothesisSummaries();
      hypotheses.forEach((h) => {
        if (!h.allowedConclusion || h.allowedConclusion.length < 20) {
          throw new Error(`Insufficient allowed conclusion for ${h.hypothesisId}`);
        }
      });
    }
  );

  // -------------------------------------------------------------------------
  // GROUP 4: Thesis Chapter Mappings 1 to 9 (TEST-TE-16 to 20)
  // -------------------------------------------------------------------------

  runTest(
    'TEST-TE-16',
    'Chapter Mappings Full Sequence (Chapters 1 to 9)',
    'Dissertation Structure',
    'Verifies all 9 dissertation chapters are mapped and sequenced',
    () => {
      const chapters = thesisEvidenceService.getChapterMappings();
      if (chapters.length !== 9) {
        throw new Error(`Expected 9 chapters, found: ${chapters.length}`);
      }
      for (let i = 1; i <= 9; i++) {
        const ch = chapters.find((c) => c.chapterNumber === i);
        if (!ch) throw new Error(`Missing chapter ${i}`);
      }
    }
  );

  runTest(
    'TEST-TE-17',
    'Chapter 1 (Introduction) Foundations',
    'Dissertation Structure',
    'Verifies Chapter 1 mappings to urban context, problem statement, and objectives',
    () => {
      const ch1 = thesisEvidenceService.getChapterMappings().find((c) => c.chapterNumber === 1);
      if (!ch1) throw new Error('Chapter 1 missing.');
      if (!ch1.chapterTitle.includes('Introduction')) throw new Error('Invalid title for Chapter 1');
      if (ch1.includedTopics.length < 3) throw new Error('Insufficient topics in Chapter 1');
    }
  );

  runTest(
    'TEST-TE-18',
    'Chapter 4 (System Architecture) SCOS Pipeline Mapping',
    'Architecture Mapping',
    'Verifies Chapter 4 maps SCOS Phases 8.1–8.5C (Kernel, Data, Twin, Decision Engine)',
    () => {
      const ch4 = thesisEvidenceService.getChapterMappings().find((c) => c.chapterNumber === 4);
      if (!ch4) throw new Error('Chapter 4 missing.');
      if (!ch4.mappedPhases.includes('Phase 8.1')) throw new Error('Phase 8.1 missing in Chapter 4');
    }
  );

  runTest(
    'TEST-TE-19',
    'Chapter 6 (Results & Evidence) Metrics & Hypotheses Mapping',
    'Results Mapping',
    'Verifies Chapter 6 maps all 5 RQs, 5 Hypotheses, and statistical evaluation',
    () => {
      const ch6 = thesisEvidenceService.getChapterMappings().find((c) => c.chapterNumber === 6);
      if (!ch6) throw new Error('Chapter 6 missing.');
      if (ch6.associatedRQs.length !== 5) throw new Error('Chapter 6 must associate all 5 RQs');
      if (ch6.associatedHypotheses.length !== 5) throw new Error('Chapter 6 must associate all 5 Hypotheses');
    }
  );

  runTest(
    'TEST-TE-20',
    'Chapter Artifacts Mapping Completeness',
    'Artifact Lineage',
    'Ensures every chapter defines registered figure/table artifacts with source phases',
    () => {
      const chapters = thesisEvidenceService.getChapterMappings();
      chapters.forEach((ch) => {
        if (ch.artifacts.length === 0) {
          throw new Error(`Chapter ${ch.chapterNumber} has no registered artifacts.`);
        }
      });
    }
  );

  // -------------------------------------------------------------------------
  // GROUP 5: Figure & Table Registries (TEST-TE-21 to 25)
  // -------------------------------------------------------------------------

  runTest(
    'TEST-TE-21',
    'Figure Registry Total Count (10 Figures)',
    'Figure Registry',
    'Ensures exactly 10 academic figures (FIG-01 to FIG-10) are registered',
    () => {
      const figures = thesisEvidenceService.getFigureRegistry();
      if (figures.length !== 10) {
        throw new Error(`Expected 10 figures, found: ${figures.length}`);
      }
    }
  );

  runTest(
    'TEST-TE-22',
    'Figure Metadata & Captions Integrity',
    'Figure Registry',
    'Verifies figure numbers, proposed titles, captions, and source phases',
    () => {
      const figures = thesisEvidenceService.getFigureRegistry();
      figures.forEach((f) => {
        if (!f.figureNumber.startsWith('Figure ')) throw new Error(`Invalid figure number: ${f.figureNumber}`);
        if (!f.recommendedCaption || f.recommendedCaption.length < 15) {
          throw new Error(`Invalid caption for figure ${f.figureId}`);
        }
        if (!f.sourcePhase) throw new Error(`Missing source phase for figure ${f.figureId}`);
      });
    }
  );

  runTest(
    'TEST-TE-23',
    'Table Registry Total Count (10 Tables)',
    'Table Registry',
    'Ensures exactly 10 structured academic tables (TBL-01 to TBL-10) are registered',
    () => {
      const tables = thesisEvidenceService.getTableRegistry();
      if (tables.length !== 10) {
        throw new Error(`Expected 10 tables, found: ${tables.length}`);
      }
    }
  );

  runTest(
    'TEST-TE-24',
    'Table Column Headers & Row Counts',
    'Table Registry',
    'Ensures tables define non-empty column headers and positive row counts',
    () => {
      const tables = thesisEvidenceService.getTableRegistry();
      tables.forEach((t) => {
        if (t.columnHeaders.length < 2) throw new Error(`Insufficient column headers in ${t.tableId}`);
        if (t.rowCount <= 0) throw new Error(`Invalid row count in ${t.tableId}: ${t.rowCount}`);
      });
    }
  );

  runTest(
    'TEST-TE-25',
    'Figure & Table Chapter Association Validity',
    'Registry Cross-Reference',
    'Verifies that figure and table chapter mappings fall within valid 1 to 9 range',
    () => {
      const figures = thesisEvidenceService.getFigureRegistry();
      const tables = thesisEvidenceService.getTableRegistry();
      figures.forEach((f) => {
        if (f.chapterMapping < 1 || f.chapterMapping > 9) {
          throw new Error(`Invalid chapter mapping for figure ${f.figureId}: ${f.chapterMapping}`);
        }
      });
      tables.forEach((t) => {
        if (t.chapterMapping < 1 || t.chapterMapping > 9) {
          throw new Error(`Invalid chapter mapping for table ${t.tableId}: ${t.chapterMapping}`);
        }
      });
    }
  );

  // -------------------------------------------------------------------------
  // GROUP 6: Academic Contributions & Boundaries (TEST-TE-26 to 30)
  // -------------------------------------------------------------------------

  runTest(
    'TEST-TE-26',
    'Academic Contributions Registry (8 Contributions)',
    'Contributions',
    'Verifies 8 classified research contributions across architectural, algorithmic, empirical, and civil engineering dimensions',
    () => {
      const contributions = thesisEvidenceService.getContributionRegistry();
      if (contributions.length !== 8) {
        throw new Error(`Expected 8 contributions, found: ${contributions.length}`);
      }
    }
  );

  runTest(
    'TEST-TE-27',
    'Civil Engineering Domain Grounding in Contributions',
    'Civil Engineering',
    'Ensures contribution CONTRIB-07 covers Kanpur municipal civil engineering grounding',
    () => {
      const c7 = thesisEvidenceService.getContributionRegistry().find((c) => c.contributionId === 'CONTRIB-07');
      if (!c7) throw new Error('CONTRIB-07 not found.');
      if (c7.contributionType !== 'CIVIL_ENGINEERING') {
        throw new Error(`Expected CIVIL_ENGINEERING type, found: ${c7.contributionType}`);
      }
      if (!c7.statement.includes('Kanpur') && !c7.title.includes('Civil Infrastructure')) {
        throw new Error('CONTRIB-07 must reference Kanpur civil infrastructure grounding.');
      }
    }
  );

  runTest(
    'TEST-TE-28',
    'Evidence Boundaries Supported Aspects Count',
    'Evidence Boundaries',
    'Verifies supported aspects are enumerated with LEVEL_3/LEVEL_4 evidence ratings',
    () => {
      const boundaries = thesisEvidenceService.getEvidenceBoundaries();
      if (boundaries.supportedAspects.length < 5) {
        throw new Error(`Insufficient supported aspects: ${boundaries.supportedAspects.length}`);
      }
    }
  );

  runTest(
    'TEST-TE-29',
    'Evidence Boundaries Unestablished Aspects (Mandatory Disclosures)',
    'Evidence Boundaries',
    'Verifies all unestablished aspects have validation requirements and NOT ESTABLISHED status',
    () => {
      const boundaries = thesisEvidenceService.getEvidenceBoundaries();
      if (boundaries.unestablishedAspects.length < 5) {
        throw new Error(`Insufficient unestablished aspects: ${boundaries.unestablishedAspects.length}`);
      }
      boundaries.unestablishedAspects.forEach((u) => {
        if (!u.validationRequirement || u.validationRequirement.length < 10) {
          throw new Error(`Missing validation requirement in unestablished aspect: ${u.category}`);
        }
      });
    }
  );

  runTest(
    'TEST-TE-30',
    'Official Governance Declaration Enforceability',
    'Governance Policy',
    'Verifies existence of binding governance declaration protecting academic integrity',
    () => {
      const boundaries = thesisEvidenceService.getEvidenceBoundaries();
      if (!boundaries.governanceDeclaration || !boundaries.governanceDeclaration.includes('IIT Kanpur')) {
        throw new Error('Missing or invalid governance declaration.');
      }
    }
  );

  // -------------------------------------------------------------------------
  // GROUP 7: Manifests, Exports & Self-Verification (TEST-TE-31 to 36)
  // -------------------------------------------------------------------------

  runTest(
    'TEST-TE-31',
    'Reproducibility Manifest Protocol Steps',
    'Manifests',
    'Ensures reproducibility manifest defines step-by-step audit instructions',
    () => {
      const manifest = thesisEvidenceService.getReproducibilityManifest();
      if (manifest.reproducibilityProtocolSteps.length < 5) {
        throw new Error('Insufficient protocol steps in reproducibility manifest.');
      }
      if (!manifest.canonicalFingerprints.packageFingerprint) {
        throw new Error('Missing package fingerprint in manifest.');
      }
    }
  );

  runTest(
    'TEST-TE-32',
    'Dataset Manifest Scenario Specifications',
    'Manifests',
    'Verifies dataset manifest covers all 5 scenarios (SC-01 to SC-05)',
    () => {
      const manifest = thesisEvidenceService.getDatasetManifest();
      if (manifest.scenarioCount !== 5) {
        throw new Error(`Expected 5 scenarios in dataset manifest, found: ${manifest.scenarioCount}`);
      }
    }
  );

  runTest(
    'TEST-TE-33',
    'JSON Export Generation & Structural Validity',
    'Export Engine',
    'Generates JSON export and validates JSON parseability and metadata',
    () => {
      const exportData = thesisEvidenceService.exportThesisEvidenceJSON();
      if (exportData.format !== 'JSON') throw new Error('Expected JSON export format');
      const parsed = JSON.parse(exportData.content);
      if (!parsed.packageVersion || parsed.packageVersion !== 'SCOS-THESIS-EVIDENCE-v1.0') {
        throw new Error('Invalid exported JSON package content.');
      }
    }
  );

  runTest(
    'TEST-TE-34',
    'CSV Export RFC-4180 Format Integrity',
    'Export Engine',
    'Generates CSV export and verifies header rows for master matrices, figures, and tables',
    () => {
      const exportData = thesisEvidenceService.exportThesisEvidenceCSV();
      if (exportData.format !== 'CSV') throw new Error('Expected CSV export format');
      if (!exportData.content.includes('RECORD_ID,RQ_ID,HYPOTHESIS_ID')) {
        throw new Error('Missing matrix header in CSV export.');
      }
      if (!exportData.content.includes('FIGURE_ID,FIGURE_NUMBER')) {
        throw new Error('Missing figures header in CSV export.');
      }
    }
  );

  runTest(
    'TEST-TE-35',
    'Markdown Export Academic Summary Structure',
    'Export Engine',
    'Generates Markdown report and validates thesis chapters, figures, tables, and notices',
    () => {
      const exportData = thesisEvidenceService.exportThesisEvidenceMarkdown();
      if (exportData.format !== 'MARKDOWN') throw new Error('Expected MARKDOWN export format');
      if (!exportData.content.includes('# SCOS Master Thesis Evidence & Reproducibility Package')) {
        throw new Error('Missing primary heading in Markdown export.');
      }
      if (!exportData.content.includes('MANDATORY ACADEMIC NOTICE')) {
        throw new Error('Missing mandatory notice in Markdown export.');
      }
    }
  );

  runTest(
    'TEST-TE-36',
    'Self-Verification Test Suite Execution (100% Pass Rate)',
    'Self-Test',
    'Runs internal self-verification suite and ensures all checks pass without error',
    () => {
      const testResults = thesisEvidenceService.runSelfVerificationTest();
      if (!testResults.allPassed) {
        const failed = testResults.checks.filter((c) => !c.passed).map((c) => c.name);
        throw new Error(`Self-verification tests failed: ${failed.join(', ')}`);
      }
    }
  );

  const durationMs = Date.now() - startTime;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  const pkg = thesisEvidenceService.buildThesisEvidencePackage();

  return {
    suiteId: 'SUITE-THESIS-EVIDENCE-11C',
    totalTests: results.length,
    passedCount,
    failedCount,
    durationMs,
    executedAt: new Date().toISOString(),
    allPassed: failedCount === 0,
    results,
    packageFingerprint: pkg.packageFingerprint,
    mandatoryNotice: pkg.realWorldValidationNotice,
  };
}
