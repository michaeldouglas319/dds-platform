import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { AIProvider, useAI } from '../provider';

describe('AIProvider', () => {
  it('renders children', () => {
    render(
      <AIProvider>
        <div data-testid="child">Hello AI</div>
      </AIProvider>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('Hello AI');
  });
});

describe('useAI', () => {
  it('returns default config (model, endpoint, enabled)', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AIProvider>{children}</AIProvider>
    );
    const { result } = renderHook(() => useAI(), { wrapper });
    expect(result.current.model).toBe('gpt-4o-mini');
    expect(result.current.apiEndpoint).toBe('/api/chat');
    expect(result.current.enabled).toBe(true);
  });

  it('returns default values without provider (context default)', () => {
    // useAI uses createContext with a default value, so it works without a provider
    const { result } = renderHook(() => useAI());
    expect(result.current.model).toBe('gpt-4o-mini');
    expect(result.current.apiEndpoint).toBe('/api/chat');
    expect(result.current.enabled).toBe(true);
  });
});
