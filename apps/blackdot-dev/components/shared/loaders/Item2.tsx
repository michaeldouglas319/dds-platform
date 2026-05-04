import { useGSAP } from "@gsap/react";
import { Center, Instance, Instances } from "@react-three/drei";
import gsap from "gsap";
import { useCallback, useRef } from "react";
import * as THREE from "three";
import { CustomMaterial } from "./material";

export interface Item2Props {
  lightResponsive?: boolean;
  /** Number of boxes around the circle (default: 20) */
  boxCount?: number;
  /** Radius of the circle (default: 3) */
  radius?: number;
  /** Inner rotation duration in seconds (default: 6) */
  innerDuration?: number;
  /** Outer rotation duration in seconds (default: 24) */
  outerDuration?: number;
}

export const Item2 = ({
  lightResponsive = false,
  boxCount = 20,
  radius = 3,
  innerDuration = 6,
  outerDuration = 24,
}: Item2Props) => {
  const groupRef = useRef<THREE.Group>(null!);

  const refList = useRef<THREE.Mesh[]>([]);

  const getRef = useCallback((mesh: THREE.Mesh) => {
    if (mesh && !refList.current.includes(mesh)) {
      refList.current.push(mesh);
    }
  }, []);

  useGSAP(() => {
    const timeline = gsap
      .timeline()
      .to(
        refList.current.map((item) => item.rotation),
        {
          y: `+=${Math.PI * 2}`,
          repeat: -1,
          duration: innerDuration,
          ease: "none",
        }
      )
      .to(
        groupRef.current.rotation,
        {
          z: Math.PI * 2,
          duration: outerDuration,
          ease: "none",
          repeat: -1,
        },
        0
      );

    return () => timeline.kill();
  }, [innerDuration, outerDuration]);

  return (
    <Center>
      <group rotation={[0, 0, 0]}>
        <group rotation={[0, 0, 0]} scale={0.6} ref={groupRef}>
          <Instances>
            <boxGeometry args={[1, 0.2, 1]}></boxGeometry>
            <CustomMaterial lightResponsive={lightResponsive}></CustomMaterial>
            {Array.from({ length: boxCount }).map((_, index) => {
              return (
                <group
                  key={index}
                  rotation={[0, 0, (index / boxCount) * 2 * Math.PI]}
                  position={[
                    Math.cos((index / boxCount) * 2 * Math.PI) * radius,
                    Math.sin((index / boxCount) * 2 * Math.PI) * radius,
                    0,
                  ]}
                >
                  <Instance ref={getRef} />
                </group>
              );
            })}
          </Instances>
        </group>
      </group>
    </Center>
  );
};
