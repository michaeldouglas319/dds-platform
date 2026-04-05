import { headers } from 'next/headers';
import { getDomainConfig } from '../config/domains';
import { LandingRenderer } from '../renderers/landing';

// Add renderer imports here as they're built out:
// import { PuckViewer } from '../renderers/puck/viewer';

export default async function Page() {
  const host = (await headers()).get('host') ?? '';
  const config = getDomainConfig(host);

  switch (config.renderer) {
    case 'puck':
      // Puck viewer loads persisted page data per domain.
      // Until content is published, falls back to landing.
      return <LandingRenderer {...config} />;

    // Uncomment as each renderer is implemented:
    // case 'wiki':   return <WikiRenderer {...config} />;
    // case 'shop':   return <ShopRenderer {...config} />;
    // case 'gallery': return <GalleryRenderer {...config} />;

    case 'landing':
    default:
      return <LandingRenderer {...config} />;
  }
}
