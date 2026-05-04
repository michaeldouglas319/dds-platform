#version 300 es
precision highp float;

#include common.glsl

uniform sampler2D pressureTex;
uniform sampler2D divergenceTex;

in vec2 v_texcoord;
out vec4 fragColor;

void main() {
    ivec2 frag = ivec2(gl_FragCoord.xy);
    ivec3 vsPi = ivec3(floor(mapFragToVs(frag)));
    
    int ix = vsPi.x;
    int iy = vsPi.y;
    int iz = vsPi.z;
    
    // Get neighbor pressures
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
    
    // Jacobi iteration: p_new = (neighbors + div*scale) / 6
    float scale = dL * dL;
    float p_new = (p_ip + p_in + p_jp + p_jn + p_kp + p_kn + div * scale) / 6.0;
    
    fragColor = vec4(p_new, 0.0, 0.0, 0.0);
}


