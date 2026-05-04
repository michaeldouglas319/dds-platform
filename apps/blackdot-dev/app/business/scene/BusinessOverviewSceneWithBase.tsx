import { BaseScene } from '../../../components/three/scenes/BaseScene';
import { BusinessScenePortal } from './BusinessScenePortal';
import { BusinessOverviewScene } from './BusinessOverviewScene';

interface BusinessOverviewSceneWithBaseProps {
  currentSection?: number;
  scrollProgress?: number;
  modelOffset?: number;
}

/**
 * BusinessOverviewSceneWithBase - Wraps BusinessOverviewScene with BaseScene
 * Uses children prop to pass content instead of portal/detail split
 */
export function BusinessOverviewSceneWithBase({
  currentSection = 0,
  scrollProgress = 0,
  modelOffset = 0
}: BusinessOverviewSceneWithBaseProps) {
  return (
    <BaseScene cameraPosition={[5, 5, 5]} showControls={true}>
      <BusinessOverviewScene
        currentSection={currentSection}
        scrollProgress={scrollProgress}
        modelOffset={modelOffset}
      />
    </BaseScene>
  );
}

