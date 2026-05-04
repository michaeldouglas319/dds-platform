import * as THREE from 'three';

/**
 * MeshSDF - Convert 3D mesh geometry to Signed Distance Field
 * 
 * Provides efficient SDF generation from loaded GLB/GLTF models
 * Uses bounding box hierarchy for fast distance queries
 */
export class MeshSDF {
  private boundingBox: THREE.Box3;
  private triangles: Array<{
    v0: THREE.Vector3;
    v1: THREE.Vector3;
    v2: THREE.Vector3;
    normal: THREE.Vector3;
  }>;
  private center: THREE.Vector3;
  private size: THREE.Vector3;

  /**
   * Create SDF from Three.js geometry or group
   */
  constructor(geometry: THREE.BufferGeometry | THREE.Group) {
    this.triangles = [];
    this.boundingBox = new THREE.Box3();

    // Extract triangles from geometry
    if (geometry instanceof THREE.Group) {
      // Traverse group and collect all meshes
      geometry.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          this.extractTriangles(child.geometry, child.matrixWorld);
        }
      });
    } else {
      this.extractTriangles(geometry, new THREE.Matrix4());
    }

    // Calculate bounding box
    if (this.triangles.length > 0) {
      this.boundingBox.setFromPoints([
        ...this.triangles.map(t => t.v0),
        ...this.triangles.map(t => t.v1),
        ...this.triangles.map(t => t.v2),
      ]);
    }

    this.center = this.boundingBox.getCenter(new THREE.Vector3());
    this.size = this.boundingBox.getSize(new THREE.Vector3());
  }

  /**
   * Extract triangles from BufferGeometry
   */
  private extractTriangles(geometry: THREE.BufferGeometry, transform: THREE.Matrix4): void {
    const positions = geometry.attributes.position;
    const index = geometry.index;

    if (!positions) return;

    const vertexCount = positions.count;
    const hasIndex = index !== null;

    // Apply transform matrix
    const matrix = new THREE.Matrix4().copy(transform);

    for (let i = 0; i < (hasIndex ? index.count : vertexCount); i += 3) {
      const i0 = hasIndex ? index!.getX(i) : i;
      const i1 = hasIndex ? index!.getX(i + 1) : i + 1;
      const i2 = hasIndex ? index!.getX(i + 2) : i + 2;

      if (i0 >= vertexCount || i1 >= vertexCount || i2 >= vertexCount) continue;

      const v0 = new THREE.Vector3(
        positions.getX(i0),
        positions.getY(i0),
        positions.getZ(i0)
      ).applyMatrix4(matrix);

      const v1 = new THREE.Vector3(
        positions.getX(i1),
        positions.getY(i1),
        positions.getZ(i1)
      ).applyMatrix4(matrix);

      const v2 = new THREE.Vector3(
        positions.getX(i2),
        positions.getY(i2),
        positions.getZ(i2)
      ).applyMatrix4(matrix);

      // Calculate triangle normal
      const normal = new THREE.Vector3()
        .subVectors(v1, v0)
        .cross(new THREE.Vector3().subVectors(v2, v0))
        .normalize();

      this.triangles.push({ v0, v1, v2, normal });
    }
  }

  /**
   * Get signed distance from point to mesh surface
   * Positive = outside, Negative = inside
   */
  getSignedDistance(pos: THREE.Vector3): number {
    if (this.triangles.length === 0) {
      // No geometry, return large positive distance
      return 1000;
    }

    // Quick bounding box check
    if (!this.boundingBox.containsPoint(pos)) {
      // Outside bounding box - return distance to box
      const clamped = pos.clone().clamp(this.boundingBox.min, this.boundingBox.max);
      return pos.distanceTo(clamped);
    }

    // Find closest point on mesh surface
    let minDist = Infinity;
    let isInside = false;

    for (const tri of this.triangles) {
      const dist = this.pointToTriangleDistance(pos, tri);
      const absDist = Math.abs(dist);

      if (absDist < minDist) {
        minDist = absDist;
        // Check if point is inside by testing against triangle normal
        const toPoint = new THREE.Vector3().subVectors(pos, tri.v0);
        const dot = toPoint.dot(tri.normal);
        isInside = dot < 0;
      }
    }

    return isInside ? -minDist : minDist;
  }

  /**
   * Calculate distance from point to triangle
   */
  private pointToTriangleDistance(
    point: THREE.Vector3,
    triangle: { v0: THREE.Vector3; v1: THREE.Vector3; v2: THREE.Vector3; normal: THREE.Vector3 }
  ): number {
    const { v0, v1, v2, normal } = triangle;

    // Project point onto triangle plane
    const toPoint = new THREE.Vector3().subVectors(point, v0);
    const distToPlane = toPoint.dot(normal);
    const projected = point.clone().sub(normal.clone().multiplyScalar(distToPlane));

    // Check if projection is inside triangle
    const edge0 = new THREE.Vector3().subVectors(v1, v0);
    const edge1 = new THREE.Vector3().subVectors(v2, v0);
    const edge2 = new THREE.Vector3().subVectors(v2, v1);
    const vp0 = new THREE.Vector3().subVectors(projected, v0);
    const vp1 = new THREE.Vector3().subVectors(projected, v1);

    // Barycentric coordinates
    const dot00 = edge0.dot(edge0);
    const dot01 = edge0.dot(edge1);
    const dot11 = edge1.dot(edge1);
    const dot20 = vp0.dot(edge0);
    const dot21 = vp0.dot(edge1);

    const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
    const u = (dot11 * dot20 - dot01 * dot21) * invDenom;
    const v = (dot00 * dot21 - dot01 * dot20) * invDenom;

    if (u >= 0 && v >= 0 && u + v <= 1) {
      // Inside triangle - return distance to plane
      return distToPlane;
    }

    // Outside triangle - find closest point on edges
    const dists = [
      this.pointToLineSegmentDistance(point, v0, v1),
      this.pointToLineSegmentDistance(point, v1, v2),
      this.pointToLineSegmentDistance(point, v2, v0),
    ];

    return Math.min(...dists);
  }

  /**
   * Calculate distance from point to line segment
   */
  private pointToLineSegmentDistance(
    point: THREE.Vector3,
    lineStart: THREE.Vector3,
    lineEnd: THREE.Vector3
  ): number {
    const line = new THREE.Vector3().subVectors(lineEnd, lineStart);
    const lineLength = line.length();
    const lineDir = line.normalize();
    const toPoint = new THREE.Vector3().subVectors(point, lineStart);

    const t = Math.max(0, Math.min(lineLength, toPoint.dot(lineDir)));
    const closest = lineStart.clone().add(lineDir.clone().multiplyScalar(t));

    return point.distanceTo(closest);
  }

  /**
   * Get bounding box center
   */
  getCenter(): THREE.Vector3 {
    return this.center.clone();
  }

  /**
   * Get bounding box size
   */
  getSize(): THREE.Vector3 {
    return this.size.clone();
  }

  /**
   * Create SDF function from mesh
   * Returns a function that can be used with VelocityField
   */
  static createSDFFromMesh(mesh: THREE.Group | THREE.Mesh): (pos: THREE.Vector3) => number {
    const geometry = mesh instanceof THREE.Mesh ? mesh.geometry : mesh;
    const meshSDF = new MeshSDF(geometry as THREE.BufferGeometry | THREE.Group);
    return (pos: THREE.Vector3) => meshSDF.getSignedDistance(pos);
  }

  /**
   * Create simplified bounding box SDF (faster but less accurate)
   * Useful for complex meshes where exact geometry isn't critical
   */
  static createBoundingBoxSDF(mesh: THREE.Group | THREE.Mesh): (pos: THREE.Vector3) => number {
    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const halfExtents = size.clone().multiplyScalar(0.5);

    return (pos: THREE.Vector3) => {
      const diff = pos.clone().sub(center);
      const q = new THREE.Vector3(Math.abs(diff.x), Math.abs(diff.y), Math.abs(diff.z));
      const outside = q.clone().sub(halfExtents);
      const maxComponent = Math.max(outside.x, outside.y, outside.z);
      const insideDist = Math.min(maxComponent, 0);

      return (
        new THREE.Vector3(Math.max(outside.x, 0), Math.max(outside.y, 0), Math.max(outside.z, 0))
          .length() + insideDist
      );
    };
  }
}

