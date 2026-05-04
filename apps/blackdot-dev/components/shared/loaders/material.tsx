import { forwardRef } from "react";
import { MeshMatcapMaterial } from "three";
import { useStore } from "../store/useStore";
import { useMatcapTexture } from "./useMatcapTexture";
import * as THREE from "three";

interface CustomMaterialProps {
  /** Use light-responsive standard material instead of matcap */
  lightResponsive?: boolean;
  /** Mesh side rendering */
  side?: THREE.Side;
  /** Additional material props */
  [key: string]: any;
}

export const CustomMaterial = forwardRef<
  MeshMatcapMaterial,
  CustomMaterialProps
>(({ lightResponsive = false, ...props }, ref) => {
  const matcapUrl = useStore((x) => x.texture);
  const texture = useMatcapTexture(matcapUrl);

  // Light-responsive mode: use standard material that inherits PointLight illumination
  if (lightResponsive) {
    return (
      <meshStandardMaterial
        {...props}
        ref={ref as any}
        color="#ffffff"
        metalness={0.3}
        roughness={0.4}
      />
    );
  }

  // Default: use matcap material
  if (!texture) {
    // Fallback while texture is loading
    return (
      <meshStandardMaterial
        {...props}
        ref={ref as any}
        color="#ffffff"
        metalness={0.3}
        roughness={0.4}
      />
    );
  }

  return (
    <meshMatcapMaterial
      {...props}
      ref={ref}
      matcap={texture}
    />
  );
});

CustomMaterial.displayName = 'CustomMaterial';
