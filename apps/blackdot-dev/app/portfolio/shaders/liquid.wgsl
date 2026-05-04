// WebGPU Liquid/Fluid Simulation Compute Shader
// Simulates particle-based liquid effect with gravity and velocity damping

struct Particle {
  position: vec3f,
  velocity: vec3f,
  life: f32,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> params: vec4f; // deltaTime, gravity, damping, particleCount

@compute @workgroup_size(64)
fn simulate(@builtin(global_invocation_id) global_id: vec3u) {
  let idx = global_id.x;
  if (idx >= u32(params.w)) { return; }

  var p = particles[idx];

  // Apply gravity
  p.velocity.y -= params.y * params.x;

  // Apply damping
  p.velocity *= params.z;

  // Update position
  p.position += p.velocity * params.x;

  // Decrease life
  p.life -= params.x * 0.5;

  // Bounds checking - reset if out of bounds or dead
  if (p.life <= 0.0 || p.position.y < -5.0) {
    p.position = vec3f(sin(f32(idx) * 0.1) * 2.0, 3.0, cos(f32(idx) * 0.1) * 2.0);
    p.velocity = vec3f(
      sin(f32(idx)) * 1.5,
      -2.0 + cos(f32(idx) * 0.5) * 1.0,
      cos(f32(idx)) * 1.5
    );
    p.life = 1.0;
  }

  particles[idx] = p;
}
