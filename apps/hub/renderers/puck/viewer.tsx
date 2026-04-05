'use client';

import { Render } from '@measured/puck';
import { puckConfig } from './config';

interface PuckViewerProps {
  data: Parameters<typeof Render>[0]['data'];
}

export function PuckViewer({ data }: PuckViewerProps) {
  return <Render config={puckConfig} data={data} />;
}
