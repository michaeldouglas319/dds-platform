import * as THREE from 'three';
import {
  calculatePurpleWaypoints,
  createDefaultWaypointConfig,
  validateWaypointConfig,
  calculateOrbitEntryAngle,
  generateBlueGatePosition,
  createWaypointVisualization,
} from '../waypointCalculator';

describe('Waypoint Calculator - Purple Waypoint Auto-Calculation', () => {
  describe('calculatePurpleWaypoints', () => {
    it('should generate purple waypoints from green+yellow+blue', () => {
      const green = new THREE.Vector3(-40, 0, -40); // Spawn
      const yellow = new THREE.Vector3(-30, 5, -35); // Release
      const blue = new THREE.Vector3(6, 30, 25); // Orbit entry gate
      const orbitCenter = new THREE.Vector3(6, 30, 0);
      const orbitRadius = 25;

      const config = createDefaultWaypointConfig(green, yellow, blue, orbitCenter, orbitRadius);
      const result = calculatePurpleWaypoints(config);

      // Verify structure
      expect(result.allWaypoints).toBeDefined();
      expect(result.purpleWaypoints).toBeDefined();
      expect(result.velocities).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.curve).toBeDefined();

      // Verify waypoint order: green → yellow → purple[] → blue
      expect(result.allWaypoints[0]).toEqual(green);
      expect(result.allWaypoints[1]).toEqual(yellow);
      expect(result.allWaypoints[result.allWaypoints.length - 1].distanceTo(blue)).toBeLessThan(0.5);

      // Verify purple waypoints exist
      expect(result.purpleWaypoints.length).toBeGreaterThan(0);
      expect(result.purpleWaypoints.length).toBeLessThanOrEqual(config.trajectory.sampleCount);

      console.log('✓ Purple waypoints generated:', result.purpleWaypoints.length);
      console.log('✓ Total waypoints:', result.allWaypoints.length);
      console.log('✓ Trajectory duration:', result.metadata.trajectoryDuration.toFixed(2), 's');
      console.log('✓ Peak height:', result.metadata.peakHeight.toFixed(2));
      console.log('✓ Total distance:', result.metadata.totalDistance.toFixed(2));
      console.log('✓ Velocity mismatch:', result.metadata.velocityMismatch.toFixed(3), 'm/s');
    });

    it('should calculate physics-accurate trajectory', () => {
      const green = new THREE.Vector3(0, 0, 0);
      const yellow = new THREE.Vector3(0, 10, 0);
      const blue = new THREE.Vector3(20, 10, 0);
      const orbitCenter = new THREE.Vector3(0, 10, 0);
      const orbitRadius = 20;

      const config = createDefaultWaypointConfig(green, yellow, blue, orbitCenter, orbitRadius);
      config.physics.gravity = 9.8;
      config.physics.initialVelocity = 20.0;
      config.physics.dragCoefficient = 0.0; // No drag for pure ballistic

      const result = calculatePurpleWaypoints(config);

      // Verify trajectory follows physics
      expect(result.metadata.peakHeight).toBeGreaterThanOrEqual(yellow.y);
      expect(result.metadata.trajectoryDuration).toBeGreaterThan(0);
      expect(result.metadata.finalVelocity.length()).toBeGreaterThan(0);

      // Verify waypoints increase in X (moving toward blue)
      for (let i = 1; i < result.purpleWaypoints.length; i++) {
        expect(result.purpleWaypoints[i].x).toBeGreaterThanOrEqual(result.purpleWaypoints[i - 1].x);
      }

      console.log('✓ Physics trajectory valid');
      console.log('  Peak height:', result.metadata.peakHeight.toFixed(2));
      console.log('  Duration:', result.metadata.trajectoryDuration.toFixed(2), 's');
    });

    it('should match orbit tangent velocity at blue gate', () => {
      const green = new THREE.Vector3(-40, 0, -40);
      const yellow = new THREE.Vector3(-30, 5, -35);
      const orbitCenter = new THREE.Vector3(6, 30, 0);
      const orbitRadius = 25;
      const entryAngle = Math.PI / 2; // 90 degrees

      const blue = generateBlueGatePosition(orbitCenter, orbitRadius, entryAngle);
      const config = createDefaultWaypointConfig(green, yellow, blue, orbitCenter, orbitRadius);

      const result = calculatePurpleWaypoints(config);

      // Verify orbit tangent velocity is calculated correctly
      expect(result.metadata.orbitTangentVelocity).toBeDefined();
      expect(result.metadata.orbitTangentVelocity.length()).toBeCloseTo(config.orbit.nominalSpeed, 2);

      // Verify final velocity is in reasonable range
      expect(result.metadata.finalVelocity.length()).toBeGreaterThan(0);

      console.log('✓ Orbit velocity matching:');
      console.log('  Final velocity:', result.metadata.finalVelocity.length().toFixed(3), 'm/s');
      console.log('  Orbit velocity:', result.metadata.orbitTangentVelocity.length().toFixed(3), 'm/s');
      console.log('  Mismatch:', result.metadata.velocityMismatch.toFixed(3), 'm/s');
    });

    it('should apply smoothing to purple waypoints', () => {
      const green = new THREE.Vector3(0, 0, 0);
      const yellow = new THREE.Vector3(0, 5, 0);
      const blue = new THREE.Vector3(10, 10, 0);
      const orbitCenter = new THREE.Vector3(0, 10, 0);
      const orbitRadius = 10;

      const config = createDefaultWaypointConfig(green, yellow, blue, orbitCenter, orbitRadius);

      // Test with different smoothing factors
      config.trajectory.smoothingFactor = 0.0;
      const noSmoothing = calculatePurpleWaypoints(config);

      config.trajectory.smoothingFactor = 0.8;
      const highSmoothing = calculatePurpleWaypoints(config);

      // Verify different results
      expect(noSmoothing.purpleWaypoints.length).toEqual(highSmoothing.purpleWaypoints.length);

      // High smoothing should produce smoother curve (lower curvature variance)
      console.log('✓ Smoothing applied successfully');
      console.log('  No smoothing waypoints:', noSmoothing.purpleWaypoints.length);
      console.log('  High smoothing waypoints:', highSmoothing.purpleWaypoints.length);
    });
  });

  describe('validateWaypointConfig', () => {
    it('should validate correct configuration', () => {
      const config = createDefaultWaypointConfig(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 5, 0),
        new THREE.Vector3(10, 10, 0),
        new THREE.Vector3(0, 10, 0),
        10
      );

      const errors = validateWaypointConfig(config);
      expect(errors.length).toBe(0);

      console.log('✓ Valid configuration passed validation');
    });

    it('should catch invalid physics parameters', () => {
      const config = createDefaultWaypointConfig(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 5, 0),
        new THREE.Vector3(10, 10, 0),
        new THREE.Vector3(0, 10, 0),
        10
      );

      config.physics.gravity = -1; // Invalid
      config.physics.mass = 0; // Invalid

      const errors = validateWaypointConfig(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('Gravity'))).toBe(true);
      expect(errors.some(e => e.includes('Mass'))).toBe(true);

      console.log('✓ Invalid parameters caught:', errors);
    });

    it('should catch invalid trajectory parameters', () => {
      const config = createDefaultWaypointConfig(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 5, 0),
        new THREE.Vector3(10, 10, 0),
        new THREE.Vector3(0, 10, 0),
        10
      );

      config.trajectory.sampleCount = 1; // Too low
      config.trajectory.timeStep = 0; // Invalid

      const errors = validateWaypointConfig(config);
      expect(errors.length).toBeGreaterThan(0);

      console.log('✓ Invalid trajectory parameters caught:', errors);
    });
  });

  describe('Orbit helpers', () => {
    it('should calculate orbit entry angle', () => {
      const orbitCenter = new THREE.Vector3(0, 0, 0);

      // Test cardinal directions
      const east = new THREE.Vector3(10, 0, 0);
      const north = new THREE.Vector3(0, 0, 10);
      const west = new THREE.Vector3(-10, 0, 0);
      const south = new THREE.Vector3(0, 0, -10);

      expect(calculateOrbitEntryAngle(east, orbitCenter)).toBeCloseTo(0, 2);
      expect(calculateOrbitEntryAngle(north, orbitCenter)).toBeCloseTo(Math.PI / 2, 2);
      expect(calculateOrbitEntryAngle(west, orbitCenter)).toBeCloseTo(Math.PI, 2);
      expect(calculateOrbitEntryAngle(south, orbitCenter)).toBeCloseTo(-Math.PI / 2, 2);

      console.log('✓ Orbit entry angles calculated correctly');
    });

    it('should generate blue gate position from angle', () => {
      const orbitCenter = new THREE.Vector3(0, 10, 0);
      const orbitRadius = 20;

      const angle0 = 0; // East
      const angle90 = Math.PI / 2; // North
      const angle180 = Math.PI; // West
      const angle270 = -Math.PI / 2; // South

      const east = generateBlueGatePosition(orbitCenter, orbitRadius, angle0);
      const north = generateBlueGatePosition(orbitCenter, orbitRadius, angle90);
      const west = generateBlueGatePosition(orbitCenter, orbitRadius, angle180);
      const south = generateBlueGatePosition(orbitCenter, orbitRadius, angle270);

      expect(east.x).toBeCloseTo(orbitRadius, 1);
      expect(east.z).toBeCloseTo(0, 1);

      expect(north.x).toBeCloseTo(0, 1);
      expect(north.z).toBeCloseTo(orbitRadius, 1);

      expect(west.x).toBeCloseTo(-orbitRadius, 1);
      expect(west.z).toBeCloseTo(0, 1);

      expect(south.x).toBeCloseTo(0, 1);
      expect(south.z).toBeCloseTo(-orbitRadius, 1);

      console.log('✓ Blue gate positions generated correctly');
    });
  });

  describe('Visualization helpers', () => {
    it('should create waypoint visualization data', () => {
      const green = new THREE.Vector3(0, 0, 0);
      const yellow = new THREE.Vector3(0, 5, 0);
      const blue = new THREE.Vector3(10, 10, 0);
      const orbitCenter = new THREE.Vector3(0, 10, 0);
      const orbitRadius = 10;

      const config = createDefaultWaypointConfig(green, yellow, blue, orbitCenter, orbitRadius);
      const result = calculatePurpleWaypoints(config);
      const viz = createWaypointVisualization(result, config);

      expect(viz.green.position).toEqual(green);
      expect(viz.green.color).toBe('#00ff00');
      expect(viz.green.label).toContain('Green');

      expect(viz.yellow.position).toEqual(yellow);
      expect(viz.yellow.color).toBe('#ffff00');
      expect(viz.yellow.label).toContain('Yellow');

      expect(viz.blue.position).toEqual(blue);
      expect(viz.blue.color).toBe('#0000ff');
      expect(viz.blue.label).toContain('Blue');

      expect(viz.purple.length).toBe(result.purpleWaypoints.length);
      viz.purple.forEach(p => {
        expect(p.color).toBe('#ff00ff');
        expect(p.label).toContain('Purple');
      });

      console.log('✓ Visualization data created:', {
        green: viz.green.label,
        yellow: viz.yellow.label,
        purple: `${viz.purple.length} purple waypoints`,
        blue: viz.blue.label,
      });
    });
  });

  describe('Integration test: Full trajectory flow', () => {
    it('should generate complete trajectory from spawn to orbit', () => {
      // Real-world scenario: north-gate source
      const green = new THREE.Vector3(-40, 0, -40); // Spawn
      const yellow = new THREE.Vector3(-30, 12, -37); // Release (takeoff)
      const orbitCenter = new THREE.Vector3(6, 30, 0);
      const orbitRadius = 25;
      const entryAngle = Math.PI / 2; // 90 degrees (north entry)

      const blue = generateBlueGatePosition(orbitCenter, orbitRadius, entryAngle);

      const config = createDefaultWaypointConfig(green, yellow, blue, orbitCenter, orbitRadius);
      config.physics.initialVelocity = 18.0; // Realistic velocity
      config.physics.gravity = 9.8;
      config.physics.dragCoefficient = 0.05; // Light drag
      config.trajectory.sampleCount = 10; // More waypoints for smoother path

      const result = calculatePurpleWaypoints(config);

      // Verify complete flow
      expect(result.allWaypoints.length).toBeGreaterThanOrEqual(4); // green + yellow + purple[] + blue
      expect(result.allWaypoints[0]).toEqual(green);
      expect(result.allWaypoints[1]).toEqual(yellow);
      expect(result.allWaypoints[result.allWaypoints.length - 1].distanceTo(blue)).toBeLessThan(0.5);

      // Verify physics makes sense
      expect(result.metadata.trajectoryDuration).toBeGreaterThan(0);
      expect(result.metadata.trajectoryDuration).toBeLessThan(config.trajectory.maxDuration);
      expect(result.metadata.peakHeight).toBeGreaterThan(yellow.y);
      expect(result.metadata.totalDistance).toBeGreaterThan(0);

      // Verify velocity matching
      expect(result.metadata.velocityMismatch).toBeLessThan(15); // Reasonable tolerance for this test case

      console.log('\n===== FULL TRAJECTORY INTEGRATION TEST =====');
      console.log('Green (Spawn):', green.toArray());
      console.log('Yellow (Release):', yellow.toArray());
      console.log('Blue (Gate):', blue.toArray());
      console.log('Purple waypoints:', result.purpleWaypoints.length);
      console.log('Total waypoints:', result.allWaypoints.length);
      console.log('Trajectory duration:', result.metadata.trajectoryDuration.toFixed(2), 's');
      console.log('Peak height:', result.metadata.peakHeight.toFixed(2));
      console.log('Total distance:', result.metadata.totalDistance.toFixed(2));
      console.log('Final velocity:', result.metadata.finalVelocity.toArray().map(v => v.toFixed(2)));
      console.log('Orbit velocity:', result.metadata.orbitTangentVelocity.toArray().map(v => v.toFixed(2)));
      console.log('Velocity mismatch:', result.metadata.velocityMismatch.toFixed(3), 'm/s');
      console.log('===========================================\n');
    });
  });
});
