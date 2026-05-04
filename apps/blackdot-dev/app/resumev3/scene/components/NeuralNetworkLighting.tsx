/**
 * Shared lighting setup for neural network scenes
 * Matches landing page lighting configuration
 */
export function NeuralNetworkLighting() {
  return (
    <>
      <ambientLight intensity={2.5} />
      <spotLight
        position={[1, 6, 1.5]}
        angle={0.2}
        penumbra={1}
        intensity={3.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight
        position={[-5, 5, -1.5]}
        angle={0.03}
        penumbra={1}
        intensity={4.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <spotLight
        position={[5, 5, -5]}
        angle={0.3}
        penumbra={1}
        intensity={4.5}
        castShadow
        shadow-mapSize={[256, 256]}
        color="#ffffc0"
      />
      <pointLight
        position={[0, 0, 5]}
        intensity={1.5}
        color="#8b5cf6"
        distance={10}
      />
    </>
  );
}

