'use client'

import { useState, useCallback, useEffect } from 'react';
import { usePathnameBreadcrumbs, useNavigationVisibility } from '@/lib/contexts';
import { DEFAULT_LANDING_DISPLAY_CONFIG, LOADER_LIST, type LoaderType } from '../config/display.config';

interface DebugPanelProps {
  onTextMorph?: (word: string) => void;
}

function DebugPanel({   }: DebugPanelProps) {
  const [_isLoaded] = useState(false);
  const { setVariant, setShowBreadcrumbs } = useNavigationVisibility();

  // Debug state for fine-tuning
  const [debugScale, setDebugScale] = useState(0.2);
  const [cameraPos, setCameraPos] = useState<[number, number, number]>([0, 13, 10]);
  const [showDebug, setShowDebug] = useState(false);
  const [currentLoader, setCurrentLoader] = useState<LoaderType>(DEFAULT_LANDING_DISPLAY_CONFIG.centerLoader);
  const [loaderScale, setLoaderScale] = useState(DEFAULT_LANDING_DISPLAY_CONFIG.loaderScale);
  const [loaderLightResponsive, setLoaderLightResponsive] = useState(DEFAULT_LANDING_DISPLAY_CONFIG.loaderLightResponsive);

  // Scene tweaks state

  // Auto-cycle loaders every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLoader((prev) => {
        const idx = LOADER_LIST.indexOf(prev);
        return LOADER_LIST[(idx + 1) % LOADER_LIST.length];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Cycle loader function for debug panel
  const cycleLoader = useCallback(() => {
    setCurrentLoader((prev) => {
      const idx = LOADER_LIST.indexOf(prev);
      return LOADER_LIST[(idx + 1) % LOADER_LIST.length];
    });
  }, []);

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

  return (
    <>
      {showDebug && (
        <div className="fixed bottom-12 left-4 z-[100] p-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl w-64 space-y-4 text-white">
          <div className="space-y-2">
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block text-left">Scene Scale: {debugScale.toFixed(3)}</label>
            <input 
              type="range" min="0.001" max="1.0" step="0.001" value={debugScale} 
              onChange={(e) => setDebugScale(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block text-left">Camera Z: {cameraPos[2].toFixed(1)}</label>
            <input 
              type="range" min="0.1" max="200" step="1" value={cameraPos[2]} 
              onChange={(e) => setCameraPos([cameraPos[0], cameraPos[1], parseFloat(e.target.value)])}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block text-left">Camera Y: {cameraPos[1].toFixed(1)}</label>
            <input 
              type="range" min="-100" max="100" step="1" value={cameraPos[1]} 
              onChange={(e) => setCameraPos([cameraPos[0], parseFloat(e.target.value), cameraPos[2]])}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          {/* Loader Controls */}
          <div className="border-t border-slate-600 pt-3 space-y-3">
            <div className="space-y-2">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block text-left">Center Loader: {currentLoader}</label>
              <button
                onClick={cycleLoader}
                className="w-full px-2 py-1 bg-slate-700 text-[10px] text-slate-200 rounded border border-slate-600 hover:bg-slate-600 transition-colors"
              >
                Next Loader →
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block text-left">Loader Scale: {loaderScale.toFixed(2)}</label>
              <input
                type="range" min="0.1" max="2.0" step="0.1" value={loaderScale}
                onChange={(e) => setLoaderScale(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <label className="flex items-center gap-2 text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={loaderLightResponsive}
                onChange={(e) => setLoaderLightResponsive(e.target.checked)}
                className="w-3 h-3 rounded border-slate-600 accent-blue-500"
              />
              <span>Light Responsive</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setDebugScale(0.02); setCameraPos([0, 20, 50]); }}
              className="flex-1 px-2 py-1 bg-slate-800 text-[10px] text-slate-300 rounded border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              Reset
            </button>
          </div>
          <p className="text-[9px] text-slate-500 italic">OrbitControls are enabled. Click & drag to look around.</p>
        </div>
      )}
    </>
  );
}

export default DebugPanel;
export { DebugPanel };

