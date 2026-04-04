import { describe, it, expect } from 'vitest';
import { isAppConfig } from '../config';
import type { AppConfig, FeatureFlags } from '../config';

describe('isAppConfig', () => {
  const validConfig: AppConfig = {
    app: { name: 'test-app' },
    navigation: { items: [] },
    pages: [],
  };

  it('returns true for a valid AppConfig object', () => {
    expect(isAppConfig(validConfig)).toBe(true);
  });

  it('returns true for a valid AppConfig with optional fields', () => {
    const config: AppConfig = {
      ...validConfig,
      theme: { primary: '#000' },
      features: { chat: true },
    };
    expect(isAppConfig(config)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isAppConfig(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isAppConfig(undefined)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isAppConfig('not a config')).toBe(false);
  });

  it('returns false for an object missing app', () => {
    expect(isAppConfig({ navigation: { items: [] }, pages: [] })).toBe(false);
  });

  it('returns false for an object missing navigation', () => {
    expect(isAppConfig({ app: { name: 'x' }, pages: [] })).toBe(false);
  });

  it('returns false for an object where pages is not an array', () => {
    expect(isAppConfig({ app: { name: 'x' }, navigation: { items: [] }, pages: 'not-array' })).toBe(false);
  });
});

describe('FeatureFlags type', () => {
  it('supports known feature flags', () => {
    const flags: FeatureFlags = {
      chat: true,
      commerce: false,
      docs: true,
      blog: false,
      gallery: true,
    };
    expect(flags.chat).toBe(true);
    expect(flags.commerce).toBe(false);
    expect(flags.docs).toBe(true);
  });

  it('supports arbitrary string keys', () => {
    const flags: FeatureFlags = {
      customFeature: true,
      anotherFeature: false,
    };
    expect(flags.customFeature).toBe(true);
    expect(flags.anotherFeature).toBe(false);
  });
});
