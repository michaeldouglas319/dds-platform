// Mock seed without external imports
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const mockEntries = [
  {
    id: 'who-mpox-outbreak-detected',
    type: 'entry',
    slug: 'mpox-outbreak-detected-in-central-africa',
    tag: 'disease',
    subject: {
      title: 'Mpox Outbreak Detected in Central Africa',
      subtitle: 'WHO confirms new cases of mpox in the region',
    },
    content: 'Health authorities report 45 confirmed cases of mpox in the region. The WHO has issued guidelines for containment and treatment.',
    status: 'active',
    featured: true,
    featured_rank: 1,
    meta: {
      source: 'who',
      url: 'https://who.int/news/mpox-outbreak',
      published_at: new Date().toISOString(),
    },
  },
  {
    id: 'who-covid-update',
    type: 'entry',
    slug: 'covid-19-update-new-variants',
    tag: 'disease',
    subject: {
      title: 'COVID-19 Update: New Variants',
      subtitle: 'WHO tracks emerging variants globally',
    },
    content: 'The World Health Organization continues to monitor emerging COVID-19 variants. Vaccination remains the most effective prevention strategy.',
    status: 'active',
    featured: false,
    featured_rank: null,
    meta: {
      source: 'who',
      url: 'https://who.int/news/covid-variants',
      published_at: new Date(Date.now() - 86400000).toISOString(),
    },
  },
  {
    id: 'un-earthquake-relief',
    type: 'entry',
    slug: 'earthquake-relief-coordination-in-turkey',
    tag: 'disaster',
    subject: {
      title: 'Earthquake Relief Coordination in Turkey',
      subtitle: 'UN launches emergency response',
    },
    content: 'The United Nations Office for the Coordination of Humanitarian Affairs (OCHA) has coordinated international aid efforts following the recent earthquake.',
    status: 'active',
    featured: false,
    featured_rank: null,
    meta: {
      source: 'un',
      url: 'https://un.org/humanitarian/earthquake-relief',
      published_at: new Date(Date.now() - 172800000).toISOString(),
    },
  },
  {
    id: 'interpol-notice-001',
    type: 'entry',
    slug: 'international-wanted-person-alert',
    tag: 'lethal',
    subject: {
      title: 'International Wanted Person Alert',
      subtitle: 'INTERPOL seeks information on suspects',
    },
    content: 'INTERPOL has issued a notice for a suspect wanted in connection with international crime. Authorities request public assistance.',
    status: 'active',
    featured: false,
    featured_rank: null,
    meta: {
      source: 'interpol',
      url: 'https://interpol.int/notices/001',
      published_at: new Date(Date.now() - 259200000).toISOString(),
    },
  },
];

console.log('Mock entries generated:');
console.log(JSON.stringify(mockEntries, null, 2));
console.log('\nTo seed these to Supabase, use the npm run seed command with proper env setup');
