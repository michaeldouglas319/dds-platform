#version 300 es
precision highp float;

#include common.glsl

uniform sampler2D velocityTex;
uniform float vorticity_scale;

in vec2 v_texcoord;
out vec4 fragColor;

// Compute curl of velocity (vorticity)
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
    
    // Curl = (∂vz/∂y - ∂vy/∂z, ∂vx/∂z - ∂vz/∂x, ∂vy/∂x - ∂vx/∂y)
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
        fragColor = vec4(0.0);
        return;
    }
    
    // Compute gradient of vorticity magnitude
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
    
    // Vorticity confinement force: f = scale * N × omega
    vec3 force = vorticity_scale * cross(N, omega);
    
    vec3 v = texture(velocityTex, v_texcoord).xyz;
    vec3 v_new = v + timestep * force;
    
    fragColor = vec4(v_new, 0.0);
}


