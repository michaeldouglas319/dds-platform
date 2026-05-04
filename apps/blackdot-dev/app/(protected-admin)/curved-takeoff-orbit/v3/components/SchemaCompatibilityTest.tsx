/**
 * Schema Compatibility Test Component
 *
 * Browser-based test to verify that new schemas are compatible with existing V3_CONFIG.
 * Shows validation results and any mismatches between old and new systems.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { V3_CONFIG } from '../config/v3.config';
import {
  DebugSchema,
  OrientationSchema,
  OrbitPhysicsSchema,
  BlueGateSchema,
  VerticalWaveSchema,
  CollisionSchema,
  SoftGuidanceSchema,
  TrajectorySchema,
  ExitRequirementsSchema,
  LandingTransitionSchema,
  ModelOrientationSchema,
  OrbitSettingsSchema,
} from '../config/v3-config.schema';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  section: string;
  passed: boolean;
  errors?: string[];
  warnings?: string[];
}

export function SchemaCompatibilityTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'passed' | 'failed'>('pending');

  useEffect(() => {
    runTests();
  }, []);

  const runTests = () => {
    const testResults: TestResult[] = [];

    // Test 1: Debug Config
    const debugResult = DebugSchema.safeParse(V3_CONFIG.debug);
    testResults.push({
      section: 'Debug (11 checkboxes)',
      passed: debugResult.success,
      errors: debugResult.success ? undefined : debugResult.error.issues.map((i) => i.message),
    });

    // Test 2: Orientation Config
    const orientationResult = OrientationSchema.safeParse(V3_CONFIG.orientation);
    testResults.push({
      section: 'Orientation (1 select + 3 sliders)',
      passed: orientationResult.success,
      errors: orientationResult.success ? undefined : orientationResult.error.issues.map((i) => i.message),
    });

    // Test 3: Physics Config
    const physicsResult = OrbitPhysicsSchema.safeParse(V3_CONFIG.physics);
    testResults.push({
      section: 'Physics (12 sliders)',
      passed: physicsResult.success,
      errors: physicsResult.success ? undefined : physicsResult.error.issues.map((i) => i.message),
    });

    // Test 4: Blue Gate Config
    const blueGateResult = BlueGateSchema.safeParse(V3_CONFIG.blueGate);
    testResults.push({
      section: 'Blue Gate (nested attraction)',
      passed: blueGateResult.success,
      errors: blueGateResult.success ? undefined : blueGateResult.error.issues.map((i) => i.message),
    });

    // Test 5: Vertical Wave Config
    const verticalWaveResult = VerticalWaveSchema.safeParse(V3_CONFIG.verticalWave);
    testResults.push({
      section: 'Vertical Wave (4 parameters)',
      passed: verticalWaveResult.success,
      errors: verticalWaveResult.success ? undefined : verticalWaveResult.error.issues.map((i) => i.message),
    });

    // Test 6: Collision Config
    const collisionResult = CollisionSchema.safeParse(V3_CONFIG.collision);
    testResults.push({
      section: 'Collision (8 parameters)',
      passed: collisionResult.success,
      errors: collisionResult.success ? undefined : collisionResult.error.issues.map((i) => i.message),
    });

    // Test 7: Soft Guidance Config
    const softGuidanceResult = SoftGuidanceSchema.safeParse(V3_CONFIG.softGuidance);
    testResults.push({
      section: 'Soft Guidance (5 parameters)',
      passed: softGuidanceResult.success,
      errors: softGuidanceResult.success ? undefined : softGuidanceResult.error.issues.map((i) => i.message),
    });

    // Test 8: Trajectory Config
    const trajectoryResult = TrajectorySchema.safeParse(V3_CONFIG.trajectorySettings);
    testResults.push({
      section: 'Trajectory (9 parameters)',
      passed: trajectoryResult.success,
      errors: trajectoryResult.success ? undefined : trajectoryResult.error.issues.map((i) => i.message),
    });

    // Test 9: Exit Requirements Config
    const exitRequirementsResult = ExitRequirementsSchema.safeParse(V3_CONFIG.exitRequirements);
    testResults.push({
      section: 'Exit Requirements (2 parameters)',
      passed: exitRequirementsResult.success,
      errors: exitRequirementsResult.success ? undefined : exitRequirementsResult.error.issues.map((i) => i.message),
    });

    // Test 10: Landing Transition Config
    const landingTransitionResult = LandingTransitionSchema.safeParse(V3_CONFIG.landingTransition);
    testResults.push({
      section: 'Landing Transition (5 parameters)',
      passed: landingTransitionResult.success,
      errors: landingTransitionResult.success ? undefined : landingTransitionResult.error.issues.map((i) => i.message),
    });

    // Test 11: Model Orientation Config
    const modelOrientationResult = ModelOrientationSchema.safeParse(V3_CONFIG.modelOrientation);
    testResults.push({
      section: 'Model Orientation (4 parameters)',
      passed: modelOrientationResult.success,
      errors: modelOrientationResult.success ? undefined : modelOrientationResult.error.issues.map((i) => i.message),
    });

    // Test 12: Orbit Settings (without Vector3)
    const orbitSettings = {
      radius: V3_CONFIG.orbit.radius,
      nominalSpeed: V3_CONFIG.orbit.nominalSpeed,
    };
    const orbitSettingsResult = OrbitSettingsSchema.safeParse(orbitSettings);
    testResults.push({
      section: 'Orbit Settings (2 parameters, Vector3 manual)',
      passed: orbitSettingsResult.success,
      errors: orbitSettingsResult.success ? undefined : orbitSettingsResult.error.issues.map((i) => i.message),
      warnings: ['Vector3 center field handled manually in UI'],
    });

    // Round-trip tests
    const debugRoundTrip = DebugSchema.safeParse(JSON.parse(JSON.stringify(V3_CONFIG.debug)));
    testResults.push({
      section: 'Round-trip: Debug (JSON serialize/deserialize)',
      passed: debugRoundTrip.success && JSON.stringify(debugRoundTrip.data) === JSON.stringify(V3_CONFIG.debug),
      errors: debugRoundTrip.success ? undefined : ['Failed to preserve values through JSON round-trip'],
    });

    const physicsRoundTrip = OrbitPhysicsSchema.safeParse(JSON.parse(JSON.stringify(V3_CONFIG.physics)));
    testResults.push({
      section: 'Round-trip: Physics (JSON serialize/deserialize)',
      passed: physicsRoundTrip.success && JSON.stringify(physicsRoundTrip.data) === JSON.stringify(V3_CONFIG.physics),
      errors: physicsRoundTrip.success ? undefined : ['Failed to preserve values through JSON round-trip'],
    });

    setResults(testResults);

    // Overall status
    const allPassed = testResults.every((r) => r.passed);
    setOverallStatus(allPassed ? 'passed' : 'failed');
  };

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6 bg-slate-900 rounded-lg">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          Schema Compatibility Test
          {overallStatus === 'passed' && (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          )}
          {overallStatus === 'failed' && (
            <XCircle className="w-6 h-6 text-red-500" />
          )}
        </h1>
        <p className="text-slate-400 text-sm">
          Validates that new Zod schemas are compatible with existing V3_CONFIG structure.
        </p>
      </div>

      {/* Overall Status */}
      <div className={`p-4 rounded border ${
        overallStatus === 'passed'
          ? 'bg-green-900/20 border-green-700/50'
          : 'bg-red-900/20 border-red-700/50'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-lg font-semibold ${
            overallStatus === 'passed' ? 'text-green-400' : 'text-red-400'
          }`}>
            {passedCount} / {totalCount} Tests Passed
          </span>
          <button
            onClick={runTests}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
          >
            Re-run Tests
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-3">
        {results.map((result, idx) => (
          <div
            key={idx}
            className={`p-4 rounded border ${
              result.passed
                ? 'bg-slate-800/50 border-slate-700'
                : 'bg-red-900/10 border-red-700/50'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.passed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              )}

              <div className="flex-1">
                <h3 className={`text-sm font-semibold ${
                  result.passed ? 'text-white' : 'text-red-300'
                }`}>
                  {result.section}
                </h3>

                {/* Errors */}
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {result.errors.map((error, errorIdx) => (
                      <p key={errorIdx} className="text-red-400 text-xs font-mono">
                        ✗ {error}
                      </p>
                    ))}
                  </div>
                )}

                {/* Warnings */}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="mt-2 space-y-1 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      {result.warnings.map((warning, warnIdx) => (
                        <p key={warnIdx} className="text-yellow-400 text-xs">
                          {warning}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {result.passed && !result.warnings && (
                  <p className="text-slate-400 text-xs mt-1">
                    ✓ Schema validates existing config correctly
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-slate-800 rounded border border-slate-700">
        <h3 className="text-white text-sm font-semibold mb-2">
          Test Summary
        </h3>
        <ul className="text-slate-300 text-xs space-y-1">
          <li>• Validated {totalCount} configuration sections</li>
          <li>• All primitive types (numbers, booleans, strings) tested</li>
          <li>• Enum values verified against allowed options</li>
          <li>• Nested object structures validated</li>
          <li>• JSON serialization round-trip tested</li>
          <li>• Value ranges checked against schema constraints</li>
        </ul>
      </div>

      {/* Next Steps */}
      {overallStatus === 'passed' && (
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded">
          <h3 className="text-blue-400 text-sm font-semibold mb-2">
            ✓ All Tests Passed - Ready for Migration
          </h3>
          <p className="text-slate-300 text-xs">
            The new schema system is fully compatible with the existing V3_CONFIG structure.
            You can now safely migrate V3ConfigEditorEnhanced to use schema-driven sections.
          </p>
        </div>
      )}

      {overallStatus === 'failed' && (
        <div className="mt-6 p-4 bg-red-900/20 border border-red-700/50 rounded">
          <h3 className="text-red-400 text-sm font-semibold mb-2">
            ✗ Some Tests Failed
          </h3>
          <p className="text-slate-300 text-xs">
            Fix the validation errors above before migrating the config editor.
            Check that schema constraints match the existing config values.
          </p>
        </div>
      )}
    </div>
  );
}
