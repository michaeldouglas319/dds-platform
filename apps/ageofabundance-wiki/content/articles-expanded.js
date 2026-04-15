/**
 * Expanded wiki article dataset.
 *
 * Every entry is a UniversalSection (from @dds/types/section) — the same
 * shape the core renderer consumes. Wiki-specific fields live under
 * `meta.wiki` so the core schema continues to parse unchanged and the data
 * remains plug-compatible with future @dds/renderer plugins.
 *
 * These entries extend the seed set in `./articles.js` with topical depth:
 * the remaining material pillars, the economic substrate, the governance
 * layer, and the distributional critique. Cross-links use `[[Title]]` or
 * `[[id|display text]]` syntax and resolve against the combined corpus.
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
export const expandedArticles = [
  {
    id: 'compute-abundance',
    type: 'section',
    name: 'compute-abundance',
    subject: {
      title: 'Compute Abundance',
      subtitle: 'Cheap inference, open-weight models, and the personal AI substrate.',
      category: 'Pillar',
      summary:
        'Compute abundance is the pillar of the [[Age of Abundance]] in which trained intelligence — inference, reasoning, and perception — becomes as cheap and ubiquitous as electricity, unlocking personal AI as a general-purpose utility.',
    },
    content: {
      body: 'Compute abundance is the pillar of the [[Age of Abundance]] in which trained intelligence — inference, reasoning, and perception — becomes as cheap and ubiquitous as electricity. Where [[Energy Abundance]] collapses the price of joules, compute abundance collapses the price of cognitive work: translation, tutoring, diagnosis, design, and decision support. Its defining feature is that marginal intelligence approaches the marginal cost of the electrons that run it.',
      paragraphs: [
        {
          subtitle: 'The cost collapse of inference',
          description:
            'Between 2022 and 2026, the price of serving a token from a frontier-class model fell by roughly two orders of magnitude, driven by algorithmic efficiency, model distillation, speculative decoding, and purpose-built silicon. The implication is not that one company owns a cheap oracle but that inference becomes a commodity input, much like bandwidth after the fiber build-out of the early 2000s. Once a capability is cheap enough to embed everywhere, the locus of value moves from the model to the application, the data, and the [[Coordination Abundance|coordination layer]] around it.',
        },
        {
          subtitle: 'Open-weight models as public infrastructure',
          description:
            'Open-weight models — distributed under licenses that permit inspection, fine-tuning, and local deployment — are to compute abundance what standardized protocols are to the internet. They enable audit, resist single-vendor capture, and allow high-assurance sectors such as medicine, law, and defense to run inference inside their own trust boundaries. Critics note that "open weights" is not the same as "open training data" or "open governance"; the [[Distributional Justice in Abundance|distributional]] question of who benefits from open-weight ecosystems is unsettled.',
        },
        {
          subtitle: 'Personal AI and the agentic substrate',
          description:
            'Personal AI denotes models that act on behalf of a specific person, with durable memory, loyal defaults, and cryptographically verifiable identity. In the abundance framing, personal AI is the user-side counterpart to institutional AI: it negotiates, filters, and represents. Whether personal AI becomes genuinely personal — or is rebranded surveillance owned by platforms — depends on [[Governance Protocols]] for identity, consent, and data portability.',
        },
        {
          subtitle: 'Critiques and open questions',
          description:
            'Skeptics argue that "cheap inference" masks an expensive training regime concentrated in a handful of hyperscalers, and that energy and water footprints are externalized to vulnerable communities. Others question whether marginal-cost language has any purchase at all when fixed costs dominate and training frontiers keep moving. The wiki treats these as live, unresolved questions — the pillar is load-bearing only if its benefits are widely distributed.',
        },
      ],
    },
    display: {
      layout: 'wiki-article',
      textWidth: 'm',
    },
    meta: {
      wiki: {
        lastUpdatedISO: '2026-04-15',
        authors: ['editorial'],
        readingTimeMinutes: 6,
        tags: ['compute', 'pillar', 'ai', 'foundations'],
        summary:
          'Inference, open-weight models, and personal AI as the cognitive utility layer of the Age of Abundance.',
      },
    },
  },
  {
    id: 'atoms-abundance',
    type: 'section',
    name: 'atoms-abundance',
    subject: {
      title: 'Atoms Abundance',
      subtitle: 'Robotics, additive manufacturing, and programmable matter.',
      category: 'Pillar',
      summary:
        'Atoms abundance describes the pillar of the [[Age of Abundance]] in which physical goods — housing, mobility, food, medical devices, machines — fall toward the marginal cost of their material inputs through robotics, additive manufacturing, and [[Programmable Biology]].',
    },
    content: {
      body: 'Atoms abundance is the material counterpart of [[Compute Abundance]]: the pillar in which physical goods fall toward the marginal cost of their material inputs. It rests on three overlapping technology stacks — general-purpose robotics, additive manufacturing, and [[Programmable Biology]] — and on the [[Energy Abundance|cheap electrons]] that power all three. Its clearest test is whether a new house, a drug, or a replacement part can be produced at a price and latency that a median household can tolerate without subsidy.',
      paragraphs: [
        {
          subtitle: 'From rigid automation to general-purpose robotics',
          description:
            'Twentieth-century automation optimized for repetition in fixed environments. The current generation of robots — humanoid, quadruped, and mobile-manipulator — is trained end-to-end on perception-to-action models, which collapses the engineering cost of each new task. Combined with falling actuator prices, this moves robotics from capital-intensive single-purpose cells to general-purpose labor that can be amortized across many tasks. The resulting elasticity of physical work is what turns factory gains into everyday-life gains.',
        },
        {
          subtitle: 'Additive manufacturing and on-demand production',
          description:
            'Additive manufacturing (industrial 3D printing, cold spray, robotic construction) compresses the supply chain by moving design bits close to material atoms. Components that once required tooling runs of thousands to be economical can be printed in ones. In combination with large-format concrete and steel printing, this points toward housing built by small crews in days rather than months — contingent, as always, on the [[Governance Protocols|regulatory stack]] keeping up.',
        },
        {
          subtitle: 'Programmable matter and the biology frontier',
          description:
            'The deepest version of atoms abundance is [[Programmable Biology|programmable matter]]: cells, enzymes, and microbial communities engineered to produce materials, chemicals, and food. Because living systems self-replicate, they scale on a fundamentally different curve than mechanical manufacturing. This is why many commentators consider synthetic biology not a subdomain of atoms abundance but its upper bound.',
        },
        {
          subtitle: 'Critiques and distributional questions',
          description:
            'Skeptics note that previous automation waves produced abundance of goods alongside scarcity of livelihoods. If robotics and printing concentrate in firms that capture the entirety of the productivity surplus, atoms abundance may look like cheap products on collapsing labor markets. The [[Distributional Justice in Abundance|distributional justice]] lens treats these outcomes as design choices, not destiny.',
        },
      ],
    },
    display: {
      layout: 'wiki-article',
      textWidth: 'm',
    },
    meta: {
      wiki: {
        lastUpdatedISO: '2026-04-15',
        authors: ['editorial'],
        readingTimeMinutes: 6,
        tags: ['atoms', 'pillar', 'robotics', 'manufacturing'],
        summary:
          'General-purpose robotics, additive manufacturing, and programmable biology as the material pillar of abundance.',
      },
    },
  },
  {
    id: 'governance-protocols',
    type: 'section',
    name: 'governance-protocols',
    subject: {
      title: 'Governance Protocols',
      subtitle: 'Open standards, verifiable identity, and legitimate governance layers.',
      category: 'Governance',
      summary:
        'Governance protocols are the open, credibly neutral standards — for identity, attestation, payments, and public deliberation — that turn raw capacity in the [[Age of Abundance]] into durable, legitimate institutions.',
    },
    content: {
      body: 'Governance protocols are the open, credibly neutral standards that turn raw capacity into legitimate institutions. In the [[Age of Abundance]] framing, they are the connective tissue between the material pillars ([[Energy Abundance]], [[Compute Abundance]], [[Atoms Abundance]]) and the lived experience of citizens. Without them, [[Coordination Abundance]] collapses into private platforms issuing rulings that look like government but answer to shareholders.',
      paragraphs: [
        {
          subtitle: 'What counts as a governance protocol',
          description:
            'A governance protocol is any specification, credentialing system, or procedural standard that allows parties who do not fully trust one another to interact predictably. Examples range from the boring but indispensable (ISO container dimensions, DNS, public-key infrastructure) to the politically charged (verifiable digital identity, zero-knowledge selective disclosure, on-chain dispute resolution). The defining property is that legitimacy derives from the protocol, not from any single operator.',
        },
        {
          subtitle: 'Verifiable identity without surveillance',
          description:
            'A central technical requirement is identity that is verifiable without being surveillable — users can prove facts about themselves (age, residency, accreditation) without revealing more. Modern constructions based on selective disclosure and zero-knowledge proofs make this practical at internet scale. The policy requirement is harder: the systems must be mandatorily interoperable so no operator can unilaterally kick people out of civic life.',
        },
        {
          subtitle: 'Legitimacy as a protocol property',
          description:
            'Legitimacy is not a UX layer bolted on top; it is a property the protocol must be designed for. Mechanisms such as citizen assemblies, participatory budgeting, sortition, and verifiable deliberation ([[Coordination Abundance]]) are increasingly encoded as reusable procedural standards. The question of who writes, ratifies, and amends these standards — and under what appeals process — becomes the new constitutional question.',
        },
        {
          subtitle: 'Critiques and open questions',
          description:
            'Critics point out that "open protocol" has historically been captured by the largest implementers (email by a handful of providers, early web by walled gardens). Others note that protocols embed values — default privacy settings, default payment rails — that are politically consequential but rarely debated democratically. The [[Distributional Justice in Abundance|distributional]] critique asks who gets a seat at the standards body and who only receives the output.',
        },
      ],
    },
    display: {
      layout: 'wiki-article',
      textWidth: 'm',
    },
    meta: {
      wiki: {
        lastUpdatedISO: '2026-04-15',
        authors: ['editorial'],
        readingTimeMinutes: 6,
        tags: ['governance', 'protocols', 'identity', 'legitimacy'],
        summary:
          'Open standards, verifiable identity, and legitimate procedural layers as the connective tissue of abundance.',
      },
    },
  },
  {
    id: 'post-scarcity-economics',
    type: 'section',
    name: 'post-scarcity-economics',
    subject: {
      title: 'Post-Scarcity Economics',
      subtitle: 'How pricing, labor, and ownership shift when marginal costs approach zero.',
      category: 'Concept',
      summary:
        'Post-scarcity economics studies how pricing, labor markets, and property regimes reorganize when the marginal cost of essential goods approaches zero, as anticipated in the [[Age of Abundance]].',
    },
    content: {
      body: 'Post-scarcity economics studies how pricing, labor markets, and property regimes reorganize when the marginal cost of essential goods approaches zero. It is the economic substrate of the [[Age of Abundance]] framework and the lens that connects [[Near-Zero Marginal Cost]] dynamics to distributional outcomes. Its central claim is that neoclassical price theory, while still predictive at the margins, stops being descriptive of aggregate welfare once core needs are met by utilities rather than by markets.',
      paragraphs: [
        {
          subtitle: 'When prices stop carrying information',
          description:
            'Market prices carry information about scarcity; when supply is effectively unlimited, prices collapse to the cost of access rather than of production. This has already happened with recorded music, digital text, and voice telephony. Post-scarcity economics generalizes the pattern: once a good\'s marginal cost is rounding error, its allocation is governed by access protocols, not price signals. Whether those access protocols are progressive or regressive is a political question, not an economic one.',
        },
        {
          subtitle: 'Labor under falling demand for labor',
          description:
            'If [[Compute Abundance]] and [[Atoms Abundance]] reduce the labor intensity of most production, the classical wage-bargain weakens. Proposals in the literature include universal basic income, universal basic services, data dividends, and citizen equity in shared AI infrastructure. Each entails a different political settlement — who owns what, who is taxed, and who is granted standing to object. The wiki declines to endorse one but treats the choice as inescapable.',
        },
        {
          subtitle: 'Ownership in a world of copies',
          description:
            'When a design file, a model weight, or a genome can be copied at near-zero cost, the idea of owning the "thing" becomes incoherent, and ownership migrates to rights (to use, to audit, to update) and to complementary assets (the data, the deployment surface, the customer relationship). Intellectual-property regimes, competition law, and antitrust enforcement become the battleground where post-scarcity economics is actually contested.',
        },
        {
          subtitle: 'Critiques and open questions',
          description:
            'Skeptics argue that marginal cost never actually reaches zero: there is always embodied energy, maintenance, and security overhead. Others point out that "abundance of copies" coexists with genuine scarcity of housing, clean water, and time. The [[Distributional Justice in Abundance|distributional]] critique reminds us that averaged abundance can hide concentrated precarity, and that the economics of abundance only matters if it reaches the households counting cents.',
        },
      ],
    },
    display: {
      layout: 'wiki-article',
      textWidth: 'm',
    },
    meta: {
      wiki: {
        lastUpdatedISO: '2026-04-15',
        authors: ['editorial'],
        readingTimeMinutes: 7,
        tags: ['economics', 'concept', 'labor', 'ownership'],
        summary:
          'How pricing, labor, and ownership reorganize when marginal costs approach zero for essential goods.',
      },
    },
  },
  {
    id: 'near-zero-marginal-cost',
    type: 'section',
    name: 'near-zero-marginal-cost',
    subject: {
      title: 'Near-Zero Marginal Cost',
      subtitle: 'The threshold condition and its historical parallels.',
      category: 'Concept',
      summary:
        'Near-zero marginal cost is the threshold condition under which [[Post-Scarcity Economics]] begins to apply: the cost of producing one additional unit of a good approaches zero, as has happened historically with electricity, broadband, and digital content.',
    },
    content: {
      body: 'Near-zero marginal cost (NZMC) is the threshold condition under which [[Post-Scarcity Economics]] begins to apply. It denotes the regime in which producing one additional unit of a good costs essentially nothing once the fixed infrastructure is in place. NZMC is less a prediction than a pattern — observed in electricity, broadband, recorded media, and increasingly in [[Compute Abundance|inference]] — and the [[Age of Abundance]] thesis is that the pattern is extending to domains (energy, manufacturing, biology) where it was previously unthinkable.',
      paragraphs: [
        {
          subtitle: 'Historical parallel: electricity',
          description:
            'The early twentieth-century electrification of the industrial world is the canonical NZMC case. Once the grid was built and generators were running, supplying an additional household cost almost nothing compared to the capital stock. This enabled the emergence of entire categories of goods — refrigeration, radio, vacuum cleaners, elevators — that had been economically unimaginable two decades earlier. The [[Age of Abundance]] argument treats today\'s solar-and-storage build-out as the direct analogue.',
        },
        {
          subtitle: 'Historical parallel: broadband',
          description:
            'The second canonical case is the late-1990s fiber build-out. Once the fiber was in the ground, the marginal cost of a byte approached zero, and the industries built on that foundation (streaming, cloud, real-time messaging) dwarf the original telecoms sector that financed it. The lesson is that NZMC regimes frequently ruin their own first-generation investors while creating enormous second-order value — an uncomfortable truth for anyone projecting returns from today\'s AI and energy capex.',
        },
        {
          subtitle: 'Conditions for the threshold to matter',
          description:
            'Reaching NZMC is necessary but not sufficient for [[Post-Scarcity Economics]] to produce broad welfare gains. The good must also be distributable — physically or digitally — to the people who need it, and access must be governed by [[Governance Protocols]] that do not re-introduce scarcity through artificial bottlenecks (proprietary standards, patent thickets, rent-seeking intermediaries). The difference between "NZMC in theory" and "abundance in practice" is almost entirely governance.',
        },
        {
          subtitle: 'Critiques and open questions',
          description:
            'Critics argue that many goods labeled "near-zero marginal cost" carry substantial hidden marginal costs: externalized emissions, data-center water use, supply-chain labor. Others note that fixed costs can be so high, and so concentrated, that the nominal marginal cost is an accounting fiction. These are not rebuttals of the concept so much as reminders that the accounting frame must be honest about embedded and externalized costs.',
        },
      ],
    },
    display: {
      layout: 'wiki-article',
      textWidth: 'm',
    },
    meta: {
      wiki: {
        lastUpdatedISO: '2026-04-15',
        authors: ['editorial'],
        readingTimeMinutes: 5,
        tags: ['economics', 'concept', 'history', 'foundations'],
        summary:
          'The threshold condition under which post-scarcity dynamics begin to apply, and its historical parallels.',
      },
    },
  },
  {
    id: 'distributional-justice-in-abundance',
    type: 'section',
    name: 'distributional-justice-in-abundance',
    subject: {
      title: 'Distributional Justice in Abundance',
      subtitle: 'Who owns the models, who benefits from the electrons, who is left behind.',
      category: 'Concept',
      summary:
        'Distributional justice in abundance asks who actually receives the benefits of falling marginal costs, a question the [[Age of Abundance]] treats as load-bearing rather than peripheral because abundance has historically failed the people who need it most.',
    },
    content: {
      body: 'Distributional justice in abundance asks who actually receives the benefits of falling marginal costs. The [[Age of Abundance]] framing treats the question as load-bearing, not peripheral, because historical abundance has repeatedly failed the people who needed it most: famines during record harvests, housing crises amid construction booms, information poverty alongside internet ubiquity. The article catalogs the recurring failure modes and the design choices that have sometimes averted them.',
      paragraphs: [
        {
          subtitle: 'The paradox of unreached abundance',
          description:
            'Calorie production per capita has risen in almost every decade of the last two centuries, yet chronic malnutrition persists in the hundreds of millions. Global housing output would, on paper, shelter every person alive, yet homelessness rises in the wealthiest cities. These are not anomalies but the central case the wiki asks readers to hold in mind when reading [[Energy Abundance|optimistic]] [[Compute Abundance|pillar]] [[Atoms Abundance|articles]]. Abundance at the aggregate level has a weak track record of being abundance at the household level.',
        },
        {
          subtitle: 'Who owns the models, who benefits from the electrons',
          description:
            'The concentration of frontier AI capacity in a small number of firms is the contemporary face of the problem. Open-weight models, public compute, and commons-governed training data are partial answers ([[Compute Abundance]], [[Governance Protocols]]), but they do not automatically redistribute surplus. Similarly, cheap solar does not automatically become cheap bills: distribution networks, metering regimes, and tariff structures decide who captures the savings.',
        },
        {
          subtitle: 'Design patterns that have worked',
          description:
            'History records a handful of institutional patterns that have converted technical abundance into distributional abundance: universal public utilities, consumer cooperatives, mandated interoperability, progressive pricing, and public-option providers. None is a silver bullet, and each has been captured or hollowed out somewhere. The wiki catalogs these patterns not as a menu but as the inheritance the next transition has to study.',
        },
        {
          subtitle: 'Critiques of the critique',
          description:
            'A counter-critique holds that insisting on distributional guarantees before deploying abundance technologies is itself regressive, because delay costs lives (especially in the Global South). A more dialectical position, which the wiki broadly adopts, is that deployment and distributional design must move in parallel — neither a blank check for builders nor a veto for every inequality.',
        },
        {
          subtitle: 'Open questions',
          description:
            'How should citizens\' equity stakes in publicly trained models be structured? What is the right level at which to set a universal basic services floor? Can [[Governance Protocols|protocol-level]] guarantees (mandatory portability, open standards, audited access) substitute for redistribution, or are they complementary? The wiki holds these questions open and treats confident answers with suspicion.',
        },
      ],
    },
    display: {
      layout: 'wiki-article',
      textWidth: 'm',
    },
    meta: {
      wiki: {
        lastUpdatedISO: '2026-04-15',
        authors: ['editorial'],
        readingTimeMinutes: 8,
        tags: ['justice', 'concept', 'critique', 'distribution'],
        summary:
          'Why aggregate abundance has historically failed the people who most need it, and what design patterns have sometimes worked.',
      },
    },
  },
  {
    id: 'ephemeralization',
    type: 'section',
    name: 'ephemeralization',
    subject: {
      title: 'Ephemeralization',
      subtitle: 'Buckminster Fuller\'s doing-more-with-less, reread for the present.',
      category: 'Concept',
      summary:
        'Ephemeralization is Buckminster Fuller\'s term for the long-run tendency of technology to accomplish "more and more with less and less," now reread as a precursor to the [[Age of Abundance]] framework.',
    },
    content: {
      body: 'Ephemeralization is Buckminster Fuller\'s 1938 term for the long-run tendency of technology to accomplish "more and more with less and less — until eventually you can do everything with nothing." In the [[Age of Abundance]] framing it is a direct intellectual ancestor: a claim about falling material intensity per unit of human benefit. The modern renaissance of the concept is driven by the observation that software, photovoltaics, and biotechnology are each ephemeralizing categories that had seemed stubbornly material.',
      paragraphs: [
        {
          subtitle: 'Fuller\'s original argument',
          description:
            'Fuller observed that a telephone conversation in 1930 required tons of copper and rooms of switching equipment, while by 1960 the same communication used a fraction of the copper and a fraction of the energy. Generalized, his claim was that human well-being could be decoupled from resource extraction if design intelligence kept compounding. The argument was ignored for decades because mid-century industrial economics treated matter as the cheap input and labor as the constraint.',
        },
        {
          subtitle: 'Modern renaissance',
          description:
            'The rediscovery of ephemeralization tracks three trends: the dematerialization of media into bits ([[Near-Zero Marginal Cost]]), the learning-curve collapse of photovoltaics ([[Energy Abundance]]), and the shift of manufacturing from mass-intensive to information-intensive with additive techniques ([[Atoms Abundance]]). Each is a domain Fuller predicted would ephemeralize, even though he did not foresee the specific technologies.',
        },
        {
          subtitle: 'Ephemeralization is not dematerialization',
          description:
            'A common misreading treats ephemeralization as pure dematerialization — fewer atoms, period. Fuller\'s actual claim is more specific: the service delivered per unit of input keeps rising, not that total inputs fall. Historically, total resource consumption has often risen even as intensity has fallen (the Jevons paradox). Honest use of the term names the intensity trend without overclaiming absolute decoupling.',
        },
        {
          subtitle: 'Critiques and open questions',
          description:
            'Ecological critics argue that ephemeralization has repeatedly failed to prevent absolute resource overshoot, and that treating it as a law invites complacency. Political critics note that decoupling is easier in rich geographies that have offshored their material footprints. The wiki preserves ephemeralization as a useful heuristic while refusing to treat it as a free pass against the [[Distributional Justice in Abundance|distributional]] and ecological ledgers.',
        },
      ],
    },
    display: {
      layout: 'wiki-article',
      textWidth: 'm',
    },
    meta: {
      wiki: {
        lastUpdatedISO: '2026-04-15',
        authors: ['editorial'],
        readingTimeMinutes: 5,
        tags: ['concept', 'history', 'fuller', 'foundations'],
        summary:
          "Buckminster Fuller's long-run tendency to do more with less, and its uneasy modern renaissance.",
      },
    },
  },
  {
    id: 'programmable-biology',
    type: 'section',
    name: 'programmable-biology',
    subject: {
      title: 'Programmable Biology',
      subtitle: 'Synthetic biology across agriculture, medicine, and materials.',
      category: 'Practice',
      summary:
        'Programmable biology treats living systems — cells, enzymes, microbes, and plants — as platforms that can be engineered to produce food, medicine, and materials, and is widely considered the upper bound of [[Atoms Abundance]].',
    },
    content: {
      body: 'Programmable biology treats living systems — cells, enzymes, microbes, plants — as platforms that can be engineered to produce food, medicine, and materials. Because biology self-replicates, programmable biology scales on a fundamentally different curve than mechanical manufacturing and is widely considered the upper bound of [[Atoms Abundance]]. Its tools (CRISPR-class editors, de novo protein design, cell-free expression, genome-scale writing) entered practical use in the 2020s, and its cost curves echo the early photovoltaic trajectory ([[Energy Abundance]]).',
      paragraphs: [
        {
          subtitle: 'Agriculture: precision fermentation and resilient crops',
          description:
            'Precision fermentation — engineering microbes to secrete specific proteins and lipids — has moved dairy, egg, and structural-protein production off the land in pilot facilities. Combined with climate-resilient crop varieties produced by modern editing techniques, the arable-land intensity of a given diet can fall by an order of magnitude. The political economy of displaced pastoralists and farming communities is an unresolved [[Distributional Justice in Abundance|distributional]] problem.',
        },
        {
          subtitle: 'Medicine: from discovery to manufacture',
          description:
            'Programmable biology is reorganizing the drug pipeline at both ends. At discovery, [[Compute Abundance|AI-driven]] structure prediction and generative protein design compress the lead-identification phase from years to weeks. At manufacture, cell-free systems and on-demand bioreactors promise locally produced therapies, including personalized cancer vaccines. The binding constraint is no longer synthesis but trial infrastructure, regulatory pathways, and the [[Governance Protocols]] that certify safety.',
        },
        {
          subtitle: 'Materials: biology as a factory',
          description:
            'Biology produces materials whose performance-to-cost ratios remain out of reach for traditional chemistry: spider-silk-class fibers, self-healing polymers, mycelium composites, and fixed-nitrogen soil amendments. At scale, these displace petrochemical feedstocks and embed abundance into supply chains that previously had none. The catch is that "at scale" has repeatedly proved harder than lab demonstrations suggest.',
        },
        {
          subtitle: 'Biosecurity and biosafety',
          description:
            'Programmable biology is the abundance pillar with the most asymmetric downside: the same tools that produce abundant medicine can, in principle, produce abundant harm. Responsible-deployment literature emphasizes layered controls — synthesis screening, benchtop-device attestation, laboratory registries, international norms — as non-optional infrastructure. [[Governance Protocols]] for programmable biology are therefore not a separate discussion but a precondition.',
        },
        {
          subtitle: 'Critiques and open questions',
          description:
            'Critics point out that biology\'s abundance is not evenly distributed even in principle: tropical ecosystems host the genetic diversity that enables much of this work, yet their communities rarely see the surplus. Others worry that privatized genomic libraries will re-create scarcity where abundance is biologically possible. The wiki treats both critiques as integral to the programmable-biology story rather than adjacent to it.',
        },
      ],
    },
    display: {
      layout: 'wiki-article',
      textWidth: 'm',
    },
    meta: {
      wiki: {
        lastUpdatedISO: '2026-04-15',
        authors: ['editorial'],
        readingTimeMinutes: 7,
        tags: ['biology', 'practice', 'medicine', 'agriculture'],
        summary:
          'Engineering living systems for food, medicine, and materials — and the biosecurity and equity questions they raise.',
      },
    },
  },
];
