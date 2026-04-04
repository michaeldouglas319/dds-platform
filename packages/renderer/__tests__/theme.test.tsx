import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../theme/index';

function ThemeConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  it('renders children', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Hello</div>
      </ThemeProvider>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });
});

describe('useTheme', () => {
  it('returns theme state with default dark', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('respects defaultTheme prop', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });
});

describe('toggleTheme', () => {
  it('switches between dark and light', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    act(() => {
      screen.getByText('Toggle').click();
    });
    expect(screen.getByTestId('theme')).toHaveTextContent('light');

    act(() => {
      screen.getByText('Toggle').click();
    });
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });
});
