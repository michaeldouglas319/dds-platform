/**
 * Seed wiki article dataset.
 *
 * Every entry is a UniversalSection (from @dds/types/section) — the same
 * shape the core renderer consumes. Wiki-specific fields live under
 * `meta.wiki` so the core schema continues to parse unchanged and the data
 * remains plug-compatible with future @dds/renderer plugins.
 *
 * @typedef {Object} WikiMeta
 * @property {string} [lastUpdatedISO]
 * @property {string[]} [authors]
 * @property {number} [readingTimeMinutes]
 * @property {string[]} [tags]
 * @property {string} [summary]
 */

/**
 * @typedef {Object} WikiArticle
 * @property {string} id
 * @property {'section'} type
 * @property {string} name
 * @property {Object} subject
 * @property {Object} content
 * @property {Object} display
 * @property {{ wiki: WikiMeta }} meta
 */

/** @type {WikiArticle[]} */
export const articles = [
  {
    id: 'age-of-abundance',
    type: 'section',
    name: 'age-of-abundance',
    subject: {
      title: 'Age of Abundance',
      subtitle: 'A living encyclopedia of post-scarcity civilization.',
      category: 'Concept',
      summary:
        'The Age of Abundance describes the socio-technical transition in which essential human needs — energy, compute, housing, mobility, education, and care — fall to near-zero marginal cost and become available to every person on Earth.',
    },
    content: {
      body: 'The Age of Abundance describes the socio-technical transition in which essential human needs — energy, compute, housing, mobility, education, and care — fall to near-zero marginal cost and become available to every person on Earth. Unlike earlier post-scarcity visions rooted in pure automation, the contemporary framing treats abundance as a governance problem: the bottleneck is no longer production but [[Coordination Abundance|coordination]], legitimacy, and distribution.',
      paragraphs: [
        {
          subtitle: 'Origins of the term',
          description:
            'The phrase gained wide currency in the early 2020s alongside the convergence of large-scale machine learning, cheap photovoltaic solar, and programmable biology. Earlier antecedents include Buckminster Fuller\'s "ephemeralization," the 1960s cybernetic-socialism tradition, and late-20th-century post-scarcity economics. The modern synthesis treats these lineages as complementary rather than competing.',
        },
        {
          subtitle: 'Core pillars',
          description:
            'Commentators commonly identify four pillars: (1) [[Energy Abundance]], driven by solar, storage, and advanced geothermal; (2) [[Compute Abundance]], driven by learned models and efficient silicon; (3) [[Atoms Abundance]], driven by robotics, additive manufacturing, and synthetic biology; and (4) [[Coordination Abundance]], driven by open protocols, verifiable identity, and legitimate governance. The absence of any single pillar tends to stall the others.',
        },
        {
          subtitle: 'Critiques and open questions',
          description:
            'Skeptics note that abundance has historically failed to reach the people who need it most. Distributional questions — who owns the models, who benefits from cheap energy, who is governed by which protocols — remain the fulcrum of the debate. The wiki treats these critiques as load-bearing, not peripheral.',
        },
      ],
    },
    display: {
      layout: 'wiki-article',
      textWidth: 'm',
    },
    meta: {
      wiki: {
        lastUpdatedISO: '2026-04-11',
        authors: ['editorial'],
        readingTimeMinutes: 6,
        tags: ['concept', 'foundations', 'governance'],
        summary:
          'The socio-technical transition to near-zero-marginal-cost access to essential needs, framed as a governance problem.',
      },
    },
  },
  {
    id: 'energy-abundance',
    type: 'section',
    name: 'energy-abundance',
    subject: {
      title: 'Energy Abundance',
      subtitle: 'Why the solar-plus-storage learning curve matters more than any forecast.',
      category: 'Pillar',
    },
    content: {
      body: 'Energy abundance is the first and most load-bearing pillar of the [[Age of Abundance]]. When electricity drops below one cent per kilowatt-hour at point of use, the marginal cost of most other goods — desalinated water, compute, protein, long-distance mobility — collapses with it. The learning curves of photovoltaic solar and lithium storage are the clearest evidence that this is not a forecast but a trajectory.',
      paragraphs: [
        {
          subtitle: 'The Wright-curve argument',
          description:
            'Since 1976, the cost of a watt of photovoltaic solar has fallen roughly 20% for every doubling of cumulative installed capacity. Projecting that curve forward — not as prediction but as the null hypothesis absent shocks — yields utility-scale solar at one-tenth today\'s price within a decade. Batteries trail a similar curve. The policy question is whether we remove the non-manufacturing frictions (interconnection, permitting, grid capacity) that currently bottleneck installation.',
        },
        {
          subtitle: 'Second-order effects',
          description:
            'Cheap, clean electrons turn electricity-intensive processes that are economically marginal today into dominant ones tomorrow. Direct-air carbon capture, green hydrogen, thermal desalination, indoor vertical agriculture, and arbitrary-latitude food production all move from speculative to routine as the price of the underlying energy approaches zero. The [[Age of Abundance]] framing emphasizes these second-order effects because they are where the lived difference appears.',
        },
        {
          subtitle: 'Why this is still contested',
          description:
            'Skeptics point to siting conflicts, rare-earth supply chains, and the political economy of incumbent fossil interests. Each of these is real; none is thermodynamic. The contested question is not whether cheap clean energy is possible but who captures the rents and who bears the transition costs.',
        },
      ],
    },
    display: {
      layout: 'wiki-article',
      textWidth: 'm',
    },
    meta: {
      wiki: {
        lastUpdatedISO: '2026-04-11',
        authors: ['editorial'],
        readingTimeMinutes: 5,
        tags: ['energy', 'pillar', 'economics'],
        summary:
          'The load-bearing first pillar: photovoltaic learning curves, second-order effects, and the political economy of the transition.',
      },
    },
  },
  {
    id: 'coordination-abundance',
    type: 'section',
    name: 'coordination-abundance',
    subject: {
      title: 'Coordination Abundance',
      subtitle: 'Governance, legitimacy, and open protocols as the decisive fourth pillar.',
      category: 'Pillar',
    },
    content: {
      body: 'If [[Energy Abundance|energy]], compute, and atoms are the material pillars of abundance, coordination is the pillar that decides what we do with them. Without legitimate institutions, open protocols, and verifiable identity, cheap electrons and trained models turn into centralized rents. Coordination abundance asks whether the governance layer can scale at the same pace as the underlying capacity.',
      paragraphs: [
        {
          subtitle: 'Why coordination is the bottleneck',
          description:
            'Historically, technological capacity has outrun our ability to agree on how to use it. Nuclear power, the internet, and ML systems each demonstrate the pattern: the scientific problem is solved decades before the governance problem is. If the [[Age of Abundance]] is shipped without coordination, it arrives as unequal concentration rather than shared flourishing.',
        },
        {
          subtitle: 'Open protocols as public infrastructure',
          description:
            'Open, credibly neutral protocols — for identity, payments, attestation, and composable services — function as the public infrastructure layer of coordination abundance. They lower the cost of cooperation across trust boundaries and reduce dependency on any single provider. They are to the 2020s what standardized shipping containers were to the 1960s: a boring-sounding primitive that quietly reshapes what is possible.',
        },
        {
          subtitle: 'Legitimacy and participation',
          description:
            'Coordination abundance is not primarily a technical problem. It is a legitimacy problem: who decides, on what evidence, with what recourse. Mechanisms such as citizens\' assemblies, participatory budgeting, and verifiable public deliberation are early experiments in closing that gap. The wiki treats them as peer technologies to solar cells and transformer models, not as soft add-ons.',
        },
      ],
    },
    display: {
      layout: 'wiki-article',
      textWidth: 'm',
    },
    meta: {
      wiki: {
        lastUpdatedISO: '2026-04-11',
        authors: ['editorial'],
        readingTimeMinutes: 5,
        tags: ['governance', 'pillar', 'protocols'],
        summary:
          'The decisive fourth pillar: legitimate institutions, open protocols, and why coordination is the true bottleneck.',
      },
    },
  },
];

/** Look up an article by its id (slug). */
export function findArticleBySlug(slug) {
  return articles.find((article) => article.id === slug);
}

/** List every article slug — used for static generation. */
export function listArticleSlugs() {
  return articles.map((article) => article.id);
}

/** List articles flagged for the homepage. */
export function listFeaturedArticles() {
  return articles;
}

/**
 * Return articles sorted by `meta.wiki.lastUpdatedISO` descending (newest
 * first). Articles without a date sort to the end.
 *
 * @param {import('../content/wiki-meta.js').deriveWikiMeta} deriveWikiMeta
 * @returns {{ article: WikiArticle, meta: ReturnType<typeof import('../content/wiki-meta.js').deriveWikiMeta> }[]}
 */
export function listArticlesSortedByDate(deriveWikiMeta) {
  return articles
    .map((article) => ({ article, meta: deriveWikiMeta(article) }))
    .sort((a, b) => {
      const da = a.meta.lastUpdatedISO ?? '';
      const db = b.meta.lastUpdatedISO ?? '';
      return db.localeCompare(da);
    });
}

/**
 * Collect every unique, normalized tag across all articles.
 * Returns sorted alphabetically for a stable UI order.
 *
 * @param {import('../content/wiki-meta.js').deriveWikiMeta} deriveWikiMeta
 * @returns {string[]}
 */
export function listAllTags(deriveWikiMeta) {
  const tagSet = new Set();
  for (const article of articles) {
    const meta = deriveWikiMeta(article);
    for (const tag of meta.tags) {
      tagSet.add(tag);
    }
  }
  return [...tagSet].sort();
}
