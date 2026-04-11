/**
 * Seed wiki articles for ageofabundance.wiki
 *
 * Each article is a parametric record whose `subject` and `content` fields
 * mirror the shape of a `UniversalSection` from `@dds/types/section`. This
 * keeps wiki content compatible with the universal renderer pipeline without
 * forking or mutating the core schema — we could later project each article
 * into a UniversalSection[] (hero + body + infobox) and feed it through
 * `SectionBatchRenderer` as a plugin-driven page.
 *
 * Body paragraphs may contain wiki-links in the `[[Slug]]` or
 * `[[Slug|Display text]]` form. These are resolved at render time by
 * `lib/wiki.js#parseWikiLinks` and surfaced with an explicit broken-link
 * visual state so editors can find dead references.
 *
 * @typedef {Object} WikiArticleSubject
 * @property {string}   title
 * @property {string}  [subtitle]
 * @property {string}   summary
 * @property {string}   category
 * @property {string[]} [tags]
 * @property {string}   updated  ISO-8601 date, used for `<time datetime="…">`
 *
 * @typedef {Object} WikiArticleParagraph
 * @property {string} [subtitle]
 * @property {string}  description
 *
 * @typedef {Object} WikiArticleContent
 * @property {WikiArticleParagraph[]} paragraphs
 *
 * @typedef {Object} WikiArticle
 * @property {string}             id       Stable identifier.
 * @property {string}             slug     URL slug — must be unique.
 * @property {'article'}          type     Discriminator; sibling to UniversalSection types.
 * @property {WikiArticleSubject} subject
 * @property {WikiArticleContent} content
 */

/** @type {WikiArticle[]} */
export const articles = [
  {
    id: 'article-age-of-abundance',
    slug: 'age-of-abundance',
    type: 'article',
    subject: {
      title: 'The Age of Abundance',
      subtitle: 'A working definition',
      summary:
        'A civilizational frame in which the marginal cost of energy, compute, and coordination trends toward zero, inverting the assumptions of scarcity economics.',
      category: 'Concepts',
      tags: ['overview', 'economics', 'definition'],
      updated: '2026-04-11',
    },
    content: {
      paragraphs: [
        {
          description:
            'The Age of Abundance is the working name for a civilizational transition in which the marginal cost of energy, compute, and coordination trends toward zero. The transition is not a single event — it is an overlapping family of S-curves that together invert the assumptions baked into scarcity-era institutions.',
        },
        {
          subtitle: 'Three compounding curves',
          description:
            'The frame pivots on three compounding curves: [[Energy Abundance|cheap clean energy]], [[Compute Abundance|near-free compute]] and [[Coordination Abundance|machine-mediated coordination]]. Each curve on its own is disruptive; together they reshape what is economically possible at the margin. For the economic intuition see the [[Scarcity Inversion]] article.',
        },
        {
          subtitle: 'Why the name matters',
          description:
            'The phrase "age of abundance" is deliberately aspirational and contested. It is a [[Memetic Anchor]] rather than a forecast — a shared vocabulary that lets designers, policymakers and engineers reason about post-scarcity trade-offs without collapsing into either techno-utopianism or collapse narratives. This wiki treats it as a hypothesis under active revision.',
        },
        {
          subtitle: 'Related primitives',
          description:
            'See also: [[Distributed Design Systems]], [[Universal Section Schema]], and the forthcoming entry on [[Nowhere Article]] which does not yet exist and should render as a broken link.',
        },
      ],
    },
  },
  {
    id: 'article-energy-abundance',
    slug: 'energy-abundance',
    type: 'article',
    subject: {
      title: 'Energy Abundance',
      subtitle: 'The first compounding curve',
      summary:
        'The LCOE of utility-scale solar + storage has fallen ~90% in fifteen years, bending the supply curve of electricity toward the cost of capital.',
      category: 'Curves',
      tags: ['energy', 'economics', 'curve'],
      updated: '2026-04-09',
    },
    content: {
      paragraphs: [
        {
          description:
            'Energy abundance is the first of the three compounding curves that define [[Age of Abundance|the Age of Abundance]]. It refers to the sustained, exponential decline in the levelized cost of generating a kilowatt-hour of usable electricity, primarily driven by photovoltaics, storage, and grid-scale interconnects.',
        },
        {
          subtitle: 'What the curve measures',
          description:
            'The curve is most legible in the LCOE of utility-scale solar plus four-hour battery storage. It is not a theoretical limit — it is a learning curve reflecting cumulative manufacturing volume. Every doubling of installed capacity has produced roughly a 20% drop in unit cost, and there is no sign of the curve flattening at the scale relevant to this decade.',
        },
        {
          subtitle: 'Why it matters for coordination',
          description:
            'Cheap energy only becomes abundance when it is paired with elastic demand. That elasticity comes from the other two curves: [[Compute Abundance]] absorbs intermittent power into AI workloads, and [[Coordination Abundance]] lets grids, factories and transport dispatch themselves on price signals rather than schedules.',
        },
      ],
    },
  },
  {
    id: 'article-compute-abundance',
    slug: 'compute-abundance',
    type: 'article',
    subject: {
      title: 'Compute Abundance',
      subtitle: 'The second compounding curve',
      summary:
        'General-purpose intelligence, retrieved and generated on demand, is becoming a metered utility like water or electricity.',
      category: 'Curves',
      tags: ['compute', 'ai', 'curve'],
      updated: '2026-04-07',
    },
    content: {
      paragraphs: [
        {
          description:
            'Compute abundance is the second compounding curve. Where [[Energy Abundance]] pushes the cost of electrons toward zero, compute abundance pushes the cost of *useful thought* — tokens, inferences, embeddings — toward a rounding error on a monthly utility bill.',
        },
        {
          subtitle: 'From scarce experts to metered intelligence',
          description:
            'Before 2023 expert judgment was a scarce, synchronous, human-gated resource. After the diffusion of capable frontier models, it is increasingly a metered utility: pay per million tokens, call it in a loop, compose it with other utilities. This does not make human judgment obsolete; it makes the opportunity cost of not asking a question approximately zero.',
        },
        {
          subtitle: 'Connection to coordination',
          description:
            'The full value of cheap cognition only lands when it can be wired into decisions at machine speed. That handoff is [[Coordination Abundance]] — the third curve.',
        },
      ],
    },
  },
  {
    id: 'article-coordination-abundance',
    slug: 'coordination-abundance',
    type: 'article',
    subject: {
      title: 'Coordination Abundance',
      subtitle: 'The third compounding curve',
      summary:
        'Machine-mediated contracts, routing, and dispatch collapse the transaction costs that historically bounded the size of firms and markets.',
      category: 'Curves',
      tags: ['coordination', 'economics', 'curve'],
      updated: '2026-04-05',
    },
    content: {
      paragraphs: [
        {
          description:
            'Coordination abundance is the third curve. It is the one that does the most to translate cheap energy and cheap compute into economic surplus, because historically the binding constraint on the size of a market or a firm has been the cost of coordinating the participants, not the cost of the inputs.',
        },
        {
          subtitle: 'The Coasean inversion',
          description:
            'Ronald Coase argued that firms exist because internal coordination is sometimes cheaper than market coordination. When transaction costs collapse — via programmable settlement, machine-readable contracts, and AI-mediated negotiation — the boundary between firm and market becomes fluid. See [[Scarcity Inversion]] for the economic reframe.',
        },
        {
          subtitle: 'Prerequisites',
          description:
            'Coordination abundance is useless without [[Energy Abundance|cheap energy]] to power the substrate and [[Compute Abundance|cheap cognition]] to reason over the state. All three curves are required; any one of them alone is merely an optimization.',
        },
      ],
    },
  },
  {
    id: 'article-scarcity-inversion',
    slug: 'scarcity-inversion',
    type: 'article',
    subject: {
      title: 'Scarcity Inversion',
      subtitle: 'When the axioms of economics flip sign',
      summary:
        'Classical economics assumes scarce resources, unlimited wants and convex production. The inversion is the regime in which at least one of those assumptions no longer holds at the margin.',
      category: 'Concepts',
      tags: ['economics', 'theory'],
      updated: '2026-04-03',
    },
    content: {
      paragraphs: [
        {
          description:
            'The Scarcity Inversion is the economic consequence of [[Age of Abundance|the Age of Abundance]]. It is the regime in which the classical assumption of scarce resources is violated at the margin for at least one major input — energy, compute, or coordination — and the resulting price dynamics behave qualitatively differently from the textbook case.',
        },
        {
          subtitle: 'The diagnostic',
          description:
            'You know you are in an inverted regime when supply curves become nearly vertical at zero and price elasticity of demand begins to dominate the dynamics. Storage, dispatch, and allocation become the bottlenecks — not production.',
        },
      ],
    },
  },
];

/**
 * Index articles by slug for O(1) lookup from the wiki-link parser.
 * @type {Record<string, WikiArticle>}
 */
export const articlesBySlug = Object.fromEntries(
  articles.map((article) => [article.slug, article]),
);

/**
 * Canonicalize a human-readable wiki-link target into a slug candidate.
 *
 * The normalization rules are:
 *   1. Trim, lowercase.
 *   2. Collapse internal whitespace to single dashes.
 *   3. Strip anything that is not `[a-z0-9-]`.
 *   4. Strip a leading `the-` so `[[The Age of Abundance]]` matches
 *      the canonical slug `age-of-abundance`.
 *   5. Collapse duplicate dashes and trim leading/trailing dashes.
 *
 * @param {string} input
 * @returns {string}
 */
export function canonicalizeSlug(input) {
  if (!input) return '';
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^the-/, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Build a canonical-form → slug index so `[[Age of Abundance]]`,
 * `[[The Age of Abundance]]` and `[[age-of-abundance]]` all resolve
 * to the same canonical article slug.
 * @type {Record<string, string>}
 */
export const slugByTitle = (() => {
  /** @type {Record<string, string>} */
  const map = {};
  for (const article of articles) {
    map[canonicalizeSlug(article.subject.title)] = article.slug;
    map[canonicalizeSlug(article.slug)] = article.slug;
  }
  return map;
})();
