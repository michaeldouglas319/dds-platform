#version 300 es
precision highp float;

#include common.glsl

uniform sampler2D velocityTex;
uniform sampler2D sdfTex;  // Precomputed coarse SDF
uniform float boundaryFalloff;

in vec2 v_texcoord;
out vec4 fragColor;

// Sample SDF at world position (hybrid: use texture if available, otherwise compute)
float sampleSDF(vec3 wsP) {
    // First try precomputed SDF texture
    float sdf_coarse = interp(sdfTex, wsP).r;
    
    // If near boundary (SDF < 2.0), we could refine with function sampling
    // For now, use coarse SDF
    return sdf_coarse;
}

void main() {
    ivec2 frag = ivec2(gl_FragCoord.xy);
    vec3 vsP = mapFragToVs(frag);
    vec3 wsP = vsP * dL;
    
    float sdf = sampleSDF(wsP);
    
    vec3 v = texture(velocityTex, v_texcoord).xyz;
    
    // Enforce no-slip boundary: zero velocity inside obstacle
    if (sdf < 0.0) {
        v = vec3(0.0);
    } else if (sdf < boundaryFalloff) {
        // Smooth falloff near boundary
        float alpha = sdf / boundaryFalloff;
        v *= alpha;
    }
    
    fragColor = vec4(v, 0.0);
}


