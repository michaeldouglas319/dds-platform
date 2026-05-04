#version 300 es
precision highp float;

#include common.glsl

uniform sampler2D velocityTex;

in vec2 v_texcoord;
out vec4 fragColor;

void main() {
    ivec2 frag = ivec2(gl_FragCoord.xy);
    ivec3 vsPi = ivec3(floor(mapFragToVs(frag)));
    
    int ix = vsPi.x;
    int iy = vsPi.y;
    int iz = vsPi.z;
    
    // Get neighbor velocities for finite differences
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
    
    // Compute divergence: div = (vx[+dx] - vx[-dx]) / (2*dx) + similar for y, z
    float div = (v_ip.x - v_in.x) / (2.0 * dL) +
                (v_jp.y - v_jn.y) / (2.0 * dL) +
                (v_kp.z - v_kn.z) / (2.0 * dL);
    
    fragColor = vec4(div, 0.0, 0.0, 0.0);
}


