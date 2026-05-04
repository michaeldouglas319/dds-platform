import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DeskButtonParams {
  onClick?: () => void;
  position?: [number, number, number];
  scale?: number;
  color?: string;
  hoverColor?: string;
  textColor?: string;
  showShadow?: boolean;
}

interface DeskButtonProps {
  text: string;
  params?: DeskButtonParams;
}

export function DeskButton({ 
  text, 
  params = {} 
}: DeskButtonProps) {
  const {
    onClick,
    position = [0, 0, 0],
    scale = 1,
    color = '#ff4d7a',
    hoverColor = '#ff6b9d',
    textColor = '#ffeeff',
    showShadow = true,
  } = params;

  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const baseY = position[1];

  useFrame(() => {
    if (meshRef.current) {
      // Subtle hover lift animation
      meshRef.current.position.y = baseY + (hovered ? 0.15 * scale : 0);
      // Hover color intensity
      const material = meshRef.current.material as THREE.MeshPhongMaterial;
      material.emissiveIntensity = hovered ? 0.4 : 0.1;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Button base */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.8, 0.15, 0.4]} />
        <meshPhongMaterial
          color={hovered ? hoverColor : color}
          emissive={hovered ? '#ff8fab' : '#0'}
          emissiveIntensity={hovered ? 0.4 : 0.1}
          shininess={100}
        />
      </mesh>

      {/* Button top highlight */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.75, 0.05, 0.35]} />
        <meshPhongMaterial 
          color="#ffb3d9" 
          opacity={hovered ? 0.8 : 0.4} 
          transparent 
        />
      </mesh>

      {/* Text label */}
      <group position={[0, 0.3, 0.25]}>
        <TextMesh text={text} textColor={textColor} />
      </group>

      {/* Shadow plane */}
      {showShadow && (
        <mesh position={[0, -0.51, 0]} receiveShadow>
          <planeGeometry args={[1.2, 0.6]} />
          <shadowMaterial opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}

function TextMesh({ text, textColor }: { text: string; textColor: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = textColor;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const newTexture = new THREE.CanvasTexture(canvas);
    newTexture.needsUpdate = true;
    return newTexture;
  }, [text, textColor]);

  return (
    <mesh position={[0, 0, 0.01]}>
      <planeGeometry args={[0.7, 0.15]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}                                                                                                                                                                         
                                                                 