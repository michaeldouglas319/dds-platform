import { MorphingText } from '../title/MorphingText';
import { CYCLING_PRESETS } from '../config/cycling.config';

interface MainTitleProps {
  onMorphComplete?: (word: string, elementRef?: HTMLElement) => void;
  cyclingPreset?: keyof typeof CYCLING_PRESETS;
}

export function MainTitle({
  onMorphComplete,
  cyclingPreset = 'smooth',
}: MainTitleProps) {
  const cyclingConfig = CYCLING_PRESETS[cyclingPreset];

  return (
    <div className="space-y-0">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.74em] text-foreground tracking-tight">
        SCALE
        <br />
        THROUGH
        <br />
        CEASELESS
        <br />
        <MorphingText
          words={['ADAPTATION', 'INNOVATION', 'COMPETITION']}
          onMorphComplete={onMorphComplete}
          displayDuration={cyclingConfig.text.displayDuration}
          transitionDuration={cyclingConfig.text.transition.duration}
          transitionConfig={cyclingConfig.text.transition}
        />
      </h1>
    </div>
  );
}

