import { Center, Instance, Instances } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { CustomMaterial } from "./material";

export interface Item3Props {
  lightResponsive?: boolean;
  /** Number of cylinders (default: 8) */
  count?: number;
  /** Radius of the circle (default: 3) */
  radius?: number;
  /** Inner rotation speed per frame (default: 0.01) */
  innerSpeed?: number;
  /** Outer rotation speed per frame (default: -0.01) */
  outerSpeed?: number;
}

interface ItemProps {
  count?: number;
  innerSpeed?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

function Item({
  count = 8,
  innerSpeed = 0.01,
  ...props
}: ItemProps) {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += innerSpeed;
      ref.current.rotation.y += innerSpeed;
      ref.current.rotation.z += innerSpeed;
    }
  });

  return (
    <group {...props}>
      <group ref={ref} rotation={[0, Math.PI / count, Math.PI / 2]}>
        <Instance />
      </group>
    </group>
  );
}

export const Item3 = ({
  lightResponsive = false,
  count = 8,
  radius = 3,
  innerSpeed = 0.01,
  outerSpeed = -0.01,
}: Item3Props) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z += outerSpeed;
    }
  });

  return (
    <Center>
      <group>
        <group scale={0.6} ref={groupRef}>
          <Instances>
            <cylinderGeometry args={[1, 1, 0.1, 64]}></cylinderGeometry>
            <CustomMaterial lightResponsive={lightResponsive}></CustomMaterial>
            {Array.from({ length: count }).map((_, index) => {
              return (
                <Item
                  count={count}
                  innerSpeed={innerSpeed}
                  position={[
                    radius *
                      Math.cos((index * 2 * Math.PI) / count + Math.PI / 4),
                    radius *
                      Math.sin((index * 2 * Math.PI) / count + Math.PI / 4),
                    0,
                  ]}
                  rotation={[0, 0, (index * 2 * Math.PI) / count]}
                  key={index}
                ></Item>
              );
            })}
          </Instances>
        </group>
      </group>
    </Center>
  );
};
