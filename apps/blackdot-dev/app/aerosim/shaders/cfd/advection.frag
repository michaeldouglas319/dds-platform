#version 300 es
precision highp float;

#include common.glsl

uniform sampler2D velocityTex;
uniform float timestep;

in vec2 v_texcoord;
out vec4 fragColor;

// RK4 advection: backtrack position along velocity field
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
    
    // Get current velocity
    vec3 v0 = texture(velocityTex, v_texcoord).xyz;
    
    // Backtrack position along velocity field
    vec3 wsP_back = back_advect(wsP, v0, timestep);
    
    // Sample velocity at backtracked position
    vec3 v = interp(velocityTex, wsP_back).xyz;
    
    fragColor = vec4(v, 0.0);
}


