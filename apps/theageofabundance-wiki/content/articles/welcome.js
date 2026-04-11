/**
 * The wiki's first article. Stored as a `UniversalSection` so every future
 * piece of content is just another data file that plugs into the same
 * ArticleRenderer plugin — no schema changes, no per-page component work.
 *
 * @type {import('@dds/types').UniversalSection}
 */
export const welcome = {
  id: 'welcome',
  type: 'section',
  name: 'Welcome',
  page: 'welcome',
  display: { layout: 'article' },
  subject: {
    title: 'Welcome to the wiki',
    category: 'Guide',
    summary:
      'A living reference for the ideas, maps, and practices of the age of abundance — written to be read, not just searched.',
    tags: {
      kind: 'meta',
      audience: 'newcomers',
      status: 'living document',
    },
  },
  content: {
    paragraphs: [
      {
        subtitle: 'What this is',
        description:
          'This wiki collects the vocabulary of a more generous future. It is long-form, hand-edited, and deliberately slow. Every entry is a small invitation to look again at something you thought you already understood — the commons, abundance, infrastructure, attention, time.',
      },
      {
        subtitle: 'How to read it',
        description:
          'Start anywhere. Follow the links. The wiki is meant to be wandered, not consumed. Each article stands alone, but most of them are doors: look for the "see also" section at the end, or the citations inside any paragraph, and follow them as far as your curiosity takes you.',
        citations: [
          {
            text: 'Vannevar Bush — As We May Think (1945)',
            url: 'https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/',
          },
        ],
      },
      {
        subtitle: 'How it is built',
        description:
          'Every page — this one included — is a UniversalSection: a plain data record that describes its subject, content, media, and layout. A single plugin turns that record into the page you are reading. The same schema drives the home page, the category index, the sidebar, and the infobox. Add a new content type once; every consumer picks it up automatically.',
      },
      {
        subtitle: 'Accessibility is the editorial style',
        description:
          'The reading column is capped at 68 characters so sentences breathe. Colors are tested for AAA contrast in both light and dark mode. Every interactive control has a visible focus ring, a 44-pixel tap target, and a name that a screen reader can speak. Animation is opt-in and disabled for readers who prefer reduced motion. If a line here is hard to read, it is a bug.',
      },
      {
        subtitle: 'What is next',
        description:
          'The backlog — backlinks, full-text search, revisions, an infobox primitive, a category index — lives in TODO.md at the root of the repo. If you found this page, you already know how to read it. Pull requests welcome.',
      },
    ],
  },
  links: {
    primary: { text: 'Back to the wiki home', href: '/' },
  },
  meta: {
    author: 'The Editors',
    lastUpdated: '2026-04-11',
    readingTime: '3 min read',
  },
};
