import { useGSAP } from "@gsap/react";
import { Center } from "@react-three/drei";
import gsap from "gsap";
import { useRef } from "react";
import * as THREE from "three";
import { CustomMaterial } from "./material";

interface Item8Props {
  lightResponsive?: boolean;
}

export const Item8 = ({ lightResponsive = false }: Item8Props) => {
  const ref1 = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useGSAP(() => {
    if (!ref1.current || !ref2.current || !groupRef.current) return;

    gsap
      .timeline({
        defaults: {
          ease: "elastic",
          repeat: -1,
        },
      })
      .to(ref1.current.position, {
        keyframes: [
          {
            x: -1.5,
            duration: 2,
          },
          {
            x: 1.5,
            duration: 2,
          },
        ],
        repeat: -1,
      })
      .to(
        ref2.current.position,
        {
          keyframes: [
            {
              x: 1.5,
              duration: 2,
            },
            {
              x: -1.5,
              duration: 2,
            },
          ],
          repeat: -1,
        },

        0
      )
      .to(
        groupRef.current.rotation,
        {
          z: `${Math.PI}`,
          duration: 4,
        },
        0
      );
  }, []);

  return (
    <Center ref={groupRef}>
      <mesh position={[1.5, 1, 0]} rotation={[Math.PI / 2, 0, 0]} ref={ref1}>
        <cylinderGeometry args={[0.5, 0.5]}></cylinderGeometry>
        <CustomMaterial lightResponsive={lightResponsive}></CustomMaterial>
      </mesh>

      <mesh>
        <boxGeometry args={[4, 0.4, 1]}></boxGeometry>
        <CustomMaterial lightResponsive={lightResponsive}></CustomMaterial>
      </mesh>

      <mesh position={[-1.5, -1, 0]} rotation={[Math.PI / 2, 0, 0]} ref={ref2}>
        <cylinderGeometry args={[0.5, 0.5]}></cylinderGeometry>
        <CustomMaterial lightResponsive={lightResponsive}></CustomMaterial>
      </mesh>
    </Center>
  );
};
