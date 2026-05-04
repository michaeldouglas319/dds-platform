import { Center } from "@react-three/drei";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useRef } from "react";
import * as THREE from "three";
import { CustomMaterial } from "./material";

export interface Item1Props {
  /** Use light-responsive material (responds to PointLights) */
  lightResponsive?: boolean;
  /** Number of rings (default: 4) */
  ringCount?: number;
  /** Thickness of each ring (default: 0.1) */
  ringThickness?: number;
  /** Animation duration in seconds (default: 1.5) */
  duration?: number;
  /** Stagger delay between rings (default: 0.15) */
  stagger?: number;
  /** Repeat delay between cycles (default: 0.5) */
  repeatDelay?: number;
}

export const Item1 = ({
  lightResponsive = false,
  ringCount = 4,
  ringThickness = 0.1,
  duration = 1.5,
  stagger = 0.15,
  repeatDelay = 0.5,
}: Item1Props) => {
  const refList = useRef<THREE.Mesh[]>([]);

  const getRef = useCallback((mesh: THREE.Mesh) => {
    if (mesh && !refList.current.includes(mesh)) {
      refList.current.push(mesh);
    }
  }, []);

  useGSAP(() => {
    if (refList.current.length === 0) return;

    const timeline = gsap
      .timeline({
        repeat: -1,
        repeatDelay,
      })
      .to(
        refList.current.map((item) => item.rotation),
        {
          y: `+=${Math.PI * 2}`,
          x: `-=${Math.PI * 2}`,
          duration,
          stagger: {
            each: stagger,
          },
        }
      );

    return () => timeline.kill();
  }, [duration, stagger, repeatDelay]);

  return (
    <Center>
      <group>
        {Array.from({ length: ringCount }).map((_, index) => {
          return (
            <mesh key={index} ref={getRef}>
              <torusGeometry args={[(index + 1) * 0.5, ringThickness]}></torusGeometry>
              <CustomMaterial lightResponsive={lightResponsive}></CustomMaterial>
            </mesh>
          );
        })}
      </group>
    </Center>
  );
};
