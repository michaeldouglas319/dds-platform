'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { AIConfig } from './types';

const defaultConfig: AIConfig = {
  model: 'gpt-4o-mini',
  apiEndpoint: '/api/chat',
  enabled: true,
};

const AIContext = createContext<AIConfig>(defaultConfig);

export function AIProvider({
  children,
  model = defaultConfig.model,
  apiEndpoint = defaultConfig.apiEndpoint,
  enabled = defaultConfig.enabled,
}: {
  children: ReactNode;
  model?: string;
  apiEndpoint?: string;
  enabled?: boolean;
}) {
  return (
    <AIContext.Provider value={{ model, apiEndpoint, enabled }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI(): AIConfig {
  return useContext(AIContext);
}
