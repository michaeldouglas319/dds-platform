'use client';

import type { Config } from '@measured/puck';

/**
 * Puck component config for DDS sites.
 * Add components here as the design system expands.
 * Each component maps to a dds-renderer section type.
 */
export const puckConfig: Config = {
  components: {
    Heading: {
      fields: {
        text: { type: 'text' },
        level: {
          type: 'select',
          options: [
            { label: 'H1', value: 'h1' },
            { label: 'H2', value: 'h2' },
            { label: 'H3', value: 'h3' },
          ],
        },
      },
      defaultProps: {
        text: 'Heading',
        level: 'h1',
      },
      render: ({ text, level }) => {
        const Tag = level as 'h1' | 'h2' | 'h3';
        return (
          <Tag
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              margin: '0 0 1rem',
            }}
          >
            {text}
          </Tag>
        );
      },
    },

    Text: {
      fields: {
        content: { type: 'textarea' },
      },
      defaultProps: {
        content: 'Add your text here.',
      },
      render: ({ content }) => (
        <p
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: 1.7,
            margin: '0 0 1rem',
            color: '#333',
          }}
        >
          {content}
        </p>
      ),
    },

    BlackDot: {
      fields: {},
      defaultProps: {},
      render: () => (
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#000',
            margin: '2rem auto',
          }}
        />
      ),
    },
  },

  root: {
    fields: {
      title: { type: 'text' },
    },
    defaultProps: { title: '' },
    render: ({ children }) => (
      <div
        style={{
          minHeight: '100vh',
          background: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '4rem 2rem',
          maxWidth: 800,
          margin: '0 auto',
        }}
      >
        {children}
      </div>
    ),
  },
};
