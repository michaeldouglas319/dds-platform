// Common GLSL utilities for CFD shaders
// Based on Trinity's approach with flat 3D textures

// Grid geometry uniforms (set by FluidSimulator)
uniform int Nx;
uniform int Ny;
uniform int Nz;
uniform int Ncol;  // Number of columns in flat texture
uniform int W;     // Texture width
uniform int H;     // Texture height
uniform vec3 L;    // World-space extents of grid
uniform float dL;  // Voxel size (cell size)

// Physics uniforms
uniform float time;
uniform float timestep;
uniform float viscosity;
uniform float vorticity_scale;

// Map fragment coordinate to voxel space position
vec3 mapFragToVs(in ivec2 frag) {
    int iu = frag.x;
    int iv = frag.y;
    int row = int(floor(float(iv) / float(Nz)));
    int col = int(floor(float(iu) / float(Nx)));
    int i = iu - col * Nx;
    int j = col + row * Ncol;
    int k = iv - row * Nz;
    return vec3(float(i), float(j), float(k)) + vec3(0.5);
}

// Map voxel space coordinates to fragment coordinates
ivec2 mapVsToFrag(in ivec3 vsP) {
    int i = vsP.x;
    int j = vsP.y;
    int k = vsP.z;
    int row = int(floor(float(j) / float(Ncol)));
    int col = j - row * Ncol;
    int iu = col * Nx + i;
    int iv = row * Nz + k;
    return ivec2(iu, iv);
}

// Convert slice index and voxel space position to UV coordinates
vec2 slicetoUV(int j, vec3 vsP) {
    int row = int(floor(float(j) / float(Ncol)));
    int col = j - row * Ncol;
    vec2 uv_ll = vec2(float(col * Nx) / float(W), float(row * Nz) / float(H));
    float du = vsP.x / float(W);
    float dv = vsP.z / float(H);
    return uv_ll + vec2(du, dv);
}

// Trilinear interpolation in flat 3D texture
vec4 interp(in sampler2D S, in vec3 wsP) {
    vec3 vsP = wsP / dL;
    float pY = vsP.y - 0.5;
    int jlo = clamp(int(floor(pY)), 0, Ny - 1);
    int jhi = clamp(jlo + 1, 0, Ny - 1);
    float flo = float(jhi) - pY;
    float fhi = 1.0 - flo;
    vec2 uv_lo = slicetoUV(jlo, vsP);
    vec2 uv_hi = slicetoUV(jhi, vsP);
    vec4 Slo = texture(S, uv_lo);
    vec4 Shi = texture(S, uv_hi);
    return flo * Slo + fhi * Shi;
}

// Clamp world space position to grid bounds
vec3 clampToBounds(in vec3 wsP) {
    vec3 voxel = vec3(dL);
    return clamp(wsP, voxel, L - voxel);
}


