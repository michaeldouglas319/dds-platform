/**
 * Shader loader utility for CFD shaders
 * Loads GLSL shader files and combines common.glsl with fragment shaders
 */

// Common shader code (will be inlined)
const commonShaderCode = `
// Common GLSL utilities for CFD shaders
uniform int Nx;
uniform int Ny;
uniform int Nz;
uniform int Ncol;
uniform int W;
uniform int H;
uniform vec3 L;
uniform float dL;
uniform float time;
uniform float timestep;
uniform float viscosity;
uniform float vorticity_scale;

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

vec2 slicetoUV(int j, vec3 vsP) {
    int row = int(floor(float(j) / float(Ncol)));
    int col = j - row * Ncol;
    vec2 uv_ll = vec2(float(col * Nx) / float(W), float(row * Nz) / float(H));
    float du = vsP.x / float(W);
    float dv = vsP.z / float(H);
    return uv_ll + vec2(du, dv);
}

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

vec3 clampToBounds(in vec3 wsP) {
    vec3 voxel = vec3(dL);
    return clamp(wsP, voxel, L - voxel);
}
`;

// Vertex shader for fullscreen quad
const vertexShader = `
varying vec2 v_texcoord;

void main() {
    v_texcoord = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Advection shader
export const advectionShader = {
  vertex: vertexShader,
  fragment: commonShaderCode + `
    precision highp float;
    
    uniform sampler2D velocityTex;
    
    varying vec2 v_texcoord;
    
    vec3 back_advect(in vec3 wsP, in vec3 vX, float h) {
        vec3 k1 = vX;
        vec3 k2 = interp(velocityTex, clampToBounds(wsP - 0.5 * h * k1)).xyz;
        vec3 k3 = interp(velocityTex, clampToBounds(wsP - 0.5 * h * k2)).xyz;
        vec3 k4 = interp(velocityTex, clampToBounds(wsP - h * k3)).xyz;
        return clampToBounds(wsP - h * (k1 + 2.0 * k2 + 2.0 * k3 + k4) / 6.0);
    }
    
    void main() {
        ivec2 frag = ivec2(gl_FragCoord.xy);
        vec3 vsP = mapFragToVs(frag);
        vec3 wsP = vsP * dL;
        
        vec3 v0 = texture(velocityTex, v_texcoord).xyz;
        vec3 wsP_back = back_advect(wsP, v0, timestep);
        vec3 v = interp(velocityTex, wsP_back).xyz;
        
        gl_FragColor = vec4(v, 0.0);
    }
  `,
};

// Diffusion shader
export const diffusionShader = {
  vertex: vertexShader,
  fragment: commonShaderCode + `
    precision highp float;
    
    uniform sampler2D velocityTex;
    
    varying vec2 v_texcoord;
    
    void main() {
        ivec2 frag = ivec2(gl_FragCoord.xy);
        ivec3 vsPi = ivec3(floor(mapFragToVs(frag)));
        
        int ix = vsPi.x;
        int iy = vsPi.y;
        int iz = vsPi.z;
        
        ivec3 X_ip = ivec3(min(ix + 1, Nx - 1), iy, iz);
        ivec3 X_in = ivec3(max(ix - 1, 0), iy, iz);
        ivec3 X_jp = ivec3(ix, min(iy + 1, Ny - 1), iz);
        ivec3 X_jn = ivec3(ix, max(iy - 1, 0), iz);
        ivec3 X_kp = ivec3(ix, iy, min(iz + 1, Nz - 1));
        ivec3 X_kn = ivec3(ix, iy, max(iz - 1, 0));
        
        vec3 v_ip = texture(velocityTex, slicetoUV(X_jp.y, vec3(float(X_ip.x), float(X_ip.y), float(X_ip.z)) * dL)).xyz;
        vec3 v_in = texture(velocityTex, slicetoUV(X_jn.y, vec3(float(X_in.x), float(X_in.y), float(X_in.z)) * dL)).xyz;
        vec3 v_jp = texture(velocityTex, slicetoUV(X_jp.y, vec3(float(X_jp.x), float(X_jp.y), float(X_jp.z)) * dL)).xyz;
        vec3 v_jn = texture(velocityTex, slicetoUV(X_jn.y, vec3(float(X_jn.x), float(X_jn.y), float(X_jn.z)) * dL)).xyz;
        vec3 v_kp = texture(velocityTex, slicetoUV(X_kp.y, vec3(float(X_kp.x), float(X_kp.y), float(X_kp.z)) * dL)).xyz;
        vec3 v_kn = texture(velocityTex, slicetoUV(X_kn.y, vec3(float(X_kn.x), float(X_kn.y), float(X_kn.z)) * dL)).xyz;
        
        vec3 v_center = texture(velocityTex, v_texcoord).xyz;
        
        float alpha = viscosity * timestep / (dL * dL);
        float beta = 1.0 + 6.0 * alpha;
        
        vec3 laplacian = (v_ip + v_in + v_jp + v_jn + v_kp + v_kn - 6.0 * v_center);
        vec3 v_new = (v_center + alpha * laplacian) / beta;
        
        gl_FragColor = vec4(v_new, 0.0);
    }
  `,
};

// Divergence shader
export const divergenceShader = {
  vertex: vertexShader,
  fragment: commonShaderCode + `
    precision highp float;
    
    uniform sampler2D velocityTex;
    
    varying vec2 v_texcoord;
    
    void main() {
        ivec2 frag = ivec2(gl_FragCoord.xy);
        ivec3 vsPi = ivec3(floor(mapFragToVs(frag)));
        
        int ix = vsPi.x;
        int iy = vsPi.y;
        int iz = vsPi.z;
        
        ivec3 X_ip = ivec3(min(ix + 1, Nx - 1), iy, iz);
        ivec3 X_in = ivec3(max(ix - 1, 0), iy, iz);
        ivec3 X_jp = ivec3(ix, min(iy + 1, Ny - 1), iz);
        ivec3 X_jn = ivec3(ix, max(iy - 1, 0), iz);
        ivec3 X_kp = ivec3(ix, iy, min(iz + 1, Nz - 1));
        ivec3 X_kn = ivec3(ix, iy, max(iz - 1, 0));
        
        vec3 v_ip = texture(velocityTex, slicetoUV(X_jp.y, vec3(float(X_ip.x), float(X_ip.y), float(X_ip.z)) * dL)).xyz;
        vec3 v_in = texture(velocityTex, slicetoUV(X_jn.y, vec3(float(X_in.x), float(X_in.y), float(X_in.z)) * dL)).xyz;
        vec3 v_jp = texture(velocityTex, slicetoUV(X_jp.y, vec3(float(X_jp.x), float(X_jp.y), float(X_jp.z)) * dL)).xyz;
        vec3 v_jn = texture(velocityTex, slicetoUV(X_jn.y, vec3(float(X_jn.x), float(X_jn.y), float(X_jn.z)) * dL)).xyz;
        vec3 v_kp = texture(velocityTex, slicetoUV(X_kp.y, vec3(float(X_kp.x), float(X_kp.y), float(X_kp.z)) * dL)).xyz;
        vec3 v_kn = texture(velocityTex, slicetoUV(X_kn.y, vec3(float(X_kn.x), float(X_kn.y), float(X_kn.z)) * dL)).xyz;
        
        float div = (v_ip.x - v_in.x) / (2.0 * dL) +
                    (v_jp.y - v_jn.y) / (2.0 * dL) +
                    (v_kp.z - v_kn.z) / (2.0 * dL);
        
        gl_FragColor = vec4(div, 0.0, 0.0, 0.0);
    }
  `,
};

// Poisson shader
export const poissonShader = {
  vertex: vertexShader,
  fragment: commonShaderCode + `
    precision highp float;
    
    uniform sampler2D pressureTex;
    uniform sampler2D divergenceTex;
    
    varying vec2 v_texcoord;
    
    void main() {
        ivec2 frag = ivec2(gl_FragCoord.xy);
        ivec3 vsPi = ivec3(floor(mapFragToVs(frag)));
        
        int ix = vsPi.x;
        int iy = vsPi.y;
        int iz = vsPi.z;
        
        ivec3 X_ip = ivec3(min(ix + 1, Nx - 1), iy, iz);
        ivec3 X_in = ivec3(max(ix - 1, 0), iy, iz);
        ivec3 X_jp = ivec3(ix, min(iy + 1, Ny - 1), iz);
        ivec3 X_jn = ivec3(ix, max(iy - 1, 0), iz);
        ivec3 X_kp = ivec3(ix, iy, min(iz + 1, Nz - 1));
        ivec3 X_kn = ivec3(ix, iy, max(iz - 1, 0));
        
        float p_ip = texture(pressureTex, slicetoUV(X_jp.y, vec3(float(X_ip.x), float(X_ip.y), float(X_ip.z)) * dL)).r;
        float p_in = texture(pressureTex, slicetoUV(X_jn.y, vec3(float(X_in.x), float(X_in.y), float(X_in.z)) * dL)).r;
        float p_jp = texture(pressureTex, slicetoUV(X_jp.y, vec3(float(X_jp.x), float(X_jp.y), float(X_jp.z)) * dL)).r;
        float p_jn = texture(pressureTex, slicetoUV(X_jn.y, vec3(float(X_jn.x), float(X_jn.y), float(X_jn.z)) * dL)).r;
        float p_kp = texture(pressureTex, slicetoUV(X_kp.y, vec3(float(X_kp.x), float(X_kp.y), float(X_kp.z)) * dL)).r;
        float p_kn = texture(pressureTex, slicetoUV(X_kn.y, vec3(float(X_kn.x), float(X_kn.y), float(X_kn.z)) * dL)).r;
        
        float div = texture(divergenceTex, v_texcoord).r;
        
        float scale = dL * dL;
        float p_new = (p_ip + p_in + p_jp + p_jn + p_kp + p_kn + div * scale) / 6.0;
        
        gl_FragColor = vec4(p_new, 0.0, 0.0, 0.0);
    }
  `,
};

// Gradient subtract shader
export const gradientShader = {
  vertex: vertexShader,
  fragment: commonShaderCode + `
    precision highp float;
    
    uniform sampler2D velocityTex;
    uniform sampler2D pressureTex;
    
    varying vec2 v_texcoord;
    
    void main() {
        ivec2 frag = ivec2(gl_FragCoord.xy);
        ivec3 vsPi = ivec3(floor(mapFragToVs(frag)));
        
        int ix = vsPi.x;
        int iy = vsPi.y;
        int iz = vsPi.z;
        
        ivec3 X_ip = ivec3(min(ix + 1, Nx - 1), iy, iz);
        ivec3 X_in = ivec3(max(ix - 1, 0), iy, iz);
        ivec3 X_jp = ivec3(ix, min(iy + 1, Ny - 1), iz);
        ivec3 X_jn = ivec3(ix, max(iy - 1, 0), iz);
        ivec3 X_kp = ivec3(ix, iy, min(iz + 1, Nz - 1));
        ivec3 X_kn = ivec3(ix, iy, max(iz - 1, 0));
        
        float p_ip = texture(pressureTex, slicetoUV(X_jp.y, vec3(float(X_ip.x), float(X_ip.y), float(X_ip.z)) * dL)).r;
        float p_in = texture(pressureTex, slicetoUV(X_jn.y, vec3(float(X_in.x), float(X_in.y), float(X_in.z)) * dL)).r;
        float p_jp = texture(pressureTex, slicetoUV(X_jp.y, vec3(float(X_jp.x), float(X_jp.y), float(X_jp.z)) * dL)).r;
        float p_jn = texture(pressureTex, slicetoUV(X_jn.y, vec3(float(X_jn.x), float(X_jn.y), float(X_jn.z)) * dL)).r;
        float p_kp = texture(pressureTex, slicetoUV(X_kp.y, vec3(float(X_kp.x), float(X_kp.y), float(X_kp.z)) * dL)).r;
        float p_kn = texture(pressureTex, slicetoUV(X_kn.y, vec3(float(X_kn.x), float(X_kn.y), float(X_kn.z)) * dL)).r;
        
        vec3 gradP = vec3(
            (p_ip - p_in) / (2.0 * dL),
            (p_jp - p_jn) / (2.0 * dL),
            (p_kp - p_kn) / (2.0 * dL)
        );
        
        vec3 v = texture(velocityTex, v_texcoord).xyz;
        vec3 v_new = v - timestep * gradP;
        
        gl_FragColor = vec4(v_new, 0.0);
    }
  `,
};

// Vorticity shader
export const vorticityShader = {
  vertex: vertexShader,
  fragment: commonShaderCode + `
    precision highp float;
    
    uniform sampler2D velocityTex;
    
    varying vec2 v_texcoord;
    
    vec3 computeCurl(ivec3 vsPi) {
        int ix = vsPi.x;
        int iy = vsPi.y;
        int iz = vsPi.z;
        
        ivec3 X_jp = ivec3(ix, min(iy + 1, Ny - 1), iz);
        ivec3 X_jn = ivec3(ix, max(iy - 1, 0), iz);
        ivec3 X_kp = ivec3(ix, iy, min(iz + 1, Nz - 1));
        ivec3 X_kn = ivec3(ix, iy, max(iz - 1, 0));
        
        vec3 v_jp = texture(velocityTex, slicetoUV(X_jp.y, vec3(float(X_jp.x), float(X_jp.y), float(X_jp.z)) * dL)).xyz;
        vec3 v_jn = texture(velocityTex, slicetoUV(X_jn.y, vec3(float(X_jn.x), float(X_jn.y), float(X_jn.z)) * dL)).xyz;
        vec3 v_kp = texture(velocityTex, slicetoUV(X_kp.y, vec3(float(X_kp.x), float(X_kp.y), float(X_kp.z)) * dL)).xyz;
        vec3 v_kn = texture(velocityTex, slicetoUV(X_kn.y, vec3(float(X_kn.x), float(X_kn.y), float(X_kn.z)) * dL)).xyz;
        
        vec3 curl = vec3(
            (v_kp.y - v_kn.y) / (2.0 * dL) - (v_jp.z - v_jn.z) / (2.0 * dL),
            (v_jp.x - v_jn.x) / (2.0 * dL) - (v_kp.x - v_kn.x) / (2.0 * dL),
            (v_kp.x - v_kn.x) / (2.0 * dL) - (v_jp.y - v_jn.y) / (2.0 * dL)
        );
        
        return curl;
    }
    
    void main() {
        ivec2 frag = ivec2(gl_FragCoord.xy);
        ivec3 vsPi = ivec3(floor(mapFragToVs(frag)));
        
        vec3 omega = computeCurl(vsPi);
        float omega_mag = length(omega);
        
        if (omega_mag < 1.0e-6) {
            vec3 v = texture(velocityTex, v_texcoord).xyz;
            gl_FragColor = vec4(v, 0.0);
            return;
        }
        
        int ix = vsPi.x;
        int iy = vsPi.y;
        int iz = vsPi.z;
        
        ivec3 X_ip = ivec3(min(ix + 1, Nx - 1), iy, iz);
        ivec3 X_in = ivec3(max(ix - 1, 0), iy, iz);
        ivec3 X_jp = ivec3(ix, min(iy + 1, Ny - 1), iz);
        ivec3 X_jn = ivec3(ix, max(iy - 1, 0), iz);
        ivec3 X_kp = ivec3(ix, iy, min(iz + 1, Nz - 1));
        ivec3 X_kn = ivec3(ix, iy, max(iz - 1, 0));
        
        float omega_xp = length(computeCurl(X_ip));
        float omega_xn = length(computeCurl(X_in));
        float omega_yp = length(computeCurl(X_jp));
        float omega_yn = length(computeCurl(X_jn));
        float omega_zp = length(computeCurl(X_kp));
        float omega_zn = length(computeCurl(X_kn));
        
        vec3 eta = vec3(
            omega_xp - omega_xn,
            omega_yp - omega_yn,
            omega_zp - omega_zn
        );
        
        vec3 N = normalize(eta + vec3(1.0e-6));
        
        vec3 force = vorticity_scale * cross(N, omega);
        
        vec3 v = texture(velocityTex, v_texcoord).xyz;
        vec3 v_new = v + timestep * force;
        
        gl_FragColor = vec4(v_new, 0.0);
    }
  `,
};

// Boundary shader
export const boundaryShader = {
  vertex: vertexShader,
  fragment: commonShaderCode + `
    precision highp float;
    
    uniform sampler2D velocityTex;
    uniform sampler2D sdfTex;
    uniform float boundaryFalloff;
    
    varying vec2 v_texcoord;
    
    float sampleSDF(vec3 wsP) {
        return interp(sdfTex, wsP).r;
    }
    
    void main() {
        ivec2 frag = ivec2(gl_FragCoord.xy);
        vec3 vsP = mapFragToVs(frag);
        vec3 wsP = vsP * dL;
        
        float sdf = sampleSDF(wsP);
        vec3 v = texture(velocityTex, v_texcoord).xyz;
        
        if (sdf < 0.0) {
            v = vec3(0.0);
        } else if (sdf < boundaryFalloff) {
            float alpha = sdf / boundaryFalloff;
            v *= alpha;
        }
        
        gl_FragColor = vec4(v, 0.0);
    }
  `,
};

// Inflow shader
export const inflowShader = {
  vertex: vertexShader,
  fragment: commonShaderCode + `
    precision highp float;
    
    uniform sampler2D velocityTex;
    uniform vec3 inflowVelocity;
    uniform float inflowX;
    
    varying vec2 v_texcoord;
    
    void main() {
        ivec2 frag = ivec2(gl_FragCoord.xy);
        vec3 vsP = mapFragToVs(frag);
        vec3 wsP = vsP * dL;
        
        vec3 v = texture(velocityTex, v_texcoord).xyz;
        
        if (wsP.x <= inflowX + dL) {
            v = inflowVelocity;
        }
        
        gl_FragColor = vec4(v, 0.0);
    }
  `,
};

