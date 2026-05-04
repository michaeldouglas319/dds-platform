#version 300 es
precision highp float;

#include common.glsl

uniform sampler2D velocityTex;
uniform vec3 inflowVelocity;  // Uniform inflow velocity (e.g., vec3(10, 0, 0))
uniform float inflowX;        // X position of inflow plane (typically bounds.min.x)

in vec2 v_texcoord;
out vec4 fragColor;

void main() {
    ivec2 frag = ivec2(gl_FragCoord.xy);
    vec3 vsP = mapFragToVs(frag);
    vec3 wsP = vsP * dL;
    
    vec3 v = texture(velocityTex, v_texcoord).xyz;
    
    // Apply uniform inflow at inlet plane
    if (wsP.x <= inflowX + dL) {
        v = inflowVelocity;
    }
    
    fragColor = vec4(v, 0.0);
}


