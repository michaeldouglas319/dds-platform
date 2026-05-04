'use client'

import { useRef, useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { TextOverlay } from './TextOverlay';
import { NetworkRef } from '../types/network.types';
import { usePathnameBreadcrumbs, useNavigationVisibility } from '@/lib/contexts';
import { DEFAULT_LANDING_DISPLAY_CONFIG, LOADER_LIST, type LoaderType } from '../config/display.config';
import { CYCLING_PRESETS } from '../config/cycling.config';
import { SceneTweaksEditor } from '@/app/(protected-admin)/curved-takeoff-orbit/components/SceneTweaksEditor';
import { LandingScene3D } from './LandingScene';
import DebugPanel from './DebugPanel';
import { FeatureGated } from '@/lib/client/FeatureGated';
import { useResponsiveCamera } from '@/lib/hooks/useResponsiveCamera';

interface LandingLayoutProps {
  onTextMorph?: (word: string) => void;
}

function LandingLayout({ onTextMorph }: LandingLayoutProps) {
  const [_isLoaded] = useState(false);
  const networkCollisionRef = useRef<NetworkRef | null>(null);
  const { setVariant, setShowBreadcrumbs } = useNavigationVisibility();

  // Debug state for fine-tuning
  const [debugScale, setDebugScale] = useState(0.6); // Scale for scele model
  const [showDebug, setShowDebug] = useState(false);

  // Responsive camera positioning and FOV
  const [cameraPos, cameraFov] = useResponsiveCamera({
    basePosition: [0, 5, 18],
    baseFov: 50,
    breakpoints: [
      { width: 0, yPosition: 0, fov: 45 },    // Mobile
      { width: 640, yPosition: 0, fov: 48 },  // Tablet
      { width: 1024, yPosition: 0, fov: 50 }, // Desktop
      { width: 1536, yPosition: 0, fov: 55 }, // Large desktop
    ],
    debounceDelay: 150,
  });
  const [currentLoader, setCurrentLoader] = useState<LoaderType>(DEFAULT_LANDING_DISPLAY_CONFIG.centerLoader);
  const [loaderScale, setLoaderScale] = useState(DEFAULT_LANDING_DISPLAY_CONFIG.loaderScale);
  const [loaderPosition, setLoaderPosition] = useState(DEFAULT_LANDING_DISPLAY_CONFIG.loaderPosition);
  const [loaderRotation, setLoaderRotation] = useState(DEFAULT_LANDING_DISPLAY_CONFIG.loaderRotation);
  const [loaderLightResponsive, setLoaderLightResponsive] = useState(DEFAULT_LANDING_DISPLAY_CONFIG.loaderLightResponsive);
  
  // Item10 customization state
  const [item10OuterRadius, setItem10OuterRadius] = useState(DEFAULT_LANDING_DISPLAY_CONFIG.item10OuterRadius ?? 1.0);
  const [item10InnerRadius, setItem10InnerRadius] = useState(DEFAULT_LANDING_DISPLAY_CONFIG.item10InnerRadius ?? 0.2);
  const [item10Depth, setItem10Depth] = useState(DEFAULT_LANDING_DISPLAY_CONFIG.item10Depth ?? 0.3);
  const [item10Segments, setItem10Segments] = useState(DEFAULT_LANDING_DISPLAY_CONFIG.item10Segments ?? 4);
  
  // Profile image controls state
  const [profileImageScale, setProfileImageScale] = useState(DEFAULT_LANDING_DISPLAY_CONFIG.profileImageScale ?? 1.5);
  const [profileImagePosition, setProfileImagePosition] = useState<[number, number, number]>(DEFAULT_LANDING_DISPLAY_CONFIG.profileImagePosition ?? [0, 0, 0.1]);
  const [profileImageMetalness, setProfileImageMetalness] = useState(DEFAULT_LANDING_DISPLAY_CONFIG.profileImageMetalness ?? 0.4);
  const [profileImageRoughness, setProfileImageRoughness] = useState(DEFAULT_LANDING_DISPLAY_CONFIG.profileImageRoughness ?? 0.3);
  const [profileImageGlow, setProfileImageGlow] = useState(DEFAULT_LANDING_DISPLAY_CONFIG.profileImageGlow ?? 0.2);

  // Scene tweaks state
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [ambientIntensity, setAmbientIntensity] = useState(0.0);
  const [directionalIntensity, setDirectionalIntensity] = useState(0.0);
  const [particleCount, setParticleCount] = useState(4);
  const [particleColorMode, setParticleColorMode] = useState<'rainbow' | 'gradient' | 'solid' | 'thermal'>('rainbow');
  const [bloomIntensity, setBloomIntensity] = useState(0.045);
  const [saturation, setSaturation] = useState(0.5);
  const [brightness, setBrightness] = useState(1.0);

  // Text cycling preset
  const [cyclingPreset, setCyclingPreset] = useState<keyof typeof CYCLING_PRESETS>('smooth');

  // Auto-cycle loaders based on config timing
  useEffect(() => {
    const config = CYCLING_PRESETS[cyclingPreset].model;
    if (!config.enabled) return;

    const cycleInterval = config.displayDuration + config.transition.duration;
    const startDelay = (config.startDelay || 0) * 1000;

    let timeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    timeout = setTimeout(() => {
      interval = setInterval(() => {
        setCurrentLoader((prev) => {
          const idx = LOADER_LIST.indexOf(prev);
          return LOADER_LIST[(idx + 1) % LOADER_LIST.length];
        });
      }, cycleInterval * 1000);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [cyclingPreset]);


  // Set breadcrumbs for home page
  usePathnameBreadcrumbs();

  // Use minimal navigation for landing page to not obstruct 3D scene
  useEffect(() => {
    setVariant('minimal');
    setShowBreadcrumbs(false);

    return () => {
      setVariant('full');
      setShowBreadcrumbs(true);
    };
  }, [setVariant, setShowBreadcrumbs]);

  // Handle text morphing into particle - called from TextOverlay
  const handleTextMorph = useCallback((word: string, elementRef?: HTMLElement) => {
    // Use global handler if available (set by TextToNodeHandler inside Canvas)
    const handler = (window as Window & { __handleTextMorph?: (word: string, elementRef?: HTMLElement) => void }).__handleTextMorph;
    if (handler) {
      handler(word, elementRef);
    } else if (networkCollisionRef.current) {
      // Fallback to random position if handler not ready
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 0.3;
      const height = -0.09 + (Math.random() - 0.5) * 0.2;
      
      const position = new THREE.Vector3(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      
      networkCollisionRef.current.integrateParticle(position, 0);
    }
    // Call optional callback if provided
    onTextMorph?.(word);
  }, [onTextMorph]);

  // Separate callback for TextToNodeHandler to avoid circular dependency
  const handleMorphComplete = useCallback((word: string) => {
    // Just call the parent callback, don't trigger handler again
    onTextMorph?.(word);
  }, [onTextMorph]);

  return (
    <div className="w-full bg-gradient-to-b from-background to-slate-950">


      {/* Hero Section - 3D Canvas */}
      <div className="relative w-full h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
        {/* 3D Canvas */}
        <div className="absolute inset-0 z-0">
          <LandingScene3D
            networkRef={networkCollisionRef as React.RefObject<NetworkRef>}
            onMorphComplete={handleMorphComplete}
            cameraPos={cameraPos}
            cameraFov={cameraFov}
            backgroundColor={backgroundColor}
            ambientIntensity={ambientIntensity}
            directionalIntensity={directionalIntensity}
            debugScale={debugScale}
            currentLoader={currentLoader}
            loaderScale={loaderScale}
            loaderPosition={loaderPosition}
            loaderRotation={loaderRotation}
            loaderLightResponsive={loaderLightResponsive}
            bloomIntensity={bloomIntensity}
            saturation={saturation}
            brightness={brightness}
            item10OuterRadius={item10OuterRadius}
            item10InnerRadius={item10InnerRadius}
            item10Depth={item10Depth}
            item10Segments={item10Segments}
            profileImageScale={profileImageScale}
            profileImagePosition={profileImagePosition}
            profileImageMetalness={profileImageMetalness}
            profileImageRoughness={profileImageRoughness}
            profileImageGlow={profileImageGlow}
          />
        </div>
        <TextOverlay
          isLoaded={_isLoaded}
          onMorphComplete={handleTextMorph}
          cyclingPreset={cyclingPreset}
        />

        {/* Top Header Navigation (Large Screens) */}
        {/* <LandingHeader /> */}

              {/* Debug Panel Toggle - Admin Only */}
      <FeatureGated>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="fixed bottom-4 left-4 z-[100] px-2 py-1 bg-slate-800 text-[10px] text-slate-400 rounded border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          {showDebug ? 'Hide' : 'Show'} Debug
        </button>

        <DebugPanel />
          <SceneTweaksEditor
            backgroundColor={backgroundColor}
            onBackgroundColorChange={setBackgroundColor}
            ambientIntensity={ambientIntensity}
            onAmbientIntensityChange={setAmbientIntensity}
            directionalIntensity={directionalIntensity}
            onDirectionalIntensityChange={setDirectionalIntensity}
            particleCount={particleCount}
            onParticleCountChange={setParticleCount}
            particleColorMode={particleColorMode}
            onParticleColorModeChange={setParticleColorMode}
            bloomIntensity={bloomIntensity}
            onBloomIntensityChange={setBloomIntensity}
            saturation={saturation}
            onSaturationChange={setSaturation}
            brightness={brightness}
            onBrightnessChange={setBrightness}
          />
        </FeatureGated>

        {/* Text Overlay */}
        
        {/* Gradient Overlays for better text readability */}
      </div>
    </div>
  );
}

export default LandingLayout;
export { LandingLayout };

