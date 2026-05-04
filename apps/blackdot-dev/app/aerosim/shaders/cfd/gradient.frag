#version 300 es
precision highp float;

#include common.glsl

uniform sampler2D velocityTex;
uniform sampler2D pressureTex;
uniform float timestep;

in vec2 v_texcoord;
out vec4 fragColor;

void main() {
    ivec2 frag = ivec2(gl_FragCoord.xy);
    ivec3 vsPi = ivec3(floor(mapFragToVs(frag)));
    
    int ix = vsPi.x;
    int iy = vsPi.y;
    int iz = vsPi.z;
    
    // Get neighbor pressures for gradient
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
    
    // Compute pressure gradient
    vec3 gradP = vec3(
        (p_ip - p_in) / (2.0 * dL),
        (p_jp - p_jn) / (2.0 * dL),
        (p_kp - p_kn) / (2.0 * dL)
    );
    
    // Subtract gradient from velocity: vel -= dt * grad(p)
    vec3 v = texture(velocityTex, v_texcoord).xyz;
    vec3 v_new = v - timestep * gradP;
    
    fragColor = vec4(v_new, 0.0);
}


