#!/usr/bin/env node

/**
 * Configure all domain sites with rich DDS renderer landings
 *
 * Each site gets a full landing page using multiple renderer types:
 * - intro (animated hero with rotating highlights)
 * - stats-grid (key metrics)
 * - text-only (mission statement)
 * - feature-matrix (capabilities comparison)
 * - timeline with standard-cards (roadmap/milestones)
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const sites = {
  'ageofabundance-shop': {
    name: 'Age of Abundance — Shop',
    label: 'Shop',
    domain: 'ageofabundance.shop',
    word: 'Abundance',
    subtitle: 'Curated goods for the abundant life',
    highlights: ['Commerce', 'Curation', 'Craft', 'Culture', 'Community', 'Creation'],
    hero: 'We believe in a future where technology, creativity, and human potential converge to create unprecedented prosperity for all.',
    mission: 'Every product we curate represents a step toward a world where quality, sustainability, and accessibility coexist. We are not just a shop — we are a movement.',
    stats: [
      { label: 'Curated Products', value: '500+' },
      { label: 'Artisan Partners', value: '120' },
      { label: 'Countries Shipped', value: '40+' },
      { label: 'Customer Satisfaction', value: '98%' },
    ],
    features: {
      columns: [
        { name: 'browse', label: 'Browse' },
        { name: 'membership', label: 'Membership', highlight: true },
        { name: 'wholesale', label: 'Wholesale' },
      ],
      rows: [
        { feature: 'Full Catalog Access', values: { browse: true, membership: true, wholesale: true } },
        { feature: 'Member Pricing', values: { browse: false, membership: true, wholesale: true } },
        { feature: 'Early Access Drops', values: { browse: false, membership: true, wholesale: false } },
        { feature: 'Bulk Orders', values: { browse: false, membership: false, wholesale: true } },
        { feature: 'Personal Curation', values: { browse: false, membership: true, wholesale: false } },
      ],
    },
    milestones: [
      { title: 'Launch', body: 'Curated marketplace goes live with 100 founding artisan partners', color: '#6366f1' },
      { title: 'Expand', body: 'International shipping, membership tiers, and personalized recommendations', color: '#06b6d4' },
      { title: 'Scale', body: 'AI-powered curation engine and wholesale platform for B2B abundance', color: '#10b981' },
    ],
  },
  'ageofabundance-art': {
    name: 'Age of Abundance — Art',
    label: 'Art',
    domain: 'ageofabundance.art',
    word: 'Creation',
    subtitle: 'Where art meets infinite possibility',
    highlights: ['Visual', 'Generative', 'Interactive', 'Immersive', 'Collaborative', 'Timeless'],
    hero: 'Art is the language of abundance. Every creation expands the boundaries of what we thought possible.',
    mission: 'We are building the definitive platform for art in the age of AI — where human creativity and machine capability merge to produce work that neither could alone.',
    stats: [
      { label: 'Artists Featured', value: '300+' },
      { label: 'Works Exhibited', value: '2,000+' },
      { label: 'Generative Collections', value: '45' },
      { label: 'Gallery Views', value: '1M+' },
    ],
    features: {
      columns: [
        { name: 'viewer', label: 'Viewer' },
        { name: 'collector', label: 'Collector', highlight: true },
        { name: 'artist', label: 'Artist' },
      ],
      rows: [
        { feature: 'Browse Gallery', values: { viewer: true, collector: true, artist: true } },
        { feature: 'Acquire Works', values: { viewer: false, collector: true, artist: false } },
        { feature: 'Submit Work', values: { viewer: false, collector: false, artist: true } },
        { feature: 'Provenance Tracking', values: { viewer: false, collector: true, artist: true } },
        { feature: 'Commission Access', values: { viewer: false, collector: true, artist: true } },
      ],
    },
    milestones: [
      { title: 'Gallery', body: 'Launch curated digital gallery with human + AI collaborative works', color: '#ec4899' },
      { title: 'Marketplace', body: 'Enable direct artist-to-collector transactions with provenance', color: '#f59e0b' },
      { title: 'Studio', body: 'Generative art tools for artists to collaborate with AI in real-time', color: '#8b5cf6' },
    ],
  },
  'ageofabundance-asia': {
    name: 'Age of Abundance — Asia',
    label: 'Asia',
    domain: 'ageofabundance.asia',
    word: 'Convergence',
    subtitle: 'Eastern wisdom meets Western innovation',
    highlights: ['Tokyo', 'Shanghai', 'Singapore', 'Seoul', 'Mumbai', 'Jakarta'],
    hero: 'The convergence of ancient wisdom and modern technology is reshaping Asia into the epicenter of global abundance.',
    mission: 'Asia is not just participating in the age of abundance — it is leading it. We chronicle the technologies, cultures, and ideas driving this transformation.',
    stats: [
      { label: 'Markets Covered', value: '15' },
      { label: 'Contributors', value: '200+' },
      { label: 'Languages', value: '8' },
      { label: 'Monthly Readers', value: '500K' },
    ],
    features: {
      columns: [
        { name: 'free', label: 'Free' },
        { name: 'premium', label: 'Premium', highlight: true },
        { name: 'enterprise', label: 'Enterprise' },
      ],
      rows: [
        { feature: 'Weekly Digest', values: { free: true, premium: true, enterprise: true } },
        { feature: 'Deep Analysis', values: { free: false, premium: true, enterprise: true } },
        { feature: 'Market Data', values: { free: false, premium: true, enterprise: true } },
        { feature: 'Custom Reports', values: { free: false, premium: false, enterprise: true } },
        { feature: 'API Access', values: { free: false, premium: false, enterprise: true } },
      ],
    },
    milestones: [
      { title: 'Chronicle', body: 'Launch editorial platform covering abundance across 15 Asian markets', color: '#ef4444' },
      { title: 'Translate', body: 'Multi-language support with AI translation for 8 languages', color: '#f97316' },
      { title: 'Bridge', body: 'Cross-border collaboration tools connecting East and West', color: '#14b8a6' },
    ],
  },
  'ageofabundance-wiki': {
    name: 'Age of Abundance — Wiki',
    label: 'Wiki',
    domain: 'ageofabundance.wiki',
    word: 'Knowledge',
    subtitle: 'The open encyclopedia of abundance',
    highlights: ['Economics', 'Technology', 'Philosophy', 'Science', 'Design', 'Systems'],
    hero: 'Knowledge is the foundation of abundance. When information flows freely, innovation accelerates exponentially.',
    mission: 'An open, collaborative knowledge base documenting every dimension of the transition from scarcity to abundance — from economic theory to practical implementation.',
    stats: [
      { label: 'Articles', value: '5,000+' },
      { label: 'Contributors', value: '800+' },
      { label: 'Topics', value: '120' },
      { label: 'Citations', value: '25K+' },
    ],
    features: {
      columns: [
        { name: 'reader', label: 'Reader' },
        { name: 'contributor', label: 'Contributor', highlight: true },
        { name: 'editor', label: 'Editor' },
      ],
      rows: [
        { feature: 'Read All Articles', values: { reader: true, contributor: true, editor: true } },
        { feature: 'Submit Drafts', values: { reader: false, contributor: true, editor: true } },
        { feature: 'Peer Review', values: { reader: false, contributor: false, editor: true } },
        { feature: 'Topic Curation', values: { reader: false, contributor: false, editor: true } },
        { feature: 'AI Research Assistant', values: { reader: false, contributor: true, editor: true } },
      ],
    },
    milestones: [
      { title: 'Seed', body: 'Launch with 1,000 foundational articles across 50 core topics', color: '#22c55e' },
      { title: 'Grow', body: 'Community contributions, AI-assisted research, and peer review', color: '#3b82f6' },
      { title: 'Flourish', body: 'Become the definitive reference for abundance economics and technology', color: '#a855f7' },
    ],
  },
  'ageofabundance-dev': {
    name: 'Age of Abundance — Dev',
    label: 'Dev',
    domain: 'ageofabundance.dev',
    word: 'Build',
    subtitle: 'Developer tools for the abundant future',
    highlights: ['APIs', 'SDKs', 'Open Source', 'AI-Native', 'Real-Time', 'Scalable'],
    hero: 'The builders of abundance need the best tools. Open source, AI-native, and designed for the scale of tomorrow.',
    mission: 'We provide the infrastructure layer for abundance — APIs, SDKs, and frameworks that make it trivially easy to build products that serve billions.',
    stats: [
      { label: 'API Endpoints', value: '200+' },
      { label: 'SDKs', value: '12' },
      { label: 'Open Source Repos', value: '30+' },
      { label: 'Developers', value: '10K+' },
    ],
    features: {
      columns: [
        { name: 'free', label: 'Free Tier' },
        { name: 'pro', label: 'Pro', highlight: true },
        { name: 'enterprise', label: 'Enterprise' },
      ],
      rows: [
        { feature: 'API Access', values: { free: '1K/day', pro: '100K/day', enterprise: 'Unlimited' } },
        { feature: 'SDKs', values: { free: true, pro: true, enterprise: true } },
        { feature: 'Webhooks', values: { free: false, pro: true, enterprise: true } },
        { feature: 'SLA', values: { free: 'Best Effort', pro: '99.9%', enterprise: '99.99%' } },
        { feature: 'Dedicated Support', values: { free: false, pro: false, enterprise: true } },
      ],
    },
    milestones: [
      { title: 'Ship', body: 'Launch core APIs with SDKs for JavaScript, Python, Go, and Rust', color: '#06b6d4' },
      { title: 'Open', body: 'Open-source the rendering engine, data layer, and orchestration tools', color: '#8b5cf6' },
      { title: 'Scale', body: 'Edge deployment, real-time sync, and AI-assisted development', color: '#f59e0b' },
    ],
  },
  'ageofabundance-app': {
    name: 'Age of Abundance — App',
    label: 'App',
    domain: 'ageofabundance.app',
    word: 'Launch',
    subtitle: 'Your dashboard for abundant living',
    highlights: ['Track', 'Measure', 'Optimize', 'Automate', 'Reflect', 'Grow'],
    hero: 'Track, measure, and amplify the abundance in your life. One dashboard to align your actions with your aspirations.',
    mission: 'A personal operating system for the age of abundance — combining goal tracking, financial wellness, creative output, and well-being into a single, beautiful interface.',
    stats: [
      { label: 'Active Users', value: '50K+' },
      { label: 'Goals Tracked', value: '1M+' },
      { label: 'Integrations', value: '40+' },
      { label: 'Uptime', value: '99.9%' },
    ],
    features: {
      columns: [
        { name: 'free', label: 'Free' },
        { name: 'plus', label: 'Plus', highlight: true },
        { name: 'team', label: 'Team' },
      ],
      rows: [
        { feature: 'Goal Dashboard', values: { free: true, plus: true, team: true } },
        { feature: 'AI Insights', values: { free: false, plus: true, team: true } },
        { feature: 'Integrations', values: { free: '5', plus: '40+', team: 'Unlimited' } },
        { feature: 'Team Sharing', values: { free: false, plus: false, team: true } },
        { feature: 'Custom Reports', values: { free: false, plus: true, team: true } },
      ],
    },
    milestones: [
      { title: 'Alpha', body: 'Personal dashboard with goal tracking, habits, and financial overview', color: '#6366f1' },
      { title: 'Beta', body: 'AI insights, 40+ integrations, and collaborative goal-setting', color: '#10b981' },
      { title: 'Launch', body: 'Public release with team plans, API, and mobile companion', color: '#ec4899' },
    ],
  },
  'ageofabundance-space': {
    name: 'Age of Abundance — Space',
    label: 'Space',
    domain: 'ageofabundance.space',
    word: 'Explore',
    subtitle: 'A community for abundance thinkers',
    highlights: ['Discuss', 'Collaborate', 'Learn', 'Share', 'Mentor', 'Create'],
    hero: 'The future belongs to those who believe in the beauty of their ideas. Join a community dedicated to expanding what is possible.',
    mission: 'A space for thinkers, builders, and dreamers to connect around the shared belief that abundance is not just possible — it is inevitable.',
    stats: [
      { label: 'Members', value: '25K+' },
      { label: 'Discussions', value: '100K+' },
      { label: 'Events Hosted', value: '500+' },
      { label: 'Mentorships', value: '2,000+' },
    ],
    features: {
      columns: [
        { name: 'member', label: 'Member' },
        { name: 'creator', label: 'Creator', highlight: true },
        { name: 'patron', label: 'Patron' },
      ],
      rows: [
        { feature: 'Community Access', values: { member: true, creator: true, patron: true } },
        { feature: 'Create Spaces', values: { member: false, creator: true, patron: true } },
        { feature: 'Host Events', values: { member: false, creator: true, patron: true } },
        { feature: 'Fund Projects', values: { member: false, creator: false, patron: true } },
        { feature: 'Mentorship Program', values: { member: false, creator: true, patron: true } },
      ],
    },
    milestones: [
      { title: 'Gather', body: 'Launch community platform with forums, events, and member profiles', color: '#f97316' },
      { title: 'Connect', body: 'Mentorship matching, project collaborations, and local meetups', color: '#06b6d4' },
      { title: 'Thrive', body: 'Self-sustaining ecosystem with patron funding and creator economy', color: '#22c55e' },
    ],
  },
  'ageofabundance-online': {
    name: 'Age of Abundance — Online',
    label: 'Online',
    domain: 'ageofabundance.online',
    word: 'Transform',
    subtitle: 'Digital experiences for the new era',
    highlights: ['Websites', 'Apps', 'Campaigns', 'Experiences', 'Stories', 'Brands'],
    hero: 'The digital world is the first domain where abundance became real. Infinite copies, zero marginal cost, boundless reach.',
    mission: 'We craft digital experiences that embody the principles of abundance — generous, beautiful, accessible, and built to scale without limits.',
    stats: [
      { label: 'Sites Launched', value: '200+' },
      { label: 'Page Views', value: '50M+' },
      { label: 'Templates', value: '75+' },
      { label: 'Load Time', value: '<1s' },
    ],
    features: {
      columns: [
        { name: 'starter', label: 'Starter' },
        { name: 'business', label: 'Business', highlight: true },
        { name: 'agency', label: 'Agency' },
      ],
      rows: [
        { feature: 'Templates', values: { starter: '10', business: '75+', agency: 'Unlimited' } },
        { feature: 'Custom Domain', values: { starter: true, business: true, agency: true } },
        { feature: 'AI Content', values: { starter: false, business: true, agency: true } },
        { feature: 'Analytics', values: { starter: 'Basic', business: 'Advanced', agency: 'Enterprise' } },
        { feature: 'White Label', values: { starter: false, business: false, agency: true } },
      ],
    },
    milestones: [
      { title: 'Template', body: 'Launch 75+ production-ready templates powered by DDS renderer', color: '#8b5cf6' },
      { title: 'Generate', body: 'AI-powered content generation and page building from prompts', color: '#ec4899' },
      { title: 'Platform', body: 'Full no-code platform with visual editor and deployment pipeline', color: '#06b6d4' },
    ],
  },
  'ageofabundance-site': {
    name: 'Age of Abundance',
    label: 'Site',
    domain: 'ageofabundance.site',
    word: 'Foundation',
    subtitle: 'The corporate home of Age of Abundance',
    highlights: ['Mission', 'Vision', 'Team', 'Values', 'Impact', 'Future'],
    hero: 'We are building the infrastructure for a world where scarcity is a choice, not a constraint.',
    mission: 'Age of Abundance is a holding company and innovation lab dedicated to proving that abundance-oriented businesses outperform scarcity-driven ones.',
    stats: [
      { label: 'Ventures', value: '14' },
      { label: 'Domains', value: '14' },
      { label: 'Team Size', value: '50+' },
      { label: 'Founded', value: '2025' },
    ],
    features: {
      columns: [
        { name: 'partner', label: 'Partner' },
        { name: 'investor', label: 'Investor', highlight: true },
        { name: 'acquirer', label: 'Acquirer' },
      ],
      rows: [
        { feature: 'Portfolio Access', values: { partner: true, investor: true, acquirer: true } },
        { feature: 'Revenue Data', values: { partner: false, investor: true, acquirer: true } },
        { feature: 'Due Diligence', values: { partner: false, investor: false, acquirer: true } },
        { feature: 'Board Seat', values: { partner: false, investor: true, acquirer: false } },
        { feature: 'Acquisition Terms', values: { partner: false, investor: false, acquirer: true } },
      ],
    },
    milestones: [
      { title: 'Establish', body: 'Launch 14 domain ventures across commerce, art, tech, and community', color: '#3b82f6' },
      { title: 'Prove', body: 'Demonstrate abundance model viability with revenue and user growth', color: '#22c55e' },
      { title: 'Expand', body: 'License the model, spin out ventures, and fund abundance startups', color: '#f59e0b' },
    ],
  },
  'ageofabundance-tech': {
    name: 'Age of Abundance — Tech',
    label: 'Tech',
    domain: 'ageofabundance.tech',
    word: 'Innovate',
    subtitle: 'Technology showcases and interactive demos',
    highlights: ['AI', 'WebGPU', 'Edge Computing', 'Spatial', 'Quantum', 'Bio'],
    hero: 'Technology is the engine of abundance. Every breakthrough reduces the cost of the previously impossible.',
    mission: 'Interactive demonstrations of the technologies that are making abundance real — from AI and edge computing to spatial interfaces and quantum algorithms.',
    stats: [
      { label: 'Live Demos', value: '30+' },
      { label: 'Technologies', value: '12' },
      { label: 'Benchmarks', value: '100+' },
      { label: 'Open Source', value: '80%' },
    ],
    features: {
      columns: [
        { name: 'explore', label: 'Explore' },
        { name: 'benchmark', label: 'Benchmark', highlight: true },
        { name: 'contribute', label: 'Contribute' },
      ],
      rows: [
        { feature: 'Interactive Demos', values: { explore: true, benchmark: true, contribute: true } },
        { feature: 'Performance Data', values: { explore: false, benchmark: true, contribute: true } },
        { feature: 'Source Code', values: { explore: false, benchmark: false, contribute: true } },
        { feature: 'Custom Benchmarks', values: { explore: false, benchmark: true, contribute: true } },
        { feature: 'Research Papers', values: { explore: false, benchmark: true, contribute: true } },
      ],
    },
    milestones: [
      { title: 'Demo', body: 'Launch 30+ interactive technology demos with live benchmarking', color: '#ef4444' },
      { title: 'Measure', body: 'Standardized abundance-tech benchmarks adopted by the community', color: '#f97316' },
      { title: 'Advance', body: 'Research lab producing papers and open-source implementations', color: '#a855f7' },
    ],
  },
  'ageofabundance-net': {
    name: 'Age of Abundance — Network',
    label: 'Network',
    domain: 'ageofabundance.net',
    word: 'Connect',
    subtitle: 'APIs and integrations for abundance',
    highlights: ['REST', 'GraphQL', 'Webhooks', 'Streaming', 'Federation', 'Mesh'],
    hero: 'Networks multiply value. Every new connection creates possibilities that did not exist before.',
    mission: 'The connective tissue of the abundance ecosystem — APIs, protocols, and integration layers that let every venture in our portfolio communicate seamlessly.',
    stats: [
      { label: 'API Endpoints', value: '500+' },
      { label: 'Integrations', value: '100+' },
      { label: 'Uptime', value: '99.99%' },
      { label: 'Requests/Day', value: '10M+' },
    ],
    features: {
      columns: [
        { name: 'free', label: 'Free' },
        { name: 'scale', label: 'Scale', highlight: true },
        { name: 'dedicated', label: 'Dedicated' },
      ],
      rows: [
        { feature: 'API Access', values: { free: '10K/day', scale: '1M/day', dedicated: 'Unlimited' } },
        { feature: 'GraphQL', values: { free: true, scale: true, dedicated: true } },
        { feature: 'Webhooks', values: { free: '5', scale: '100', dedicated: 'Unlimited' } },
        { feature: 'SLA', values: { free: '99%', scale: '99.99%', dedicated: '99.999%' } },
        { feature: 'Dedicated Infra', values: { free: false, scale: false, dedicated: true } },
      ],
    },
    milestones: [
      { title: 'Wire', body: 'Launch unified API gateway connecting all 14 abundance ventures', color: '#06b6d4' },
      { title: 'Mesh', body: 'Service mesh with automatic discovery, auth, and rate limiting', color: '#6366f1' },
      { title: 'Federate', body: 'Open federation protocol for third-party abundance services', color: '#10b981' },
    ],
  },
  'blackdot-dev': {
    name: 'Blackdot',
    label: 'Dev',
    domain: 'blackdot.dev',
    word: 'Precision',
    subtitle: 'Engineering at the edge of possibility',
    highlights: ['Systems', 'Performance', 'Security', 'Architecture', 'Craft', 'Depth'],
    hero: 'Every complex system begins with a single point of clarity. Blackdot is where precision meets ambition.',
    mission: 'We build software that does one thing exceptionally well. No bloat, no compromise, no shortcuts. Just engineering at its finest.',
    stats: [
      { label: 'Projects Shipped', value: '50+' },
      { label: 'Lines of Code', value: '2M+' },
      { label: 'P99 Latency', value: '<10ms' },
      { label: 'Zero-Day Vulns', value: '0' },
    ],
    features: {
      columns: [
        { name: 'oss', label: 'Open Source' },
        { name: 'pro', label: 'Pro License', highlight: true },
        { name: 'consulting', label: 'Consulting' },
      ],
      rows: [
        { feature: 'Source Code', values: { oss: true, pro: true, consulting: true } },
        { feature: 'Commercial Use', values: { oss: false, pro: true, consulting: true } },
        { feature: 'Priority Support', values: { oss: false, pro: true, consulting: true } },
        { feature: 'Architecture Review', values: { oss: false, pro: false, consulting: true } },
        { feature: 'Custom Development', values: { oss: false, pro: false, consulting: true } },
      ],
    },
    milestones: [
      { title: 'Focus', body: 'Launch core tools: rendering engine, data layer, and orchestration', color: '#18181b' },
      { title: 'Harden', body: 'Security audit, performance benchmarks, and enterprise readiness', color: '#3f3f46' },
      { title: 'Release', body: 'Public release with pro licensing and consulting practice', color: '#71717a' },
    ],
  },
  'blackdot-space': {
    name: 'Blackdot Space',
    label: 'Space',
    domain: 'blackdot.space',
    word: 'Singularity',
    subtitle: 'Where ideas collapse into reality',
    highlights: ['Design', 'Research', 'Prototype', 'Experiment', 'Iterate', 'Ship'],
    hero: 'A space for the convergence of thought, design, and execution. Where the infinite becomes the tangible.',
    mission: 'The experimental arm of Blackdot — a laboratory for ideas too ambitious for roadmaps and too important to ignore.',
    stats: [
      { label: 'Experiments', value: '100+' },
      { label: 'Prototypes', value: '40+' },
      { label: 'Published Papers', value: '12' },
      { label: 'Shipped to Prod', value: '60%' },
    ],
    features: {
      columns: [
        { name: 'observe', label: 'Observe' },
        { name: 'participate', label: 'Participate', highlight: true },
        { name: 'sponsor', label: 'Sponsor' },
      ],
      rows: [
        { feature: 'View Experiments', values: { observe: true, participate: true, sponsor: true } },
        { feature: 'Join Research', values: { observe: false, participate: true, sponsor: true } },
        { feature: 'Early Access', values: { observe: false, participate: true, sponsor: true } },
        { feature: 'Direct Research', values: { observe: false, participate: false, sponsor: true } },
        { feature: 'IP Licensing', values: { observe: false, participate: false, sponsor: true } },
      ],
    },
    milestones: [
      { title: 'Observe', body: 'Open the lab — publish experiments, prototypes, and findings', color: '#a855f7' },
      { title: 'Participate', body: 'Open research program with collaborative experimentation', color: '#ec4899' },
      { title: 'Converge', body: 'Ship the best experiments into Blackdot production tools', color: '#6366f1' },
    ],
  },
};

function buildSiteConfig(siteName, config) {
  return {
    app: {
      name: config.name,
      label: config.label,
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
          // 1. Animated intro hero
          {
            id: 'intro',
            type: 'intro',
            name: 'intro',
            subject: { title: config.word },
            content: {
              body: config.subtitle,
              highlights: config.highlights,
            },
            display: { layout: 'intro' },
            meta: {
              scrollTarget: '/#stats',
              textTransition: 'reveal',
              textTransitionDuration: 1200,
              textTransitionInterval: 4000,
              highlightPosition: 'bottom',
              highlightPrefix: '+',
            },
          },
          // 2. Mission statement
          {
            id: 'mission',
            type: 'section',
            name: 'mission',
            subject: { title: config.name },
            content: { body: config.hero },
            display: { layout: 'header' },
          },
          // 3. Stats grid
          {
            id: 'stats',
            type: 'section',
            name: 'stats',
            subject: {
              title: 'By the Numbers',
              subtitle: 'Key metrics',
            },
            content: {
              stats: config.stats,
            },
            display: { layout: 'stats-grid' },
            meta: { columns: 4 },
          },
          // 4. Vision text
          {
            id: 'vision',
            type: 'section',
            name: 'vision',
            subject: { title: 'Our Vision' },
            content: { body: config.mission },
            display: { layout: 'text-only' },
          },
          // 5. Feature matrix
          {
            id: 'features',
            type: 'section',
            name: 'features',
            subject: {
              title: 'What We Offer',
              subtitle: 'Choose your path',
            },
            content: {
              columns: config.features.columns,
              rows: config.features.rows,
            },
            display: { layout: 'feature-matrix' },
          },
          // 6. Roadmap timeline
          {
            id: 'roadmap',
            type: 'section',
            name: 'roadmap',
            subject: { title: 'Roadmap' },
            display: { layout: 'timeline' },
            children: config.milestones.map((m, i) => ({
              id: `milestone-${i + 1}`,
              type: 'entry',
              subject: {
                title: m.title,
                color: m.color,
              },
              content: { body: m.body },
              meta: { order: i + 1 },
            })),
          },
          // 7. Footer CTA
          {
            id: 'cta',
            type: 'section',
            name: 'cta',
            subject: { title: `Join the ${config.word}` },
            content: {
              body: `Be part of the age of abundance. ${config.domain} is just getting started.`,
            },
            display: { layout: 'centered-text' },
          },
        ],
      },
    ],
  };
}

let updated = 0;
for (const [siteName, config] of Object.entries(sites)) {
  const configPath = resolve(root, 'apps', siteName, 'data/site.config.json');
  const siteConfig = buildSiteConfig(siteName, config);
  writeFileSync(configPath, JSON.stringify(siteConfig, null, 2) + '\n');
  updated++;
  console.log(`✓ ${siteName} → "${config.word}" (7 sections, ${config.domain})`);
}

console.log(`\nConfigured ${updated} sites with rich DDS renderer landings.`);
