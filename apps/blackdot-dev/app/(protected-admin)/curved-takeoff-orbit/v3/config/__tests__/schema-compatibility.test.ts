/**
 * Schema Compatibility Test
 *
 * Validates that the new Zod schema system is compatible with the existing
 * V3_CONFIG structure. Ensures old and new systems produce compatible outputs.
 *
 * Run with: npm test -- schema-compatibility.test.ts
 */

import { describe, test, expect } from 'vitest';
import * as THREE from 'three';
import { V3_CONFIG } from '../v3.config';
import {
  V3ConfigSchema,
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
} from '../v3-config.schema';

describe('Schema Compatibility Tests', () => {
  describe('Debug Config', () => {
    test('existing debug config validates against schema', () => {
      const result = DebugSchema.safeParse(V3_CONFIG.debug);

      if (!result.success) {
        console.error('Debug schema validation errors:', result.error.issues);
      }

      expect(result.success).toBe(true);

      if (result.success) {
        // Verify all fields match
        expect(result.data).toEqual(V3_CONFIG.debug);
      }
    });

    test('debug config has all 11 expected fields', () => {
      const debugKeys = Object.keys(V3_CONFIG.debug);
      expect(debugKeys).toHaveLength(11);

      const expectedKeys = [
        'showTrajectories',
        'showWaypoints',
        'showVelocityVectors',
        'showHandoffZone',
        'showGateZones',
        'showOrbitPath',
        'showCollisionSpheres',
        'showAssemblyProgress',
        'showTaxiPaths',
        'showHealthIndicators',
        'showPhysicsBounds',
      ];

      expect(debugKeys.sort()).toEqual(expectedKeys.sort());
    });
  });

  describe('Orientation Config', () => {
    test('existing orientation config validates against schema', () => {
      const result = OrientationSchema.safeParse(V3_CONFIG.orientation);

      if (!result.success) {
        console.error('Orientation schema validation errors:', result.error.issues);
      }

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toEqual(V3_CONFIG.orientation);
      }
    });

    test('orientation mode is valid enum value', () => {
      const validModes = ['tangent', 'radial', 'banking', 'combo', 'tumble', 'fixed'];
      expect(validModes).toContain(V3_CONFIG.orientation.mode);
    });
  });

  describe('Physics Config', () => {
    test('existing physics config validates against schema', () => {
      const result = OrbitPhysicsSchema.safeParse(V3_CONFIG.physics);

      if (!result.success) {
        console.error('Physics schema validation errors:', result.error.issues);
      }

      expect(result.success).toBe(true);

      if (result.success) {
        // Verify all 12 physics parameters match
        expect(result.data).toEqual(V3_CONFIG.physics);
      }
    });

    test('physics config has all 12 expected fields', () => {
      const physicsKeys = Object.keys(V3_CONFIG.physics);
      expect(physicsKeys).toHaveLength(12);

      const expectedKeys = [
        'orbitRadius',
        'donutThickness',
        'gravitationalConstant',
        'nominalOrbitSpeed',
        'particleMass',
        'collisionRadius',
        'dampingLinear',
        'dampingAngular',
        'tangentialBoost',
        'radialConfinement',
        'restitution',
        'friction',
      ];

      expect(physicsKeys.sort()).toEqual(expectedKeys.sort());
    });

    test('physics values are within schema constraints', () => {
      const physics = V3_CONFIG.physics;

      // Test specific constraints
      expect(physics.orbitRadius).toBeGreaterThanOrEqual(10);
      expect(physics.orbitRadius).toBeLessThanOrEqual(50);

      expect(physics.donutThickness).toBeGreaterThanOrEqual(5);
      expect(physics.donutThickness).toBeLessThanOrEqual(30);

      expect(physics.dampingLinear).toBeGreaterThanOrEqual(0);
      expect(physics.dampingLinear).toBeLessThanOrEqual(0.5);

      expect(physics.restitution).toBeGreaterThanOrEqual(0);
      expect(physics.restitution).toBeLessThanOrEqual(1);
    });
  });

  describe('Blue Gate Config', () => {
    test('existing blue gate config validates against schema', () => {
      const result = BlueGateSchema.safeParse(V3_CONFIG.blueGate);

      if (!result.success) {
        console.error('Blue Gate schema validation errors:', result.error.issues);
      }

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toEqual(V3_CONFIG.blueGate);
      }
    });

    test('blue gate has nested entry and exit attraction configs', () => {
      expect(V3_CONFIG.blueGate.entryAttraction).toBeDefined();
      expect(V3_CONFIG.blueGate.exitAttraction).toBeDefined();

      expect(typeof V3_CONFIG.blueGate.entryAttraction.enabled).toBe('boolean');
      expect(typeof V3_CONFIG.blueGate.exitAttraction.enabled).toBe('boolean');
    });
  });

  describe('Vertical Wave Config', () => {
    test('existing vertical wave config validates against schema', () => {
      const result = VerticalWaveSchema.safeParse(V3_CONFIG.verticalWave);

      if (!result.success) {
        console.error('Vertical Wave schema validation errors:', result.error.issues);
      }

      expect(result.success).toBe(true);
    });
  });

  describe('Collision Config', () => {
    test('existing collision config validates against schema', () => {
      const result = CollisionSchema.safeParse(V3_CONFIG.collision);

      if (!result.success) {
        console.error('Collision schema validation errors:', result.error.issues);
      }

      expect(result.success).toBe(true);
    });

    test('collision shape is valid enum value', () => {
      const validShapes = ['sphere', 'ellipsoid', 'squircle', 'box'];
      expect(validShapes).toContain(V3_CONFIG.collision.shape);
    });
  });

  describe('Soft Guidance Config', () => {
    test('existing soft guidance config validates against schema', () => {
      const result = SoftGuidanceSchema.safeParse(V3_CONFIG.softGuidance);

      if (!result.success) {
        console.error('Soft Guidance schema validation errors:', result.error.issues);
      }

      expect(result.success).toBe(true);
    });
  });

  describe('Trajectory Config', () => {
    test('existing trajectory config validates against schema', () => {
      const result = TrajectorySchema.safeParse(V3_CONFIG.trajectorySettings);

      if (!result.success) {
        console.error('Trajectory schema validation errors:', result.error.issues);
      }

      expect(result.success).toBe(true);
    });
  });

  describe('Exit Requirements Config', () => {
    test('existing exit requirements validates against schema', () => {
      const result = ExitRequirementsSchema.safeParse(V3_CONFIG.exitRequirements);

      if (!result.success) {
        console.error('Exit Requirements schema validation errors:', result.error.issues);
      }

      expect(result.success).toBe(true);
    });
  });

  describe('Landing Transition Config', () => {
    test('existing landing transition validates against schema', () => {
      const result = LandingTransitionSchema.safeParse(V3_CONFIG.landingTransition);

      if (!result.success) {
        console.error('Landing Transition schema validation errors:', result.error.issues);
      }

      expect(result.success).toBe(true);
    });
  });

  describe('Model Orientation Config', () => {
    test('existing model orientation validates against schema', () => {
      const result = ModelOrientationSchema.safeParse(V3_CONFIG.modelOrientation);

      if (!result.success) {
        console.error('Model Orientation schema validation errors:', result.error.issues);
      }

      expect(result.success).toBe(true);
    });
  });

  describe('Orbit Settings Config', () => {
    test('orbit settings (without Vector3 center) validates against schema', () => {
      const orbitSettings = {
        radius: V3_CONFIG.orbit.radius,
        nominalSpeed: V3_CONFIG.orbit.nominalSpeed,
      };

      const result = OrbitSettingsSchema.safeParse(orbitSettings);

      if (!result.success) {
        console.error('Orbit Settings schema validation errors:', result.error.issues);
      }

      expect(result.success).toBe(true);
    });
  });

  describe('Round-Trip Compatibility', () => {
    test('debug config can be serialized and deserialized', () => {
      const original = V3_CONFIG.debug;
      const json = JSON.stringify(original);
      const parsed = JSON.parse(json);

      const result = DebugSchema.safeParse(parsed);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toEqual(original);
      }
    });

    test('orientation config can be serialized and deserialized', () => {
      const original = V3_CONFIG.orientation;
      const json = JSON.stringify(original);
      const parsed = JSON.parse(json);

      const result = OrientationSchema.safeParse(parsed);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toEqual(original);
      }
    });

    test('physics config can be serialized and deserialized', () => {
      const original = V3_CONFIG.physics;
      const json = JSON.stringify(original);
      const parsed = JSON.parse(json);

      const result = OrbitPhysicsSchema.safeParse(parsed);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toEqual(original);
      }
    });
  });

  describe('Value Range Compatibility', () => {
    test('all numeric values are within schema-defined ranges', () => {
      // Physics
      expect(V3_CONFIG.physics.orbitRadius).toBeGreaterThanOrEqual(10);
      expect(V3_CONFIG.physics.orbitRadius).toBeLessThanOrEqual(50);

      expect(V3_CONFIG.physics.donutThickness).toBeGreaterThanOrEqual(5);
      expect(V3_CONFIG.physics.donutThickness).toBeLessThanOrEqual(30);

      expect(V3_CONFIG.physics.gravitationalConstant).toBeGreaterThanOrEqual(50);
      expect(V3_CONFIG.physics.gravitationalConstant).toBeLessThanOrEqual(200);

      // Orientation
      expect(V3_CONFIG.orientation.tangentSmoothing).toBeGreaterThanOrEqual(0);
      expect(V3_CONFIG.orientation.tangentSmoothing).toBeLessThanOrEqual(1);

      expect(V3_CONFIG.orientation.bankMultiplier).toBeGreaterThanOrEqual(0);
      expect(V3_CONFIG.orientation.bankMultiplier).toBeLessThanOrEqual(2);

      expect(V3_CONFIG.orientation.maxBankAngle).toBeGreaterThanOrEqual(0);
      expect(V3_CONFIG.orientation.maxBankAngle).toBeLessThanOrEqual(90);
    });
  });

  describe('Source Config Compatibility', () => {
    test('sources array structure is compatible', () => {
      expect(Array.isArray(V3_CONFIG.sources)).toBe(true);
      expect(V3_CONFIG.sources.length).toBeGreaterThan(0);

      V3_CONFIG.sources.forEach((source) => {
        expect(typeof source.id).toBe('string');
        expect(source.gatePosition).toBeInstanceOf(THREE.Vector3);
        expect(typeof source.spawnRate).toBe('number');
        expect(typeof source.orbitEntryAngle).toBe('number');
        expect(typeof source.particleColor).toBe('string');
        expect(typeof source.modelScale).toBe('number');
      });
    });

    test('source colors are valid hex format', () => {
      const hexRegex = /^#[0-9a-fA-F]{8}$/;

      V3_CONFIG.sources.forEach((source) => {
        expect(source.particleColor).toMatch(hexRegex);
      });
    });

    test('source flight pattern overrides are optional', () => {
      V3_CONFIG.sources.forEach((source) => {
        if (source.flightPattern) {
          // If present, should be an object
          expect(typeof source.flightPattern).toBe('object');
        }
      });
    });
  });

  describe('Backwards Compatibility', () => {
    test('config can be used with existing V3 system', () => {
      // Verify key fields exist that existing system depends on
      expect(V3_CONFIG.particleCount).toBeDefined();
      expect(V3_CONFIG.orbit).toBeDefined();
      expect(V3_CONFIG.sources).toBeDefined();
      expect(V3_CONFIG.physics).toBeDefined();
      expect(V3_CONFIG.blueGate).toBeDefined();
      expect(V3_CONFIG.debug).toBeDefined();
      expect(V3_CONFIG.orientation).toBeDefined();
      expect(V3_CONFIG.collision).toBeDefined();
    });

    test('extended configs (taxi, assembly, health) still present', () => {
      // These are not in schemas yet but should still exist
      expect(V3_CONFIG.taxiStaging).toBeDefined();
      expect(V3_CONFIG.assembly).toBeDefined();
      expect(V3_CONFIG.health).toBeDefined();
    });
  });
});

/**
 * Value Comparison Test
 *
 * Ensures that schema-validated configs produce identical outputs
 * to the original manual config structure.
 */
describe('Output Equivalence Tests', () => {
  test('schema output matches original structure exactly', () => {
    // Parse debug config through schema
    const debugResult = DebugSchema.safeParse(V3_CONFIG.debug);
    expect(debugResult.success).toBe(true);

    if (debugResult.success) {
      // Output should be byte-for-byte identical
      expect(JSON.stringify(debugResult.data)).toBe(JSON.stringify(V3_CONFIG.debug));
    }
  });

  test('schema does not add or remove fields', () => {
    const sections = [
      { name: 'debug', schema: DebugSchema, config: V3_CONFIG.debug },
      { name: 'orientation', schema: OrientationSchema, config: V3_CONFIG.orientation },
      { name: 'physics', schema: OrbitPhysicsSchema, config: V3_CONFIG.physics },
      { name: 'verticalWave', schema: VerticalWaveSchema, config: V3_CONFIG.verticalWave },
      { name: 'collision', schema: CollisionSchema, config: V3_CONFIG.collision },
      { name: 'softGuidance', schema: SoftGuidanceSchema, config: V3_CONFIG.softGuidance },
    ];

    sections.forEach(({ name, schema, config }) => {
      const result = schema.safeParse(config);
      expect(result.success).toBe(true);

      if (result.success) {
        const originalKeys = Object.keys(config).sort();
        const parsedKeys = Object.keys(result.data).sort();

        expect(parsedKeys).toEqual(originalKeys);
      }
    });
  });

  test('schema does not modify values', () => {
    const physicsResult = OrbitPhysicsSchema.safeParse(V3_CONFIG.physics);
    expect(physicsResult.success).toBe(true);

    if (physicsResult.success) {
      // Check specific values
      expect(physicsResult.data.orbitRadius).toBe(V3_CONFIG.physics.orbitRadius);
      expect(physicsResult.data.donutThickness).toBe(V3_CONFIG.physics.donutThickness);
      expect(physicsResult.data.gravitationalConstant).toBe(V3_CONFIG.physics.gravitationalConstant);
      expect(physicsResult.data.nominalOrbitSpeed).toBe(V3_CONFIG.physics.nominalOrbitSpeed);
    }
  });
});
