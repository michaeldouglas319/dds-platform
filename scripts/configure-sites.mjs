#!/usr/bin/env node

/**
 * Configure all domain sites with unique content
 *
 * Each site gets:
 * - Unique brand name, description, landing word
 * - Domain-specific baseUrl
 * - Tailored hero + featured sections
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const sites = {
  'ageofabundance-shop': {
    name: 'Age of Abundance — Shop',
    domain: 'ageofabundance.shop',
    word: 'Abundance',
    subtitle: 'Curated goods for the abundant life',
    hero: 'We believe in a future where technology, creativity, and human potential converge to create unprecedented prosperity for all.',
    featured: 'Explore our carefully selected collection of products that embody the spirit of abundance.',
    type: 'E-Commerce',
  },
  'ageofabundance-art': {
    name: 'Age of Abundance — Art',
    domain: 'ageofabundance.art',
    word: 'Creation',
    subtitle: 'Where art meets infinite possibility',
    hero: 'Art is the language of abundance. Every creation expands the boundaries of what we thought possible.',
    featured: 'Discover works that capture the essence of a world without limits.',
    type: 'Gallery',
  },
  'ageofabundance-asia': {
    name: 'Age of Abundance — Asia',
    domain: 'ageofabundance.asia',
    word: 'Convergence',
    subtitle: 'Eastern wisdom meets Western innovation',
    hero: 'The convergence of ancient wisdom and modern technology is reshaping Asia into the epicenter of global abundance.',
    featured: 'Insights from the fastest-growing region on earth.',
    type: 'Regional Hub',
  },
  'ageofabundance-wiki': {
    name: 'Age of Abundance — Wiki',
    domain: 'ageofabundance.wiki',
    word: 'Knowledge',
    subtitle: 'The open encyclopedia of abundance',
    hero: 'Knowledge is the foundation of abundance. When information flows freely, innovation accelerates exponentially.',
    featured: 'Contribute to the collective understanding of our abundant future.',
    type: 'Knowledge Base',
  },
  'ageofabundance-dev': {
    name: 'Age of Abundance — Dev',
    domain: 'ageofabundance.dev',
    word: 'Build',
    subtitle: 'Developer tools for the abundant future',
    hero: 'The builders of abundance need the best tools. Open source, AI-native, and designed for the scale of tomorrow.',
    featured: 'APIs, SDKs, and frameworks that power the age of abundance.',
    type: 'Developer Portal',
  },
  'ageofabundance-app': {
    name: 'Age of Abundance — App',
    domain: 'ageofabundance.app',
    word: 'Launch',
    subtitle: 'Your dashboard for abundant living',
    hero: 'Track, measure, and amplify the abundance in your life. One dashboard to align your actions with your aspirations.',
    featured: 'Tools that transform intention into impact.',
    type: 'SaaS Dashboard',
  },
  'ageofabundance-space': {
    name: 'Age of Abundance — Space',
    domain: 'ageofabundance.space',
    word: 'Explore',
    subtitle: 'A community for abundance thinkers',
    hero: 'The future belongs to those who believe in the beauty of their ideas. Join a community dedicated to expanding what is possible.',
    featured: 'Conversations, collaborations, and connections that shape tomorrow.',
    type: 'Community',
  },
  'ageofabundance-online': {
    name: 'Age of Abundance — Online',
    domain: 'ageofabundance.online',
    word: 'Transform',
    subtitle: 'Digital experiences for the new era',
    hero: 'The digital world is the first domain where abundance became real. Infinite copies, zero marginal cost, boundless reach.',
    featured: 'Experiences designed for a world of infinite possibility.',
    type: 'Landing Pages',
  },
  'ageofabundance-site': {
    name: 'Age of Abundance — Site',
    domain: 'ageofabundance.site',
    word: 'Foundation',
    subtitle: 'The corporate home of Age of Abundance',
    hero: 'We are building the infrastructure for a world where scarcity is a choice, not a constraint.',
    featured: 'Our mission, our team, and our vision for the future.',
    type: 'Corporate',
  },
  'ageofabundance-tech': {
    name: 'Age of Abundance — Tech',
    domain: 'ageofabundance.tech',
    word: 'Innovate',
    subtitle: 'Technology demos and showcases',
    hero: 'Technology is the engine of abundance. Every breakthrough reduces the cost of the previously impossible.',
    featured: 'Interactive demos of the technologies shaping our abundant future.',
    type: 'Tech Showcase',
  },
  'ageofabundance-net': {
    name: 'Age of Abundance — Network',
    domain: 'ageofabundance.net',
    word: 'Connect',
    subtitle: 'APIs and integrations for abundance',
    hero: 'Networks multiply value. Every new connection creates possibilities that did not exist before.',
    featured: 'API documentation, integration guides, and developer resources.',
    type: 'API Hub',
  },
  'blackdot-dev': {
    name: 'Blackdot',
    domain: 'blackdot.dev',
    word: 'Precision',
    subtitle: 'Engineering at the edge of possibility',
    hero: 'Every complex system begins with a single point of clarity. Blackdot is where precision meets ambition.',
    featured: 'Developer tools and technical resources built for the discerning engineer.',
    type: 'Developer Portal',
  },
  'blackdot-space': {
    name: 'Blackdot Space',
    domain: 'blackdot.space',
    word: 'Singularity',
    subtitle: 'Where ideas collapse into reality',
    hero: 'A space for the convergence of thought, design, and execution. Where the infinite becomes the tangible.',
    featured: 'Projects, experiments, and explorations from the Blackdot collective.',
    type: 'Creative Space',
  },
};

let updated = 0;

for (const [siteName, config] of Object.entries(sites)) {
  const configPath = resolve(root, 'apps', siteName, 'data/site.config.json');

  const siteConfig = {
    app: {
      name: config.name,
      description: config.subtitle,
      baseUrl: `https://${config.domain}`,
      defaultTheme: 'dark',
    },
    navigation: {
      items: [
        { label: 'Home', path: '/' },
        { label: 'About', path: '/about' },
      ],
      sticky: true,
    },
    pages: [
      {
        id: 'home',
        path: '/',
        meta: {
          title: `${config.name} — ${config.word}`,
          description: config.subtitle,
        },
        sections: [
          {
            id: 'hero',
            type: 'hero',
            name: 'hero',
            subject: {
              title: config.word,
              subtitle: config.subtitle,
            },
            content: {
              body: config.hero,
            },
            display: {
              layout: 'header',
            },
          },
          {
            id: 'featured',
            type: 'section',
            name: 'featured',
            subject: {
              title: config.type,
              subtitle: config.featured,
            },
            content: {
              body: config.featured,
            },
            display: {
              layout: 'centered-text',
            },
          },
        ],
      },
    ],
  };

  writeFileSync(configPath, JSON.stringify(siteConfig, null, 2) + '\n');
  updated++;
  console.log(`✓ ${siteName} → "${config.word}" (${config.domain})`);
}

console.log(`\nConfigured ${updated} sites with unique content.`);
