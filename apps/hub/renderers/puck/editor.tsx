'use client';

import { Puck } from '@measured/puck';
import '@measured/puck/puck.css';
import { puckConfig } from './config';

interface PuckEditorProps {
  domain: string;
  initialData?: Parameters<typeof Puck>[0]['data'];
  onPublish: (data: Parameters<typeof Puck>[0]['data']) => Promise<void>;
}

export function PuckEditor({ domain, initialData, onPublish }: PuckEditorProps) {
  const defaultData = {
    content: [
      {
        type: 'BlackDot',
        props: { id: 'dot-1' },
      },
      {
        type: 'Heading',
        props: { id: 'heading-1', text: domain, level: 'h1' },
      },
    ],
    root: { props: { title: domain } },
    zones: {},
  };

  return (
    <Puck
      config={puckConfig}
      data={initialData ?? defaultData}
      onPublish={onPublish}
    />
  );
}
