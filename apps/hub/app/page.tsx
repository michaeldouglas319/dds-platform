import { headers } from 'next/headers';
import { getDomainConfig } from '../config/domains';
import { LandingRenderer } from '../renderers/landing';
import { GridRenderer } from '../renderers/grid';
import { WikiRenderer } from '../renderers/wiki';

export default async function Page() {
  const host = (await headers()).get('host') ?? '';
  const config = getDomainConfig(host);

  switch (config.renderer) {
    case 'grid':
      return <GridRenderer {...config} />;

    case 'wiki':
      return <WikiRenderer {...config} />;

    case 'puck':
      return <LandingRenderer {...config} />;

    case 'landing':
    default:
      return <LandingRenderer {...config} />;
  }
}
