import { describe, it, expect } from 'vitest';
import { createRegistry, defaultRegistry } from '../registry';

describe('createRegistry', () => {
  it('creates a registry from entries', () => {
    const mockEntry = {
      component: () => null,
      metadata: { name: 'test', displayName: 'Test' },
    };
    const registry = createRegistry({ test: mockEntry });
    expect(registry).toHaveProperty('test');
    expect(registry.test).toBe(mockEntry);
  });

  it('returns a new object (not the same reference)', () => {
    const entries = {
      test: {
        component: () => null,
        metadata: { name: 'test', displayName: 'Test' },
      },
    };
    const registry = createRegistry(entries);
    expect(registry).not.toBe(entries);
    expect(registry).toEqual(entries);
  });
});

describe('defaultRegistry', () => {
  const expectedKeys = [
    'intro',
    'hero',
    'text',
    'section',
    'header',
    'text-only',
    'stats-grid',
    'feature-matrix',
    'timeline',
    'cta',
    'centered-text',
    'two-column',
    'sectors-grid',
    'wiki-article',
  ];

  it('contains all expected layout keys', () => {
    for (const key of expectedKeys) {
      expect(defaultRegistry).toHaveProperty(key);
    }
  });

  it('has no unexpected keys', () => {
    const keys = Object.keys(defaultRegistry);
    expect(keys.sort()).toEqual(expectedKeys.sort());
  });

  it.each(expectedKeys)('entry "%s" has a component function and metadata object', (key) => {
    const entry = defaultRegistry[key];
    expect(typeof entry.component).toBe('function');
    expect(typeof entry.metadata).toBe('object');
    expect(entry.metadata).toHaveProperty('name');
    expect(entry.metadata).toHaveProperty('displayName');
  });
});
