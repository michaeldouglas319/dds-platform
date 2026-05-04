// Shader loader that processes glslify pragmas and inlines dependencies

// Inline shader dependencies
const sdFingerBoneShader = `
float sdSphere(vec3 p, float s) {
  return length(p) - s;
}

float sdCappedCylinderLower(vec3 p, vec2 h) {
  vec2 d = abs(vec2(length(p.xz), p.y + h.y)) - h;
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sdFingerBone(in vec3 p, in mat4 fingerBone) {
  vec3 scale = vec3(fingerBone[0][3], fingerBone[1][3], fingerBone[2][3]);

  fingerBone[0][3] = 0.0;
  fingerBone[1][3] = 0.0;
  fingerBone[2][3] = 0.0;

  p = (fingerBone * vec4(p, 1.0)).xyz;

  return min(
    sdSphere(p, scale.x),
    sdCappedCylinderLower(p, vec2(scale.x, scale.y / 2.0))
  );
}
`;

const hashShader = `
float hash(float v) {
  return fract(sin(v) * 12.419821);
}
`;

// Map shader - only the map function, assumes dependencies are already included
// Note: FAR constant and data uniform must be declared in the main shader before this is included
const mapFunctionShader = `
float sdHexPrism(vec3 p, vec2 h) {
  vec3 q = abs(p);
  return max(q.z - h.y, max((q.x * 0.866025 + q.y * 0.5), q.y) - h.x);
}

float map(in vec3 p) {
  float d = FAR;

  mat4 palmData = data[0];
  vec3 scale = vec3(palmData[0][3], palmData[1][3], palmData[2][3]);

  palmData[0][3] = 0.0;
  palmData[1][3] = 0.0;
  palmData[2][3] = 0.0;

  d = min(d, sdHexPrism((palmData * vec4(p, 1.0)).xyz, vec2(scale.x, scale.z / 2.0)));

  for(int i = 1; i < 16; i++) {
    d = min(d, sdFingerBone(p, data[i]));
  }

  return d;
}
`;

// CalcNormal shader - only the calcNormal function, assumes map is already included
const calcNormalFunctionShader = `
vec3 calcNormal(in vec3 pos) {
  vec3 eps = vec3(0.02, 0.0, 0.0);

  return normalize(vec3(
    map(pos + eps.xyy) - map(pos - eps.xyy),
    map(pos + eps.yxy) - map(pos - eps.yxy),
    map(pos + eps.yyx) - map(pos - eps.yyx)
  ));
}
`;

const randomShader = `
float random(vec2 v) {
  return fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453);
}
`;

// Map of shader dependencies - order matters for dependencies
const shaderDependencies: Record<string, string> = {
  './sdFingerBone': sdFingerBoneShader,
  './hash': hashShader,
  './map': mapFunctionShader,
  './calcNormal': calcNormalFunctionShader,
  'glsl-random': randomShader,
  'glsl-fxaa': '', // Not used in our shaders
};

/**
 * Processes glslify pragmas in a shader string and inlines dependencies
 * Handles dependency order: sdFingerBone -> map -> calcNormal
 * Inserts dependencies after uniform/const declarations but before main()
 */
export function processGlslify(shader: string): string {
  const pragmaRegex = /#pragma\s+glslify:\s*(\w+)\s*=\s*require\(([^)]+)\)/g;
  const exportRegex = /#pragma\s+glslify:\s*export\((\w+)\)/g;
  
  // Process require statements - collect all requires first
  const requires: Array<{ varName: string; depPath: string; match: string }> = [];
  let match;
  // Reset regex
  pragmaRegex.lastIndex = 0;
  while ((match = pragmaRegex.exec(shader)) !== null) {
    requires.push({
      varName: match[1],
      depPath: match[2].trim().replace(/['"]/g, ''),
      match: match[0],
    });
  }

  if (requires.length === 0) {
    // No requires, just remove export statements
    return shader.replace(exportRegex, '');
  }

  // Dependency graph: map depends on sdFingerBone, calcNormal depends on map
  // Order: sdFingerBone, hash, random, map, calcNormal
  const dependencyOrder = ['./sdFingerBone', './hash', 'glsl-random', './map', './calcNormal'];
  const processedDeps = new Set<string>();
  let dependencyCode = '';
  
  // Check if map is required - if so, we also need sdFingerBone
  const requiresMap = requires.some(r => r.depPath === './map');
  const requiresCalcNormal = requires.some(r => r.depPath === './calcNormal');
  
  // If map is required, automatically include sdFingerBone (it's a dependency of map)
  if (requiresMap && !requires.some(r => r.depPath === './sdFingerBone')) {
    requires.push({
      varName: 'sdFingerBone',
      depPath: './sdFingerBone',
      match: '#pragma glslify: sdFingerBone = require(./sdFingerBone)',
    });
  }
  
  // If calcNormal is required, automatically include map (it's a dependency of calcNormal)
  if (requiresCalcNormal && !requires.some(r => r.depPath === './map')) {
    requires.push({
      varName: 'map',
      depPath: './map',
      match: '#pragma glslify: map = require(./map)',
    });
    // And if we're adding map, we also need sdFingerBone
    if (!requires.some(r => r.depPath === './sdFingerBone')) {
      requires.push({
        varName: 'sdFingerBone',
        depPath: './sdFingerBone',
        match: '#pragma glslify: sdFingerBone = require(./sdFingerBone)',
      });
    }
  }
  
  // First, add base dependencies that don't depend on others
  for (const depPath of dependencyOrder) {
    if (requires.some(r => r.depPath === depPath) && !processedDeps.has(depPath)) {
      processedDeps.add(depPath);
      dependencyCode += shaderDependencies[depPath] + '\n';
    }
  }
  
  // Add any other dependencies not in the ordered list
  for (const req of requires) {
    if (!dependencyOrder.includes(req.depPath) && shaderDependencies[req.depPath] && !processedDeps.has(req.depPath)) {
      processedDeps.add(req.depPath);
      dependencyCode += shaderDependencies[req.depPath] + '\n';
    }
  }

  // Remove pragma statements
  let processed = shader.replace(pragmaRegex, '');
  
  // Remove export statements
  processed = processed.replace(exportRegex, '');
  
  // Insert dependencies after uniforms/consts but before main()
  if (dependencyCode) {
    const mainIndex = processed.indexOf('void main()');
    if (mainIndex > 0) {
      // Find the last uniform/const declaration before main
      const beforeMain = processed.substring(0, mainIndex);
      const lines = beforeMain.split('\n');
      let lastDeclIndex = -1;
      
      // Find last line that's a uniform or const declaration
      for (let i = lines.length - 1; i >= 0; i--) {
        const trimmed = lines[i].trim();
        if (trimmed && (trimmed.startsWith('uniform ') || trimmed.startsWith('const '))) {
          lastDeclIndex = i;
          break;
        }
      }
      
      if (lastDeclIndex >= 0) {
        // Insert after last declaration
        const beforeDeps = lines.slice(0, lastDeclIndex + 1).join('\n');
        const afterDeps = lines.slice(lastDeclIndex + 1).join('\n');
        const mainAndAfter = processed.substring(mainIndex);
        processed = beforeDeps + '\n\n' + dependencyCode.trim() + '\n\n' + afterDeps + mainAndAfter;
      } else {
        // No declarations found, insert before main
        processed = beforeMain.trim() + '\n\n' + dependencyCode.trim() + '\n\n' + processed.substring(mainIndex);
      }
    } else {
      // No main found, prepend
      processed = dependencyCode + '\n' + processed;
    }
  }
  
  return processed;
}

/**
 * Loads and processes a shader file, handling glslify pragmas
 * Ensures constants and uniforms are declared before inlined code
 */
export function loadShader(shaderSource: string): string {
  // First, replace GLOBAL_VAR_* with actual names
  let processed = shaderSource.replace(/GLOBAL_VAR_FAR/g, 'FAR');
  processed = processed.replace(/GLOBAL_VAR_data/g, 'data');
  
  // Process glslify pragmas (will insert dependencies after uniforms/consts, before main)
  processed = processGlslify(processed);
  
  return processed;
}
