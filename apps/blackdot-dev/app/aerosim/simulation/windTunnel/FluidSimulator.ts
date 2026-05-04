import * as THREE from 'three';
import {
  advectionShader,
  diffusionShader,
  divergenceShader,
  poissonShader,
  gradientShader,
  vorticityShader,
  boundaryShader,
  inflowShader,
} from '../../shaders/cfd/shaderLoader';

/**
 * FluidSimulator - Real-time 3D Navier-Stokes CFD solver
 * Uses Stable Fluids method with GPU-accelerated shaders
 * Based on Trinity's approach with flat 3D textures
 */
export class FluidSimulator {
  private renderer: THREE.WebGLRenderer;
  private gridRes: THREE.Vector3;
  private bounds: THREE.Box3;
  private cellSize: number;
  
  // Simulation parameters
  private dt: number = 0.01;
  private viscosity: number = 0.001;
  private vorticityScale: number = 1.0;
  private pressureIterations: number = 40;
  private diffusionIterations: number = 20;
  
  // Flat 3D texture dimensions (2D textures representing 3D grid)
  private textureWidth: number;
  private textureHeight: number;
  private numCols: number; // Number of columns in flat texture
  
  // Render targets for ping-pong buffers
  private velocityRT: THREE.WebGLRenderTarget;
  private velocityTempRT: THREE.WebGLRenderTarget;
  private pressureRT: THREE.WebGLRenderTarget;
  private pressureTempRT: THREE.WebGLRenderTarget;
  private divergenceRT: THREE.WebGLRenderTarget;
  private sdfRT: THREE.WebGLRenderTarget; // Precomputed SDF texture
  
  // Scene setup for rendering passes
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private quad: THREE.Mesh;
  
  // Shader materials for CFD steps (initialized in initializeShaders())
  private advectionMaterial!: THREE.ShaderMaterial;
  private diffusionMaterial!: THREE.ShaderMaterial;
  private divergenceMaterial!: THREE.ShaderMaterial;
  private poissonMaterial!: THREE.ShaderMaterial;
  private gradientMaterial!: THREE.ShaderMaterial;
  private vorticityMaterial!: THREE.ShaderMaterial;
  private boundaryMaterial!: THREE.ShaderMaterial;
  private inflowMaterial!: THREE.ShaderMaterial;
  
  // Mesh SDF for boundaries (hybrid approach)
  private meshSDF?: (pos: THREE.Vector3) => number;
  private meshBounds?: THREE.Box3;
  private sdfData: Float32Array | null = null; // Precomputed coarse SDF
  private sdfTexture: THREE.DataTexture | null = null;
  
  // CPU fallback for velocity sampling (if GPU readback unavailable)
  private velocityData: Float32Array | null = null;

  // Inflow parameters
  private inflowVelocity: THREE.Vector3 = new THREE.Vector3(10, 0, 0);

  // Reference to common uniforms for dynamic updates
  private commonUniformsRef: Record<string, { value: number | THREE.Vector3 }> | null = null;
  
  constructor(
    renderer: THREE.WebGLRenderer,
    bounds: THREE.Box3,
    initialFlowSpeed: number = 10.0,
    gridResolution: number = 48,
    meshSDF?: (pos: THREE.Vector3) => number,
    meshBounds?: THREE.Box3
  ) {
    this.renderer = renderer;
    this.bounds = bounds.clone();
    this.meshSDF = meshSDF;
    this.meshBounds = meshBounds;
    
    // Grid resolution (48x48x48 for balanced performance)
    this.gridRes = new THREE.Vector3(gridResolution, gridResolution, gridResolution);
    
    // Calculate cell size to match bounds
    const size = bounds.getSize(new THREE.Vector3());
    this.cellSize = Math.max(size.x / gridResolution, size.y / gridResolution, size.z / gridResolution);
    
    // Calculate flat 3D texture dimensions (following Trinity's approach)
    // Pack 3D grid into 2D texture: arrange slices in rows/columns
    this.numCols = Math.ceil(Math.sqrt(gridResolution));
    this.textureWidth = this.numCols * gridResolution;
    this.textureHeight = Math.ceil(gridResolution / this.numCols) * gridResolution;
    
    // Initialize render targets
    this.velocityRT = this.createRenderTarget();
    this.velocityTempRT = this.createRenderTarget();
    this.pressureRT = this.createRenderTarget();
    this.pressureTempRT = this.createRenderTarget();
    this.divergenceRT = this.createRenderTarget();
    this.sdfRT = this.createRenderTarget();
    
    // Setup rendering scene FIRST (needed for initializeVelocity)
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(geometry);
    this.scene.add(this.quad);
    
    // Initialize shader materials
    this.initializeShaders();
    
    // Initialize with uniform flow (after quad is created)
    this.initializeVelocity(initialFlowSpeed);
    
    // Precompute SDF if mesh provided
    if (meshSDF && meshBounds) {
      this.precomputeSDF(meshSDF);
    }
  }
  
  /**
   * Create render target for 3D field storage
   */
  private createRenderTarget(): THREE.WebGLRenderTarget {
    const rt = new THREE.WebGLRenderTarget(this.textureWidth, this.textureHeight, {
      type: THREE.FloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
    });
    return rt;
  }
  
  /**
   * Initialize shader materials
   */
  private initializeShaders(): void {
    const boundsSize = this.bounds.getSize(new THREE.Vector3());
    
    const commonUniforms = {
      Nx: { value: this.gridRes.x },
      Ny: { value: this.gridRes.y },
      Nz: { value: this.gridRes.z },
      Ncol: { value: this.numCols },
      W: { value: this.textureWidth },
      H: { value: this.textureHeight },
      L: { value: boundsSize },
      dL: { value: this.cellSize },
      time: { value: 0 },
      timestep: { value: this.dt },
      viscosity: { value: this.viscosity },
      vorticity_scale: { value: this.vorticityScale },
    };
    
    this.advectionMaterial = new THREE.ShaderMaterial({
      vertexShader: advectionShader.vertex,
      fragmentShader: advectionShader.fragment,
      uniforms: {
        ...commonUniforms,
        velocityTex: { value: this.velocityRT.texture },
      },
    });
    
    // Store reference to common uniforms for dynamic updates
    this.commonUniformsRef = commonUniforms;
    
    this.diffusionMaterial = new THREE.ShaderMaterial({
      vertexShader: diffusionShader.vertex,
      fragmentShader: diffusionShader.fragment,
      uniforms: {
        ...commonUniforms,
        velocityTex: { value: this.velocityRT.texture },
      },
    });
    
    this.divergenceMaterial = new THREE.ShaderMaterial({
      vertexShader: divergenceShader.vertex,
      fragmentShader: divergenceShader.fragment,
      uniforms: {
        ...commonUniforms,
        velocityTex: { value: this.velocityRT.texture },
      },
    });
    
    this.poissonMaterial = new THREE.ShaderMaterial({
      vertexShader: poissonShader.vertex,
      fragmentShader: poissonShader.fragment,
      uniforms: {
        ...commonUniforms,
        pressureTex: { value: this.pressureRT.texture },
        divergenceTex: { value: this.divergenceRT.texture },
      },
    });
    
    this.gradientMaterial = new THREE.ShaderMaterial({
      vertexShader: gradientShader.vertex,
      fragmentShader: gradientShader.fragment,
      uniforms: {
        ...commonUniforms,
        velocityTex: { value: this.velocityRT.texture },
        pressureTex: { value: this.pressureRT.texture },
      },
    });
    
    this.vorticityMaterial = new THREE.ShaderMaterial({
      vertexShader: vorticityShader.vertex,
      fragmentShader: vorticityShader.fragment,
      uniforms: {
        ...commonUniforms,
        velocityTex: { value: this.velocityRT.texture },
      },
    });
    
    this.boundaryMaterial = new THREE.ShaderMaterial({
      vertexShader: boundaryShader.vertex,
      fragmentShader: boundaryShader.fragment,
      uniforms: {
        ...commonUniforms,
        velocityTex: { value: this.velocityRT.texture },
        sdfTex: { value: this.sdfRT.texture },
        boundaryFalloff: { value: 2.0 },
      },
    });
    
    this.inflowMaterial = new THREE.ShaderMaterial({
      vertexShader: inflowShader.vertex,
      fragmentShader: inflowShader.fragment,
      uniforms: {
        ...commonUniforms,
        velocityTex: { value: this.velocityRT.texture },
        inflowVelocity: { value: this.inflowVelocity },
        inflowX: { value: this.bounds.min.x },
      },
    });
  }
  
  /**
   * Initialize velocity field with uniform flow
   */
  private initializeVelocity(flowSpeed: number): void {
    this.inflowVelocity.set(flowSpeed, 0, 0);
    
    const size = this.textureWidth * this.textureHeight * 4; // RGBA
    const data = new Float32Array(size);
    
    // Initialize with uniform flow in x-direction
    for (let i = 0; i < size; i += 4) {
      data[i] = flowSpeed;     // vx
      data[i + 1] = 0;         // vy
      data[i + 2] = 0;         // vz
      data[i + 3] = 0;         // padding
    }
    
    // Upload to texture
    const texture = new THREE.DataTexture(data, this.textureWidth, this.textureHeight, THREE.RGBAFormat, THREE.FloatType);
    texture.needsUpdate = true;
    
    // Copy to render target using a simple copy shader
    const copyMaterial = new THREE.MeshBasicMaterial({ map: texture });
    this.quad.material = copyMaterial;
    
    const oldAutoClear = this.renderer.autoClear;
    this.renderer.autoClear = false;
    this.renderer.setRenderTarget(this.velocityRT);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = oldAutoClear;
    
    // Store for CPU fallback
    this.velocityData = data;
  }
  
  /**
   * Precompute coarse SDF on grid
   */
  private precomputeSDF(sdf: (pos: THREE.Vector3) => number): void {
    const size = this.gridRes.x * this.gridRes.y * this.gridRes.z;
    this.sdfData = new Float32Array(size);
    
    const boundsSize = this.bounds.getSize(new THREE.Vector3());
    
    for (let k = 0; k < this.gridRes.z; k++) {
      for (let j = 0; j < this.gridRes.y; j++) {
        for (let i = 0; i < this.gridRes.x; i++) {
          // Convert grid coordinates to world coordinates
          const x = this.bounds.min.x + (i / (this.gridRes.x - 1)) * boundsSize.x;
          const y = this.bounds.min.y + (j / (this.gridRes.y - 1)) * boundsSize.y;
          const z = this.bounds.min.z + (k / (this.gridRes.z - 1)) * boundsSize.z;
          
          const pos = new THREE.Vector3(x, y, z);
          const index = k * this.gridRes.y * this.gridRes.x + j * this.gridRes.x + i;
          this.sdfData[index] = sdf(pos);
        }
      }
    }
    
    // Upload to texture
    const textureData = new Float32Array(this.textureWidth * this.textureHeight * 4);
    // Map 3D SDF to 2D texture (flat 3D mapping)
    for (let k = 0; k < this.gridRes.z; k++) {
      for (let j = 0; j < this.gridRes.y; j++) {
        for (let i = 0; i < this.gridRes.x; i++) {
          const index3D = k * this.gridRes.y * this.gridRes.x + j * this.gridRes.x + i;
          const sdfValue = this.sdfData[index3D];
          
          // Map to 2D texture coordinates (flat 3D)
          const row = Math.floor(j / this.numCols);
          const col = j % this.numCols;
          const u = col * this.gridRes.x + i;
          const v = row * this.gridRes.z + k;
          const index2D = (v * this.textureWidth + u) * 4;
          
          textureData[index2D] = sdfValue;
          textureData[index2D + 1] = 0;
          textureData[index2D + 2] = 0;
          textureData[index2D + 3] = 0;
        }
      }
    }
    
    const texture = new THREE.DataTexture(textureData, this.textureWidth, this.textureHeight, THREE.RGBAFormat, THREE.FloatType);
    texture.needsUpdate = true;
    this.sdfTexture = texture;
    
    // Copy to render target
    const copyMaterial = new THREE.MeshBasicMaterial({ map: texture });
    this.quad.material = copyMaterial;
    
    const oldAutoClear = this.renderer.autoClear;
    this.renderer.autoClear = false;
    this.renderer.setRenderTarget(this.sdfRT);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = oldAutoClear;
    
    // Update boundary material uniform
    if (this.boundaryMaterial) {
      this.boundaryMaterial.uniforms.sdfTex.value = this.sdfRT.texture;
    }
  }
  
  /**
   * Update simulation (run CFD steps)
   */
  public update(): void {
    // Step 1: Add forces/inflow
    this.addForces();
    
    // Step 2: Advect velocity (RK4)
    this.advect();
    
    // Step 3: Apply vorticity confinement
    if (this.vorticityScale > 0) {
      this.applyVorticity();
    }
    
    // Step 4: Diffuse (viscosity)
    this.diffuse();
    
    // Step 5: Project (divergence + Poisson + gradient subtract)
    this.project();
    
    // Step 6: Apply boundaries (SDF)
    this.applyBoundaries();
    
    // Step 7: Sync velocity data from GPU to CPU for particle sampling
    this.syncVelocityData();
  }
  
  /**
   * Read velocity data back from GPU texture to CPU
   * This allows particles to sample the updated velocity field
   * Note: This is expensive, so we only do it periodically
   */
  private syncVelocityData(): void {
    // Only sync every few frames to avoid performance hit
    // The velocityData will be slightly stale, but CFD changes are gradual
    if (Math.random() > 0.1) return; // Only sync 10% of the time
    
    const size = this.textureWidth * this.textureHeight * 4;
    if (!this.velocityData) {
      this.velocityData = new Float32Array(size);
    }
    
    try {
      // Read from the current velocity render target
      // Note: readRenderTargetPixels may not work with FloatType in all browsers
      // If it fails, we'll fall back to using the initial uniform flow
      const pixels = new Float32Array(size);
      this.renderer.setRenderTarget(this.velocityRT);
      this.renderer.readRenderTargetPixels(
        this.velocityRT,
        0,
        0,
        this.textureWidth,
        this.textureHeight,
        pixels
      );
      this.renderer.setRenderTarget(null);
      
      // Copy to velocityData
      this.velocityData.set(pixels);
    } catch (e) {
      // GPU readback failed - this is expected in some browsers
      // Particles will use the last known velocity data or fall back to uniform flow
      console.warn('⚠️ GPU readback failed, using cached velocity data:', e);
    }
  }
  
  /**
   * Sample velocity at world position (for particle advection)
   */
  public sampleVelocity(worldPos: THREE.Vector3): THREE.Vector3 {
    // For now, use CPU fallback with trilinear interpolation
    // TODO: Implement GPU readback or use compute shader if available
    
    if (!this.velocityData) {
      return new THREE.Vector3(10, 0, 0); // Default uniform flow
    }
    
    // Clamp to bounds
    const clampedPos = worldPos.clone().clamp(this.bounds.min, this.bounds.max);
    
    // Convert world to grid coordinates
    const boundsSize = this.bounds.getSize(new THREE.Vector3());
    const gridPos = new THREE.Vector3(
      ((clampedPos.x - this.bounds.min.x) / boundsSize.x) * (this.gridRes.x - 1),
      ((clampedPos.y - this.bounds.min.y) / boundsSize.y) * (this.gridRes.y - 1),
      ((clampedPos.z - this.bounds.min.z) / boundsSize.z) * (this.gridRes.z - 1)
    );
    
    // Trilinear interpolation
    const xi = Math.floor(gridPos.x);
    const yi = Math.floor(gridPos.y);
    const zi = Math.floor(gridPos.z);
    
    const fx = gridPos.x - xi;
    const fy = gridPos.y - yi;
    const fz = gridPos.z - zi;
    
    const x0 = Math.max(0, Math.min(xi, this.gridRes.x - 1));
    const x1 = Math.max(0, Math.min(xi + 1, this.gridRes.x - 1));
    const y0 = Math.max(0, Math.min(yi, this.gridRes.y - 1));
    const y1 = Math.max(0, Math.min(yi + 1, this.gridRes.y - 1));
    const z0 = Math.max(0, Math.min(zi, this.gridRes.z - 1));
    const z1 = Math.max(0, Math.min(zi + 1, this.gridRes.z - 1));
    
    const getVel = (i: number, j: number, k: number): THREE.Vector3 => {
      if (!this.velocityData) {
        return new THREE.Vector3(0, 0, 0);
      }
      const index3D = k * this.gridRes.y * this.gridRes.x + j * this.gridRes.x + i;
      const row = Math.floor(j / this.numCols);
      const col = j % this.numCols;
      const u = col * this.gridRes.x + i;
      const v = row * this.gridRes.z + k;
      const index2D = (v * this.textureWidth + u) * 4;
      
      return new THREE.Vector3(
        this.velocityData[index2D],
        this.velocityData[index2D + 1],
        this.velocityData[index2D + 2]
      );
    };
    
    const v000 = getVel(x0, y0, z0);
    const v100 = getVel(x1, y0, z0);
    const v010 = getVel(x0, y1, z0);
    const v110 = getVel(x1, y1, z0);
    const v001 = getVel(x0, y0, z1);
    const v101 = getVel(x1, y0, z1);
    const v011 = getVel(x0, y1, z1);
    const v111 = getVel(x1, y1, z1);
    
    // Trilinear interpolation
    const vx = 
      v000.x * (1 - fx) * (1 - fy) * (1 - fz) +
      v100.x * fx * (1 - fy) * (1 - fz) +
      v010.x * (1 - fx) * fy * (1 - fz) +
      v110.x * fx * fy * (1 - fz) +
      v001.x * (1 - fx) * (1 - fy) * fz +
      v101.x * fx * (1 - fy) * fz +
      v011.x * (1 - fx) * fy * fz +
      v111.x * fx * fy * fz;
    
    const vy = 
      v000.y * (1 - fx) * (1 - fy) * (1 - fz) +
      v100.y * fx * (1 - fy) * (1 - fz) +
      v010.y * (1 - fx) * fy * (1 - fz) +
      v110.y * fx * fy * (1 - fz) +
      v001.y * (1 - fx) * (1 - fy) * fz +
      v101.y * fx * (1 - fy) * fz +
      v011.y * (1 - fx) * fy * fz +
      v111.y * fx * fy * fz;
    
    const vz = 
      v000.z * (1 - fx) * (1 - fy) * (1 - fz) +
      v100.z * fx * (1 - fy) * (1 - fz) +
      v010.z * (1 - fx) * fy * (1 - fz) +
      v110.z * fx * fy * (1 - fz) +
      v001.z * (1 - fx) * (1 - fy) * fz +
      v101.z * fx * (1 - fy) * fz +
      v011.z * (1 - fx) * fy * fz +
      v111.z * fx * fy * fz;
    
    return new THREE.Vector3(vx, vy, vz);
  }
  
  /**
   * Get bounds
   */
  public getBounds(): THREE.Box3 {
    return this.bounds.clone();
  }
  
  /**
   * Get grid resolution
   */
  public getResolution(): THREE.Vector3 {
    return this.gridRes.clone();
  }
  
  /**
   * Set simulation parameters
   */
  public setParameters(params: {
    dt?: number;
    viscosity?: number;
    vorticityScale?: number;
    pressureIterations?: number;
    diffusionIterations?: number;
  }): void {
    let needsUniformUpdate = false;
    
    if (params.dt !== undefined && params.dt !== this.dt) {
      this.dt = params.dt;
      needsUniformUpdate = true;
    }
    if (params.viscosity !== undefined && params.viscosity !== this.viscosity) {
      this.viscosity = params.viscosity;
      needsUniformUpdate = true;
    }
    if (params.vorticityScale !== undefined && params.vorticityScale !== this.vorticityScale) {
      this.vorticityScale = params.vorticityScale;
      needsUniformUpdate = true;
    }
    if (params.pressureIterations !== undefined) {
      this.pressureIterations = params.pressureIterations;
    }
    if (params.diffusionIterations !== undefined) {
      this.diffusionIterations = params.diffusionIterations;
    }
    
    // Update shader uniforms if parameters changed
    if (needsUniformUpdate) {
      this.updateCommonUniforms();
    }
  }
  
  /**
   * Add forces/inflow
   */
  private addForces(): void {
    this.inflowMaterial.uniforms.time.value += this.dt;
    this.inflowMaterial.uniforms.velocityTex.value = this.velocityRT.texture;
    
    this.quad.material = this.inflowMaterial;
    
    const oldAutoClear = this.renderer.autoClear;
    this.renderer.autoClear = false;
    this.renderer.setRenderTarget(this.velocityTempRT);
    this.renderer.render(this.scene, this.camera);
    
    // Swap buffers
    const temp = this.velocityRT;
    this.velocityRT = this.velocityTempRT;
    this.velocityTempRT = temp;
    
    // Update uniforms
    this.updateVelocityUniforms();
    
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = oldAutoClear;
  }
  
  /**
   * Advect velocity field
   */
  private advect(): void {
    this.advectionMaterial.uniforms.time.value += this.dt;
    this.advectionMaterial.uniforms.velocityTex.value = this.velocityRT.texture;
    
    this.quad.material = this.advectionMaterial;
    
    const oldAutoClear = this.renderer.autoClear;
    this.renderer.autoClear = false;
    this.renderer.setRenderTarget(this.velocityTempRT);
    this.renderer.render(this.scene, this.camera);
    
    // Swap buffers
    const temp = this.velocityRT;
    this.velocityRT = this.velocityTempRT;
    this.velocityTempRT = temp;
    
    this.updateVelocityUniforms();
    
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = oldAutoClear;
  }
  
  /**
   * Apply vorticity confinement
   */
  private applyVorticity(): void {
    this.vorticityMaterial.uniforms.time.value += this.dt;
    this.vorticityMaterial.uniforms.velocityTex.value = this.velocityRT.texture;
    
    this.quad.material = this.vorticityMaterial;
    
    const oldAutoClear = this.renderer.autoClear;
    this.renderer.autoClear = false;
    this.renderer.setRenderTarget(this.velocityTempRT);
    this.renderer.render(this.scene, this.camera);
    
    // Swap buffers
    const temp = this.velocityRT;
    this.velocityRT = this.velocityTempRT;
    this.velocityTempRT = temp;
    
    this.updateVelocityUniforms();
    
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = oldAutoClear;
  }
  
  /**
   * Diffuse velocity (viscosity)
   */
  private diffuse(): void {
    this.diffusionMaterial.uniforms.velocityTex.value = this.velocityRT.texture;
    
    // Multiple Jacobi iterations
    for (let i = 0; i < this.diffusionIterations; i++) {
      this.quad.material = this.diffusionMaterial;
      
      const oldAutoClear = this.renderer.autoClear;
      this.renderer.autoClear = false;
      this.renderer.setRenderTarget(this.velocityTempRT);
      this.renderer.render(this.scene, this.camera);
      
      // Swap buffers
      const temp = this.velocityRT;
      this.velocityRT = this.velocityTempRT;
      this.velocityTempRT = temp;
      
      this.diffusionMaterial.uniforms.velocityTex.value = this.velocityRT.texture;
      
      this.renderer.setRenderTarget(null);
      this.renderer.autoClear = oldAutoClear;
    }
    
    this.updateVelocityUniforms();
  }
  
  /**
   * Project velocity (divergence-free)
   */
  private project(): void {
    // Step 1: Compute divergence
    this.divergenceMaterial.uniforms.velocityTex.value = this.velocityRT.texture;
    this.quad.material = this.divergenceMaterial;
    
    const oldAutoClear = this.renderer.autoClear;
    this.renderer.autoClear = false;
    this.renderer.setRenderTarget(this.divergenceRT);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = oldAutoClear;
    
    // Step 2: Solve Poisson equation for pressure (Jacobi iterations)
    this.poissonMaterial.uniforms.divergenceTex.value = this.divergenceRT.texture;
    
    // Clear pressure
    this.renderer.setRenderTarget(this.pressureRT);
    this.renderer.clear();
    this.renderer.setRenderTarget(null);
    
    for (let i = 0; i < this.pressureIterations; i++) {
      this.poissonMaterial.uniforms.pressureTex.value = this.pressureRT.texture;
      this.quad.material = this.poissonMaterial;
      
      this.renderer.autoClear = false;
      this.renderer.setRenderTarget(this.pressureTempRT);
      this.renderer.render(this.scene, this.camera);
      
      // Swap buffers
      const temp = this.pressureRT;
      this.pressureRT = this.pressureTempRT;
      this.pressureTempRT = temp;
      
      this.renderer.setRenderTarget(null);
    }
    
    // Step 3: Subtract pressure gradient from velocity
    this.gradientMaterial.uniforms.velocityTex.value = this.velocityRT.texture;
    this.gradientMaterial.uniforms.pressureTex.value = this.pressureRT.texture;
    this.quad.material = this.gradientMaterial;
    
    this.renderer.autoClear = false;
    this.renderer.setRenderTarget(this.velocityTempRT);
    this.renderer.render(this.scene, this.camera);
    
    // Swap buffers
    const temp = this.velocityRT;
    this.velocityRT = this.velocityTempRT;
    this.velocityTempRT = temp;
    
    this.updateVelocityUniforms();
    
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = oldAutoClear;
  }
  
  /**
   * Apply boundaries using SDF
   */
  private applyBoundaries(): void {
    if (!this.sdfTexture) return;
    
    this.boundaryMaterial.uniforms.velocityTex.value = this.velocityRT.texture;
    this.boundaryMaterial.uniforms.sdfTex.value = this.sdfRT.texture;
    this.quad.material = this.boundaryMaterial;
    
    const oldAutoClear = this.renderer.autoClear;
    this.renderer.autoClear = false;
    this.renderer.setRenderTarget(this.velocityTempRT);
    this.renderer.render(this.scene, this.camera);
    
    // Swap buffers
    const temp = this.velocityRT;
    this.velocityRT = this.velocityTempRT;
    this.velocityTempRT = temp;
    
    this.updateVelocityUniforms();
    
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = oldAutoClear;
  }
  
  /**
   * Update velocity texture uniforms in all materials
   */
  private updateVelocityUniforms(): void {
    this.advectionMaterial.uniforms.velocityTex.value = this.velocityRT.texture;
    this.diffusionMaterial.uniforms.velocityTex.value = this.velocityRT.texture;
    this.divergenceMaterial.uniforms.velocityTex.value = this.velocityRT.texture;
    this.gradientMaterial.uniforms.velocityTex.value = this.velocityRT.texture;
    this.vorticityMaterial.uniforms.velocityTex.value = this.velocityRT.texture;
    this.boundaryMaterial.uniforms.velocityTex.value = this.velocityRT.texture;
    this.inflowMaterial.uniforms.velocityTex.value = this.velocityRT.texture;
  }
  
  /**
   * Update common uniforms in all shader materials
   * Called when parameters change
   */
  private updateCommonUniforms(): void {
    // Update the stored uniform values
    if (this.commonUniformsRef) {
      this.commonUniformsRef.timestep.value = this.dt;
      this.commonUniformsRef.viscosity.value = this.viscosity;
      this.commonUniformsRef.vorticity_scale.value = this.vorticityScale;
    }
    
    // Also update materials directly (in case commonUniformsRef isn't set)
    this.advectionMaterial.uniforms.timestep.value = this.dt;
    this.diffusionMaterial.uniforms.timestep.value = this.dt;
    this.diffusionMaterial.uniforms.viscosity.value = this.viscosity;
    this.gradientMaterial.uniforms.timestep.value = this.dt;
    this.vorticityMaterial.uniforms.timestep.value = this.dt;
    this.vorticityMaterial.uniforms.vorticity_scale.value = this.vorticityScale;
  }
  
  /**
   * Dispose resources
   */
  public dispose(): void {
    this.velocityRT.dispose();
    this.velocityTempRT.dispose();
    this.pressureRT.dispose();
    this.pressureTempRT.dispose();
    this.divergenceRT.dispose();
    this.sdfRT.dispose();
  }
}

