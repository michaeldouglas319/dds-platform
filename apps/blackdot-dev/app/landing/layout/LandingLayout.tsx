'use client'

import { useRef, useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { NetworkRef } from '../types/network.types';
import { usePathnameBreadcrumbs, useNavigationVisibility } from '@/lib/contexts';
import { DEFAULT_LANDING_DISPLAY_CONFIG } from '../config/display.config';
import { SceneTweaksEditor } from '@/app/(protected-admin)/curved-takeoff-orbit/components/SceneTweaksEditor';
import { LandingScene3D } from './LandingScene';
import DebugPanel from './DebugPanel';
import { FeatureGated } from '@/lib/client/FeatureGated';
import { useResponsiveCamera } from '@/lib/hooks/useResponsiveCamera';

interface LandingLayoutProps {
  onTextMorph?: (word: string) => void;
}

function LandingLayout({ onTextMorph }: LandingLayoutProps) {
  const networkCollisionRef = useRef<NetworkRef | null>(null);
  const { setVariant, setShowBreadcrumbs } = useNavigationVisibility();

  // Debug state for fine-tuning
  const [debugScale, setDebugScale] = useState(0.6);
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

  // Scene tweaks state
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [ambientIntensity, setAmbientIntensity] = useState(0.0);
  const [directionalIntensity, setDirectionalIntensity] = useState(0.0);
  const [particleCount, setParticleCount] = useState(4);
  const [particleColorMode, setParticleColorMode] = useState<'rainbow' | 'gradient' | 'solid' | 'thermal'>('rainbow');
  const [bloomIntensity, setBloomIntensity] = useState(0.045);
  const [saturation, setSaturation] = useState(0.5);
  const [brightness, setBrightness] = useState(1.0);


  // Set breadcrumbs for home page
  usePathnameBreadcrumbs();

  // Use minimal navigation for landing page to not obstruct 3D scene
  const { setIsVisible } = useNavigationVisibility();
  useEffect(() => {
    setVariant('minimal');
    setShowBreadcrumbs(false);
    setIsVisible(false);  // Hide nav bar by default, shown as 3D element instead

    return () => {
      setVariant('full');
      setShowBreadcrumbs(true);
      setIsVisible(true);  // Reset when leaving landing page
    };
  }, [setVariant, setShowBreadcrumbs, setIsVisible]);

  // Handle text morphing into particle
  const handleMorphComplete = useCallback((word: string) => {
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
            bloomIntensity={bloomIntensity}
            saturation={saturation}
            brightness={brightness}
          />
        </div>
        {/* <TextOverlay
          isLoaded={_isLoaded}
          onMorphComplete={handleTextMorph}
          cyclingPreset={cyclingPreset}
        /> */}

        {/* Top Header Navigation (Large Screens) */}
        {/* <LandingHeader /> */}

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
      </div>
    </div>
  );
}

export default LandingLayout;
export { LandingLayout };

