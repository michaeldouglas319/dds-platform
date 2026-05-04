"use client"

import { useRef, useMemo, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingSkillsProps {
  skills: string[];
  selectedIndex?: number;
}

/**
 * Floating Skills Component
 * Creates physics-based floating skill badges that respond to interactions
 * Showcases R3F Float component and interactive 3D elements
 */
export function FloatingSkills({ skills, selectedIndex = 0 }: FloatingSkillsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Distribute skills in a sphere formation
  // Use deterministic positioning instead of Math.random() for consistency
  const positions = useMemo(() => {
    return skills.map((_, i) => {
      const phi = Math.acos(-1 + (2 * i) / skills.length);
      const theta = Math.sqrt(skills.length * Math.PI) * phi;
      // Use deterministic radius based on index instead of random
      const radius = 3 + (i % 3) * 0.67; // Cycles through 3, 3.67, 4.34
      
      return {
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
      };
    });
  }, [skills]);

  // Generate speeds array for Float components
  const speeds = useMemo(() => {
    return skills.map((_, i) => 1.2 + (i % 3) * 0.3); // Vary speeds between 1.2 and 2.1
  }, [skills]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Gentle rotation of the entire group
    groupRef.current.rotation.y += delta * 0.1;
    
    // Subtle floating animation
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {skills.map((skill, index) => {
        const pos = positions[index];
        const isHovered = hoveredIndex === index;
        
        return (
          <Float
            key={skill}
            speed={speeds[index] || 1.5}
            rotationIntensity={0.2}
            floatIntensity={0.3}
          >
            <group
              position={[pos.x * 0.8, pos.y * 0.8 + 1, pos.z]}
              onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                setHoveredIndex(index);
              }}
              onPointerOut={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                setHoveredIndex(null);
              }}
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                e.nativeEvent.stopPropagation();
                // Skill badge clicked - could trigger UI interaction
              }}
            >
              {/* 3D Badge Geometry - Larger and more visible */}
              <mesh>
                <boxGeometry args={[1.2, 0.4, 0.15]} />
                <meshStandardMaterial
                  color={isHovered ? '#8b5cf6' : '#6366f1'}
                  metalness={0.5}
                  roughness={0.3}
                  emissive={isHovered ? '#8b5cf6' : '#6366f1'}
                  emissiveIntensity={isHovered ? 0.5 : 0.2}
                />
              </mesh>
              
              {/* Skill Text - Larger */}
              <Text
                position={[0, 0, 0.08]}
                fontSize={0.12}
                color={isHovered ? '#ffffff' : '#ffffff'}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
                fontWeight="bold"
              >
                {skill}
              </Text>
              
              {/* Glow effect on hover */}
              {isHovered && (
                <mesh position={[0, 0, 0.05]}>
                  <boxGeometry args={[0.85, 0.35, 0.05]} />
                  <meshBasicMaterial
                    color="#8b5cf6"
                    transparent
                    opacity={0.2}
                  />
                </mesh>
              )}
            </group>
          </Float>
        );
      })}
    </group>
  );
}

