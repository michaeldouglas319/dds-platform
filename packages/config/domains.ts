/**
 * Shared domain registry for all BlackDot + Age of Abundance properties
 * Used across apps for navigation, listings, and partner information
 */

export interface DomainConfig {
  name: string;
  domain: string;
  url: string;
  label: string;
  brand: 'abundance' | 'blackdot';
  status: 'live' | 'coming-soon';
  category?: string;
}

export const DOMAINS: DomainConfig[] = [
  // The Age of Abundance — Flagship & Core
  {
    name: 'The Age of Abundance AI',
    domain: 'theageofabundance.ai',
    url: 'https://theageofabundance.ai',
    label: 'AI',
    brand: 'abundance',
    status: 'live',
    category: 'flagship'
  },
  {
    name: 'The Age of Abundance Organization',
    domain: 'theageofabundance.org',
    url: 'https://theageofabundance.org',
    label: 'Organization',
    brand: 'abundance',
    status: 'live',
    category: 'infrastructure'
  },
  {
    name: 'The Age of Abundance Network',
    domain: 'theageofabundance.net',
    url: 'https://theageofabundance.net',
    label: 'Network',
    brand: 'abundance',
    status: 'live',
    category: 'infrastructure'
  },

  // Age of Abundance — Commerce & Lifestyle
  {
    name: 'Age of Abundance Shop',
    domain: 'ageofabundance.shop',
    url: 'https://ageofabundance.shop',
    label: 'Shop',
    brand: 'abundance',
    status: 'live',
    category: 'commerce'
  },
  {
    name: 'Age of Abundance Store',
    domain: 'ageofabundance.store',
    url: 'https://ageofabundance.store',
    label: 'Store',
    brand: 'abundance',
    status: 'coming-soon',
    category: 'commerce'
  },
  {
    name: 'Age of Abundance App',
    domain: 'ageofabundance.app',
    url: 'https://ageofabundance.app',
    label: 'App',
    brand: 'abundance',
    status: 'live',
    category: 'saas'
  },

  // Age of Abundance — Creative & Culture
  {
    name: 'Age of Abundance Art',
    domain: 'ageofabundance.art',
    url: 'https://ageofabundance.art',
    label: 'Art',
    brand: 'abundance',
    status: 'live',
    category: 'creative'
  },
  {
    name: 'Age of Abundance Actor',
    domain: 'ageofabundance.actor',
    url: 'https://ageofabundance.actor',
    label: 'Actor',
    brand: 'abundance',
    status: 'coming-soon',
    category: 'creative'
  },

  // Age of Abundance — Knowledge & Community
  {
    name: 'Age of Abundance Wiki',
    domain: 'ageofabundance.wiki',
    url: 'https://ageofabundance.wiki',
    label: 'Wiki',
    brand: 'abundance',
    status: 'live',
    category: 'knowledge'
  },
  {
    name: 'Age of Abundance Dev',
    domain: 'ageofabundance.dev',
    url: 'https://ageofabundance.dev',
    label: 'Dev',
    brand: 'abundance',
    status: 'live',
    category: 'developer'
  },
  {
    name: 'Age of Abundance Tech',
    domain: 'ageofabundance.tech',
    url: 'https://ageofabundance.tech',
    label: 'Tech',
    brand: 'abundance',
    status: 'live',
    category: 'technology'
  },
  {
    name: 'Age of Abundance Space',
    domain: 'ageofabundance.space',
    url: 'https://ageofabundance.space',
    label: 'Space',
    brand: 'abundance',
    status: 'live',
    category: 'community'
  },

  // Age of Abundance — Regional & Specialized
  {
    name: 'Age of Abundance Asia',
    domain: 'ageofabundance.asia',
    url: 'https://ageofabundance.asia',
    label: 'Asia',
    brand: 'abundance',
    status: 'live',
    category: 'regional'
  },
  {
    name: 'Age of Abundance Agency',
    domain: 'ageofabundance.agency',
    url: 'https://ageofabundance.agency',
    label: 'Agency',
    brand: 'abundance',
    status: 'coming-soon',
    category: 'services'
  },
  {
    name: 'Age of Abundance Online',
    domain: 'ageofabundance.online',
    url: 'https://ageofabundance.online',
    label: 'Online',
    brand: 'abundance',
    status: 'live',
    category: 'digital'
  },
  {
    name: 'Age of Abundance Site',
    domain: 'ageofabundance.site',
    url: 'https://ageofabundance.site',
    label: 'Site',
    brand: 'abundance',
    status: 'live',
    category: 'corporate'
  },
  {
    name: 'Age of Abundance XYZ',
    domain: 'ageofabundance.xyz',
    url: 'https://ageofabundance.xyz',
    label: 'XYZ',
    brand: 'abundance',
    status: 'coming-soon',
    category: 'experimental'
  },

  // BlackDot — Engineering & Innovation
  {
    name: 'BlackDot Dev',
    domain: 'blackdot.dev',
    url: 'https://blackdot.dev',
    label: 'Dev',
    brand: 'blackdot',
    status: 'live',
    category: 'developer'
  },
  {
    name: 'BlackDot Space',
    domain: 'blackdot.space',
    url: 'https://blackdot.space',
    label: 'Space',
    brand: 'blackdot',
    status: 'live',
    category: 'creative'
  },
  {
    name: 'BlackDot Partners',
    domain: 'blackdot.partners',
    url: 'https://blackdot.partners',
    label: 'Partners',
    brand: 'blackdot',
    status: 'coming-soon',
    category: 'partnerships'
  },
  {
    name: 'BlackDot Capital',
    domain: 'blackdot.capital',
    url: 'https://blackdot.capital',
    label: 'Capital',
    brand: 'blackdot',
    status: 'coming-soon',
    category: 'investment'
  },

  // The Age of Abundance — Extended
  {
    name: 'The Age of Abundance Agency',
    domain: 'theageofabundance.agency',
    url: 'https://theageofabundance.agency',
    label: 'Agency',
    brand: 'abundance',
    status: 'coming-soon',
    category: 'services'
  },
  {
    name: 'The Age of Abundance Actor',
    domain: 'theageofabundance.actor',
    url: 'https://theageofabundance.actor',
    label: 'Actor',
    brand: 'abundance',
    status: 'coming-soon',
    category: 'creative'
  },
  {
    name: 'The Age of Abundance Studio',
    domain: 'theageofabundance.studio',
    url: 'https://theageofabundance.studio',
    label: 'Studio',
    brand: 'abundance',
    status: 'coming-soon',
    category: 'creative'
  }
];

export const ABUNDANCE_DOMAINS = DOMAINS.filter(d => d.brand === 'abundance');
export const BLACKDOT_DOMAINS = DOMAINS.filter(d => d.brand === 'blackdot');

export const LIVE_DOMAINS = DOMAINS.filter(d => d.status === 'live');
export const COMING_SOON_DOMAINS = DOMAINS.filter(d => d.status === 'coming-soon');

export function getDomainsByCategory(category: string): DomainConfig[] {
  return DOMAINS.filter(d => d.category === category);
}

export function getDomainByUrl(url: string): DomainConfig | undefined {
  return DOMAINS.find(d => d.url === url || d.domain === url);
}
