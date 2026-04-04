import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { AppConfigProvider, useAppConfig, useFeatureFlag, useCurrentPage } from '../config/index';
import type { AppConfig } from '@dds/types';

const testConfig: AppConfig = {
  app: { name: 'test-app' },
  navigation: { items: [{ label: 'Home', path: '/' }] },
  pages: [
    {
      id: 'home',
      path: '/',
      meta: { title: 'Home', description: 'Home page' },
      sections: [],
    },
    {
      id: 'about',
      path: '/about',
      meta: { title: 'About', description: 'About page' },
      sections: [],
    },
  ],
  features: { chat: true, commerce: false },
};

describe('AppConfigProvider', () => {
  it('provides config to children', () => {
    function Consumer() {
      const config = useAppConfig();
      return <div data-testid="name">{config.app.name}</div>;
    }
    render(
      <AppConfigProvider config={testConfig}>
        <Consumer />
      </AppConfigProvider>
    );
    expect(screen.getByTestId('name')).toHaveTextContent('test-app');
  });
});

describe('useAppConfig', () => {
  it('throws without provider', () => {
    expect(() => {
      renderHook(() => useAppConfig());
    }).toThrow('useAppConfig must be used within an <AppConfigProvider>');
  });
});

describe('useFeatureFlag', () => {
  it('returns correct flag value', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppConfigProvider config={testConfig}>{children}</AppConfigProvider>
    );
    const { result: chatResult } = renderHook(() => useFeatureFlag('chat'), { wrapper });
    expect(chatResult.current).toBe(true);

    const { result: commerceResult } = renderHook(() => useFeatureFlag('commerce'), { wrapper });
    expect(commerceResult.current).toBe(false);

    const { result: unknownResult } = renderHook(() => useFeatureFlag('nonexistent'), { wrapper });
    expect(unknownResult.current).toBe(false);
  });
});

describe('useCurrentPage', () => {
  it('returns matching page', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppConfigProvider config={testConfig}>{children}</AppConfigProvider>
    );
    const { result } = renderHook(() => useCurrentPage('/about'), { wrapper });
    expect(result.current).toBeDefined();
    expect(result.current?.id).toBe('about');
  });

  it('returns undefined for non-matching path', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppConfigProvider config={testConfig}>{children}</AppConfigProvider>
    );
    const { result } = renderHook(() => useCurrentPage('/nonexistent'), { wrapper });
    expect(result.current).toBeUndefined();
  });
});
