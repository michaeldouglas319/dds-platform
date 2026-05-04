"use client"

import { Suspense, useMemo, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { easing } from 'maath';
import { resumeJobs } from '@/lib/config/content';
import { NeuralNetwork } from '@/app/landing/node/NeuralNetwork';
import { ResumeCarousel } from './ResumeCarousel';

// Preload models for better performance (optional - only if you have the assets)
// useGLTF.preload('/assets/tesla_logo.glb');

// GCS Logo Component
function GCSLogoModel({ modelOffset = 0 }: { modelOffset?: number }) {
  const texture = useTexture('/assets/pictures/GCS+Logo+white+transparent.webp');
  
  // Calculate aspect ratio to maintain logo proportions
  const aspectRatio = useMemo(() => {
    const img = texture.image as HTMLImageElement | undefined;
    if (img?.width && img.height) {
      return img.width / img.height;
    }
    return 1;
  }, [texture]);

  const logoWidth = 2.5;
  const logoHeight = logoWidth / aspectRatio;

  return (
    <group position={[modelOffset, 0, 0]}>
      <mesh rotation={[0, 0, 0]}>
        <planeGeometry args={[logoWidth, logoHeight]} />
        <meshStandardMaterial 
          map={texture} 
          transparent 
          opacity={1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Renewed Vision Logo Component
function RenewedVisionLogoModel({ modelOffset = 0 }: { modelOffset?: number }) {
  const texture = useTexture('/assets/pictures/renewed-vision.png');
  
  // Calculate aspect ratio to maintain logo proportions
  const aspectRatio = useMemo(() => {
    const img = texture.image as HTMLImageElement | undefined;
    if (img?.width && img.height) {
      return img.width / img.height;
    }
    return 1;
  }, [texture]);

  const logoWidth = 2.5;
  const logoHeight = logoWidth / aspectRatio;

  return (
    <group position={[modelOffset, 0, 0]}>
      <mesh rotation={[0, 0, 0]}>
        <planeGeometry args={[logoWidth, logoHeight]} />
        <meshStandardMaterial 
          map={texture} 
          transparent 
          opacity={1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Skyline Products Logo Component
function SkylineLogoModel({ modelOffset = 0 }: { modelOffset?: number }) {
  const texture = useTexture('/assets/pictures/skyline-products.png');
  
  // Calculate aspect ratio to maintain logo proportions
  const aspectRatio = useMemo(() => {
    const img = texture.image as HTMLImageElement | undefined;
    if (img?.width && img.height) {
      return img.width / img.height;
    }
    return 1;
  }, [texture]);

  const logoWidth = 2.5;
  const logoHeight = logoWidth / aspectRatio;

  return (
    <group position={[modelOffset, 0, 0]}>
      <mesh rotation={[0, 0, 0]}>
        <planeGeometry args={[logoWidth, logoHeight]} />
        <meshStandardMaterial 
          map={texture} 
          transparent 
          opacity={1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

interface ScrollBasedResumeSceneProps {
  currentSection: number;
  scrollProgress: number;
  modelOffset?: number; // X offset for responsive positioning
  onCarouselCardClick?: (jobIndex: number, jobId: string) => void; // Handler for carousel card clicks
}

/**
 * Scroll-Based Resume Scene Component
 * Switches between different 3D scenes based on scroll position
 * Each job section has its own unique 3D content
 */
export function ScrollBasedResumeScene({ currentSection, scrollProgress, modelOffset = 0, onCarouselCardClick }: ScrollBasedResumeSceneProps) {
  const { previousRoot, camera } = useThree();
  const isPortal = !!previousRoot;

  // Suppress GLTF texture loading warnings for models not in use (e.g., black_honey_robotic_arm)
  // This prevents console noise from models that aren't loaded in this scene
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      const message = args[0]?.toString() || '';
      // Suppress GLTFLoader texture warnings for models not used in resumev3
      if (
        message.includes('GLTFLoader') && 
        message.includes('Couldn\'t load texture') &&
        (message.includes('robot_base') || message.includes('black_honey'))
      ) {
        // Suppress warnings for black_honey_robotic_arm model textures
        return;
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);
  
  // Camera target positions for each section
  // Position camera relative to text panel (left) and model (right)
  // Text panel: lg:pl-8 (2rem) + max-w-2xl (42rem) ≈ 44rem ≈ 704px ≈ 8.8 units
  // Model should be positioned to the right of text panel
  const cameraTargets = useMemo(() => {
    // Text panel ends at approximately X = 9 units (left padding + max width)
    // Position camera to view both text panel (left) and model (right)
    const textPanelEndX = 9; // Approximate end of text panel in 3D units
    const modelX = modelOffset; // Model X position (should be positive, to the right)
    
    // Calculate midpoint between text panel end and model for optimal viewing
    const midpointX = (textPanelEndX + modelX) / 2;
    
    const targets = [
      // Hero section - camera positioned to view both info panel and carousel
      // Carousel is offset to the right at modelOffset, matching individual model positions
      { 
        position: [midpointX, 1.5, 5] as [number, number, number], // Camera between text and carousel
        target: [modelX * 0.7, 0, 0] as [number, number, number] // Look directly at carousel center to avoid tilt
      }
    ];
    
    // Add camera positions for each job - positioned to view model on right
    resumeJobs.forEach((job, index) => {
      // Camera positioned to view model on right, with slight angle to see info panel on left
      targets.push({
        position: [
          midpointX, // Camera at midpoint for balanced view
          1.5 , // Slight vertical offset per section
          9.5  // Slight distance adjustment per section
        ] as [number, number, number],
        target: [modelX * 0.7, 0, 0] as [number, number, number] // Look slightly toward model but can see info panel
      });
    });
    
    return targets;
  }, [modelOffset]);

  const target = cameraTargets[Math.min(currentSection, cameraTargets.length - 1)];
  const targetPos = useMemo(() => new THREE.Vector3(...target.position), [currentSection, target.position, modelOffset]);
  const targetLook = useMemo(() => new THREE.Vector3(...target.target), [currentSection, target.target, modelOffset]);

  // Smooth camera transitions
  useFrame((state, delta) => {
    easing.damp3(state.camera.position, targetPos, 0.4, delta);
    state.camera.lookAt(targetLook);
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} />
      <pointLight position={[0, 5, 0]} intensity={0.8} distance={10} />

      {/* Environment */}
      {!isPortal && <Environment preset="city" />}

      {/* Hero Section Carousel - show when currentSection === 0 */}
      {currentSection === 0 && !isPortal && (
        <Suspense fallback={null}>
          <ResumeCarousel
            modelOffset={modelOffset}
            radius={1.4}
            autoRotateSpeed={0.3}
            onCardClick={onCarouselCardClick}
          />
        </Suspense>
      )}

      {/* Section-specific 3D content - pass modelOffset for responsive positioning */}
      {/* currentSection 0 = hero (show carousel), 1+ = jobs (index = currentSection - 1) */}
      {currentSection > 0 && currentSection <= resumeJobs.length && (
        <JobSection 
          key={resumeJobs[currentSection - 1].id} 
          job={resumeJobs[currentSection - 1]} 
          modelOffset={modelOffset} 
          index={currentSection - 1} 
        />
      )}

      {/* Contact Shadows */}
      {!isPortal && (
        <ContactShadows
          frames={1}
          rotation-x={Math.PI / 2}
          position={[modelOffset, -1.5, 0]}
          far={2}
          width={8}
          height={8}
          blur={3}
          opacity={0.25}
        />
      )}

      {/* Orbit Controls */}
      {!isPortal && (
        <OrbitControls 
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={8}
          enableZoom={true}
          enablePan={true}
          autoRotate={false}
          target={targetLook}
        />
      )}
    </>
  );
}

// Tesla Logo Model Component
function TeslaLogoModel({ modelOffset = 0 }: { modelOffset?: number }) {
  const gltfPath = '/assets/tesla_logo.glb';
  const { scene } = useGLTF(gltfPath);

  // Calculate bounding box to center and scale the model appropriately
  const { scale, center } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const centerVec = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleValue = 2.5 / maxDim; // Scale to fit in ~2.5 unit space
    return { scale: scaleValue, center: centerVec };
  }, [scene]);

  // Clone the scene to avoid mutating the original
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return (
    <group position={[modelOffset, 0, 0]} rotation={[0, 0 , 0]}>
      <primitive 
        object={clonedScene} 
        scale={[scale, scale, scale]}
        position={[-center.x * scale, -center.y * scale, -center.z * scale]}
        rotation={[0, 0, 0]} // Model orientation handled by parent group
      />
    </group>
  );
}

// Job Section Component - Creates unique 3D visualization for each job
function JobSection({ job, modelOffset = 0, index }: { job: typeof resumeJobs[0]; modelOffset?: number; index: number }) {
  const color = new THREE.Color(job.color);
  const hasCustomModel = job.modelType !== undefined;
  
  return (
    <group>
      {/* Main geometric representation - varies by job based on modelType from config */}
      {job.modelType === 'tesla' && (
        // Tesla - Use Tesla logo GLB model
        <Suspense fallback={
          <group>
            <mesh position={[modelOffset, 0, 0]}>
              <boxGeometry args={[1.5, 0.8, 0.6]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        }>
          <TeslaLogoModel modelOffset={modelOffset} />
        </Suspense>
      )}
      
      {job.modelType === 'renewed-vision' && (
        // Renewed Vision - Use Renewed Vision logo image
        <Suspense fallback={
          <group>
            <mesh position={[modelOffset, 0, 0]}>
              <cylinderGeometry args={[0.8, 0.8, 1.5, 32]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        }>
          <RenewedVisionLogoModel modelOffset={modelOffset} />
        </Suspense>
      )}
      
      {job.modelType === 'skyline' && (
        // Skyline - Use Skyline Products logo image
        <Suspense fallback={
          <group>
            <mesh position={[modelOffset, 0, 0]}>
              <boxGeometry args={[1, 0.3, 1]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        }>
          <SkylineLogoModel modelOffset={modelOffset} />
        </Suspense>
      )}
      
      {job.modelType === 'neural-network' && (
        // LAPP - Engineering/Procurement - Use reusable neural network from landing page
        <Suspense fallback={
          <group>
            <mesh position={[modelOffset, 0, 0]}>
              <torusGeometry args={[0.8, 0.2, 16, 32]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        }>
          <group position={[modelOffset, 0, 0]}>
            <NeuralNetwork position={[0, -0.09, 0]} />
          </group>
        </Suspense>
      )}
      
      {job.modelType === 'gcs' && (
        // Global Call - Use GCS logo image
        <Suspense fallback={
          <group>
            <mesh position={[modelOffset, 0, 0]}>
              <octahedronGeometry args={[0.8, 0]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        }>
          <GCSLogoModel modelOffset={modelOffset} />
        </Suspense>
      )}
      
      {/* Company color accent - only show if no custom model is defined */}
      {!hasCustomModel && (
        <mesh position={[modelOffset, -1, 0]}>
          <boxGeometry args={[2, 0.1, 0.1]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      )}
    </group>
  );
}

