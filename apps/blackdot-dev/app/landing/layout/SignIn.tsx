'use client'

import { useClerk } from '@clerk/nextjs';
import { InteractiveModelLayout } from '@/components/layouts/InteractiveModelLayout';
import { BubbleButtonLayout } from '@/components/bubble/BubbleButtonLayout';

interface SignInProps {
  profileImageScale?: number;
  profileImagePosition?: [number, number, number];
  profileImageMetalness?: number;
  profileImageRoughness?: number;
  profileImageGlow?: number;
}

export function SignIn({
  profileImageScale: _profileImageScale = 0.75,
  profileImagePosition: _profileImagePosition = [0, 0, 0.1],
  profileImageMetalness: _profileImageMetalness = 0.4,
  profileImageRoughness: _profileImageRoughness = 0.3,
  profileImageGlow: _profileImageGlow = 0.1,
}: SignInProps = {}) {
  const { openSignIn } = useClerk();

  const handleLoginClick = () => {
    openSignIn();
  };  

  return (
            <>
              <BubbleButtonLayout
                clickable={true}
                onClick={handleLoginClick}
                position={[0, -2.2, 0]}
                scale={0.45}
                variant="circular"
                title={{
                  position: [0, -1.5, 1.3],
                  content: "Login",
                  fontSize: 1,
                  depth: -0.6,           // Z-depth for glow effect
                  glowScale: 0,          // Glow brightness
                }}
                subtitle={{
                  content: "Click to authenticate",
                  position: [0, 1.25, 1.3],
                  fontSize: 0.5,          // Z-depth for glow effect
                  glowScale: 0,
                }}
                darkColor="#000000"
              />

              <InteractiveModelLayout
                variant="vertical"
                position={[0, -0.5, 0]}
                modelProps={{
                  modelPath: "/assets/models/paper_pen_one/scene.gltf",
                  rotation: [0, -Math.PI * 0.1, 0],
                  scale: 5,
                  float: true,
                  floatIntensity: 0.1,
                  floatSpeed: 1,
                  hoverRotate: true,
                  rotationSpeed: 1,
                  onClick: () => console.log('Paper pen model clicked'),
                  interactive: true,
                }}
              />
            </>
  );
}

