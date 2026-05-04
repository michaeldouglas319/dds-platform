import { MainTitle } from './MainTitle';
import { AccentSection } from './AccentSection';
import { CYCLING_PRESETS } from '../config/cycling.config';

interface TextOverlayProps {
  isLoaded: boolean;
  onMorphComplete?: (word: string, elementRef?: HTMLElement) => void;
  cyclingPreset?: keyof typeof CYCLING_PRESETS;
}

export function TextOverlay({
  isLoaded,
  onMorphComplete,
  cyclingPreset = 'smooth',
}: TextOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <div className="md:grid md:grid-cols-[1fr_auto] h-full w-full">
        {/* Left Side - Main Text (hidden on mobile) */}
        <div className="hidden md:flex flex-col justify-between p-4 md:p-16 lg:p-24 xl:p-32 lg:pt-32 pb-4 md:pb-16">
          <MainTitle onMorphComplete={onMorphComplete} cyclingPreset={cyclingPreset} />
        </div>

      {/* Right Side - Accent (full screen on mobile, side panel on desktop) */}
      <AccentSection />
      </div>
      
      {/* Top Right - Interactive hint */}
      <div 
        className="absolute top-8 right-8 md:top-16 md:right-16 lg:top-24 lg:right-24 pointer-events-auto transition-opacity duration-300"
        style={{ opacity: isLoaded ? 1 : 0 }}
      >
      </div>
    </div>
  );
}

