import { useGSAP } from "@gsap/react";
import { Center, RoundedBox } from "@react-three/drei";
import gsap from "gsap";
import { useCallback, useRef } from "react";
import * as THREE from "three";
import { CustomMaterial } from "./material";

export interface Item7Props {
  lightResponsive?: boolean;
  /** Number of boxes (default: 5) */
  count?: number;
  /** Spacing between boxes (default: 0.1) */
  boxSpacing?: number;
  /** Animation duration in seconds (default: 1) */
  duration?: number;
  /** Stagger delay between boxes (default: 0.1) */
  stagger?: number;
  /** GSAP easing function (default: "back") */
  ease?: string;
}

export const Item7 = ({
  lightResponsive = false,
  count = 5,
  boxSpacing = 0.1,
  duration = 1,
  stagger = 0.1,
  ease = "back",
}: Item7Props) => {
  const refList = useRef<THREE.Mesh[]>([]);

  const getRef = useCallback((mesh: THREE.Mesh) => {
    if (mesh && !refList.current.includes(mesh)) {
      refList.current.push(mesh);
    }
  }, []);

  useGSAP(() => {
    if (refList.current.length === 0) return;

    const timeline = gsap.to(
      refList.current.map((i) => i.rotation),
      {
        y: `+=${Math.PI / 2}`,
        repeat: -1,
        ease,
        stagger: {
          each: stagger,
        },
        duration,
      }
    );

    return () => timeline.kill();
  }, [duration, stagger, ease]);

  return (
    <Center scale={3} rotation={[Math.PI / 10, Math.PI / 4, 0]}>
      {Array.from({ length: count }).map((_, index) => {
        return (
          <RoundedBox
            ref={getRef}
            args={[1, 0.1, 1]}
            key={index}
            radius={0.02}
            position={[0, (index - (count - 1) / 2) * boxSpacing, 0]}
          >
            <CustomMaterial lightResponsive={lightResponsive}></CustomMaterial>
          </RoundedBox>
        );
      })}
    </Center>
  );
};
