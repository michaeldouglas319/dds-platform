'use client';

import { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Text } from '@react-three/drei';
import { GoogleAuthButton3D } from './GoogleAuthButton3D';
import { ProfileImageDisk } from '@/app/landing-v2/components/ProfileImageDisk';
import { LoaderLayout } from '../loaders/LoaderLayout';

export interface SignIn3DFormProps {
  /** Position in 3D space */
  position?: [number, number, number];

  /** Scale of the entire form */
  scale?: number;

  /** Called on successful sign-in */
  onSuccess?: () => void;
}

/**
 * SignIn3DForm - Minimal 3D login with Google OAuth only
 *
 * @example
 * ```tsx
 * <SignIn3DForm position={[0, 0, 0]} scale={1.5} />
 * ```
 */
export const SignIn3DForm = ({
  position = [0, 0, 0],
  scale = 1.5,
  onSuccess,
}: SignIn3DFormProps) => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!signIn || !isLoaded) return;

    setGoogleLoading(true);

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
    } catch (err) {
      setGoogleLoading(false);
    }
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <group position={position} scale={scale}>
      {/* Lighting - enhanced accent lights */}
      {/* Left indigo light */}
      <pointLight position={[-4, 0.5, 2.5]} intensity={2} color="#6366f1" distance={20} />
      {/* Right purple light */}
      <pointLight position={[4, 0.5, 2.5]} intensity={2} color="#4f46e5" distance={20} />
      {/* Front white fill light */}
      <pointLight position={[0, 1.5, 4]} intensity={1.5} color="#ffffff" distance={15} />
      {/* Back rim light */}
      <pointLight position={[0, -0.5, -3]} intensity={1.2} color="#a78bfa" distance={18} />

      {/* Title */}
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
        onClick={handleGoogleSignIn}
      >Sign In with Google</Text>

           
      {/* Google OAuth button */}
      <group position={[0.1, -2, -2]}>
        <GoogleAuthButton3D
          scale={0.45}
          onClick={handleGoogleSignIn}
          isLoading={googleLoading}
        />

        <Text
          position={[0, 0, 1]}
          fontSize={0.2}
          color="#e0e7ff"
          anchorX="center"
          anchorY="middle"
          fontWeight={500}
          onClick={handleLoginClick}
        >
          ...More 
        </Text>
      </group>
    </group>
  );
};

export default SignIn3DForm;
