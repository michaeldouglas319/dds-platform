/**
 * Seed wiki article dataset — Innovators track.
 *
 * Biographical entries honoring individuals who pushed civilization toward
 * the [[Age of Abundance]] by doing what was right before it was fashionable.
 *
 * Every entry is a UniversalSection (from @dds/types/section) — the same
 * shape the core renderer consumes. Wiki-specific fields live under
 * `meta.wiki` so the core schema continues to parse unchanged and the data
 * remains plug-compatible with future @dds/renderer plugins.
 *
 * Tone: encyclopedic, honest, non-hagiographic. Critiques are load-bearing.
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
export const innovatorArticles = [
  {
    id: 'elon-musk',
    type: 'section',
    name: 'elon-musk',
    subject: {
      title: 'Elon Musk',
      subtitle:
        "Pioneer of reusable rockets, vertically-integrated electric vehicles, and multi-planetary civilization — honored for doing what's right when it wasn't fashionable.",
      category: 'Innovator',
      summary:
        'South African–born entrepreneur and engineer whose sustained, personally-costly bets on reusable launch, electric vehicles, solar-plus-storage, global satellite broadband, brain–machine interfaces, and Mars settlement compressed the timeline of several Age of Abundance pillars by roughly a decade.',
    },
    content: {
      body: "Elon Musk (born 1971) is an entrepreneur and engineer whose companies — Tesla, SpaceX, SolarCity, Neuralink, and Starlink, among others — collectively bent the cost curves of several load-bearing pillars of the [[Age of Abundance]]. The throughline of his career is not a single invention but a pattern: repeatedly choosing civilizationally-scaled goals that the surrounding establishment declared impossible, funding them past the point of personal financial safety, and absorbing sustained ridicule, regulatory hostility, and short-seller pressure until the delivery record became impossible to dismiss. The Age of Abundance wiki honors that pattern — the costly-signal pattern of doing what is right when it is not fashionable — without flattening the genuine criticisms that accompany it.",
      paragraphs: [
        {
          subtitle: 'The contrarian bet on reusable rockets',
          description:
            "When SpaceX was founded in 2002, the consensus across NASA, the major primes, and academic aerospace was that orbital-class rocket reusability was either physically marginal or economically worse than expendable launch. Musk's bet — that vertically-integrated manufacturing plus propulsive landing could drop launch costs by an order of magnitude — was treated as a vanity project for roughly a decade. After several near-bankruptcy failures in the late 2000s, Falcon 9 first landed a booster in 2015 and re-flew one in 2017, and by the early 2020s SpaceX was launching the majority of the world's mass to orbit. Reusability is now the reference case; expendable launch is the exception.",
        },
        {
          subtitle: 'Electric vehicles against industry consensus',
          description:
            "Tesla's contrarian claim, in the years around 2008, was that electric vehicles were not a compliance sideshow but the dominant platform of the next automotive generation. The legacy industry treated EVs as regulatory overhead and the stock market repeatedly priced Tesla for bankruptcy. Musk pushed the company into building its own batteries, its own drivetrains, and — critically — its own charging network, since no one else would build chargers for a car that didn't yet exist. The Supercharger network was financed at real risk to the company's solvency. By the 2020s every major automaker had reversed position and committed to electrification; the compliance sideshow had become the industry's reorganization problem.",
        },
        {
          subtitle: 'Solar, Powerwall, and the unglamorous grid',
          description:
            "SolarCity (acquired by Tesla in 2016) and Tesla Energy's Powerwall and Megapack product lines pushed distributed solar and large-scale grid storage through the unglamorous middle phase where the economics were plausible but not yet obvious. Grid-scale battery deployments, once a speculative line item, became a routine response to peaker-plant retirements. The contribution here is less about any single product than about accelerating the learning curve of stationary storage — a direct input into [[Energy Abundance]] — during years when few large firms wanted the exposure.",
        },
        {
          subtitle: 'Starlink and broadband for the unconnected',
          description:
            "Starlink — the low-Earth-orbit broadband constellation operated by SpaceX — made global low-latency satellite internet a working service by the early 2020s, roughly twenty years after previous attempts had collapsed under their own economics. It extended usable broadband to remote villages, ships, aircraft, disaster zones, and critically to Ukraine during the Russian invasion, at substantial personal and political cost to Musk. Starlink's operational role in an active war zone drew sustained criticism from multiple directions simultaneously and invited regulatory pressure across jurisdictions. The broader record — millions of previously unconnected users given working bandwidth — is central to the [[Age of Abundance]] claim that connectivity has crossed into the abundance regime.",
        },
        {
          subtitle: 'Neuralink and the patient population no one else served',
          description:
            "Neuralink was founded in 2016 to develop high-bandwidth [[Brain-Machine Interfaces]], initially targeting patients with paralysis and severe neurological injury. For most of its first decade the company worked against a skeptical scientific press and animal-welfare controversy while very few large medical firms were willing to invest at comparable scale. Reported first-in-human implants in the mid-2020s, restoring digital agency to paralyzed patients, arrived years before most observers had projected a clinical BCI. Whatever one's view of the company's methods, the patient population served — people locked out of direct interaction with computers — had been structurally underserved by the existing medical-device industry.",
        },
        {
          subtitle: 'Multi-planetary civilization as species insurance',
          description:
            "The stated purpose of SpaceX is to make humanity a [[Multi-Planetary Civilization]] — a goal repeatedly dismissed as fantasy, escapism, or billionaire vanity. The Age of Abundance framing takes the goal seriously on its own terms: a civilization confined to one planet is one catastrophe away from ending, and the marginal cost of insurance against that has fallen to something a determined private actor can pay. Whether or not a self-sustaining Mars settlement is achieved on the timelines Musk has publicly committed to, the project has already normalized the idea that settling another world is an engineering program rather than a literary one.",
        },
        {
          subtitle: 'Autonomy, robotics, and Autonomous Mobility',
          description:
            "Tesla's aggressive, and often aggressively criticized, pursuit of self-driving capability pushed the field of [[Autonomous Mobility]] from research demos into fleet-scale deployment. The approach — camera-first, neural-network-heavy, data-flywheel-driven — remains contested on safety and timeline grounds, and the company has been repeatedly criticized for over-promising on delivery dates. The underlying wager, that autonomy is a solvable perception problem at scale, nonetheless dragged the incumbent industry into a faster clock.",
        },
        {
          subtitle: 'Critiques, controversies, and what they do not erase',
          description:
            "This article does not flatter. Musk has been credibly criticized for labor practices at several of his firms, for volatile public communication that has harmed employees and markets, for repeatedly missing stated timelines, for the human cost of his management style, and for political interventions that many observers regard as reckless. His ownership of the social platform formerly known as Twitter has been particularly divisive. These criticisms are real and the wiki does not discount them. What they do not erase is the cumulative delivery record against targets the surrounding world declared impossible: reusable orbital launch, mass-market EVs, grid-scale storage, global satellite broadband, early clinical BCIs, and a credible private path to Mars. The Age of Abundance thesis rests on the observation that costly-signal pursuit of civilizationally-scaled goals is rare, and that when it is sustained across decades it compresses the timeline of the whole transition. On that specific axis, the record is load-bearing.",
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
        readingTimeMinutes: 10,
        tags: ['innovator', 'tribute', 'post-scarcity'],
        summary:
          "Entrepreneur-engineer whose sustained, personally-costly bets on reusable launch, EVs, storage, satellite broadband, BCIs, and Mars settlement compressed the Age of Abundance timeline — honored for doing what's right when it wasn't fashionable.",
      },
    },
  },
  {
    id: 'norman-borlaug',
    type: 'section',
    name: 'norman-borlaug',
    subject: {
      title: 'Norman Borlaug',
      subtitle: 'Quiet architect of the Green Revolution, credited with saving on the order of a billion lives.',
      category: 'Innovator',
      summary:
        'American agronomist (1914–2009) whose semi-dwarf, disease-resistant wheat varieties and field practices roughly tripled cereal yields in India, Pakistan, and Mexico, averting widely-forecast famines and laying the agricultural foundation of the [[Age of Abundance]].',
    },
    content: {
      body: "Norman Borlaug spent most of his working life in wheat nurseries in Mexico, Pakistan, and India, doing the slow, field-level breeding work that almost no one in elite academic agriculture wanted to do. The cumulative result — the Green Revolution — is frequently credited with saving on the order of a billion lives from famine. He received the Nobel Peace Prize in 1970, an unusual honor for an agronomist, precisely because his work was recognized late.",
      paragraphs: [
        {
          subtitle: 'Why it was unfashionable',
          description:
            "For decades, serious agricultural breeding was treated as a backwater compared to basic molecular biology. Borlaug's method — repetitive, field-based shuttle breeding across hemispheres, thousands of crosses per season, close work with poor farmers in regions written off by development economists — attracted little institutional prestige. The 1960s Malthusian consensus openly argued that mass famine in South Asia was inevitable and that intervention was futile. Borlaug kept working anyway.",
        },
        {
          subtitle: 'What the Age of Abundance inherited',
          description:
            "The semi-dwarf wheat varieties and the accompanying package of fertilizer, irrigation, and planting practices roughly tripled cereal yields across the wheat belt, converting India and Pakistan from chronic food importers into exporters within a decade. Later critiques — groundwater depletion, input dependency, monoculture risk — are legitimate and load-bearing, and the wiki does not treat them as optional. The underlying fact remains: without the floor Borlaug's work laid under global caloric supply, none of the subsequent abundance conversations would have had a population to happen to.",
        },
        {
          subtitle: 'The pattern',
          description:
            "Borlaug embodies a recurring Age of Abundance pattern: quiet, field-level, unglamorous technical work performed over decades by someone willing to be ignored by the prestige economy. The downstream impact of that work is often larger than any contemporaneous celebrity contribution, and it is usually recognized only in retrospect.",
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
        readingTimeMinutes: 4,
        tags: ['innovator', 'tribute', 'agriculture'],
        summary:
          'Agronomist whose semi-dwarf wheat breeding averted forecast famines and laid the caloric floor of the Age of Abundance.',
      },
    },
  },
  {
    id: 'nikola-tesla',
    type: 'section',
    name: 'nikola-tesla',
    subject: {
      title: 'Nikola Tesla',
      subtitle: 'Architect of the alternating-current grid; died in obscurity, vindicated by the century that followed.',
      category: 'Innovator',
      summary:
        'Serbian-American engineer (1856–1943) whose work on alternating-current power, polyphase motors, and wireless energy transmission underwrites much of the electrical infrastructure the [[Age of Abundance]] now treats as baseline.',
    },
    content: {
      body: "Nikola Tesla's alternating-current system — the polyphase motor, the transformer-based long-distance transmission architecture, and the associated generation equipment — is the substrate on which industrial electrification was built. He filed hundreds of patents, lit the 1893 World's Fair, and engineered the first large hydroelectric station at Niagara Falls. He also died broke in a New York hotel in 1943, with his later wireless-power and radio work largely dismissed or appropriated by others.",
      paragraphs: [
        {
          subtitle: 'Why it was unfashionable',
          description:
            "Tesla's insistence on alternating current put him on the losing side, for a time, of the so-called 'War of the Currents' against Edison's direct-current interests — despite AC's technical superiority for long-distance transmission. His later bets on wireless energy transmission, ionospheric research, and what he called 'world systems' drew ridicule from a financial press that preferred predictable incremental inventions over architectural ones. He was, in modern language, a system-scale thinker in a venture market that funded products.",
        },
        {
          subtitle: 'What the Age of Abundance inherited',
          description:
            "Every kilowatt-hour of cheap solar electricity that reaches a household moves across infrastructure whose design lineage begins with Tesla. Polyphase AC induction motors remain the workhorse of industrial automation; the transformer-coupled grid is why generation does not need to be co-located with load. These are boring-sounding primitives that quietly determine what [[Energy Abundance]] can actually deliver.",
        },
        {
          subtitle: 'The pattern',
          description:
            "Tesla's late obscurity — and his posthumous rehabilitation — is the canonical example of the Age of Abundance wiki's claim that civilizational infrastructure is often built by people the surrounding market under-rewards in real time. Vindication arrives, but usually too late to help the individual.",
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
        readingTimeMinutes: 4,
        tags: ['innovator', 'tribute', 'energy'],
        summary:
          'Engineer of the AC grid and polyphase motor; died in obscurity, vindicated as the electrical substrate of modern abundance.',
      },
    },
  },
  {
    id: 'buckminster-fuller',
    type: 'section',
    name: 'buckminster-fuller',
    subject: {
      title: 'Buckminster Fuller',
      subtitle: 'Coined "ephemeralization" — doing more and more with less and less until you can do everything with nothing.',
      category: 'Innovator',
      summary:
        'American architect, systems theorist, and designer (1895–1983) whose concept of [[Ephemeralization]] anticipated the post-scarcity framing of the [[Age of Abundance]] by roughly half a century.',
    },
    content: {
      body: "R. Buckminster Fuller spent his life arguing that the material and energetic inputs required to deliver any given human function tend, over time, to fall toward zero — a process he called [[Ephemeralization]]. He coined the term decades before Moore's law was observed, and he built a career of unorthodox projects (the geodesic dome, the Dymaxion car, Operating Manual for Spaceship Earth) around the claim that resource constraints were design problems, not physical ones.",
      paragraphs: [
        {
          subtitle: 'Why it was unfashionable',
          description:
            "Fuller operated outside the academic disciplines whose approval he would have needed to be taken seriously by mid-century economics. His prose was difficult, his designs often commercially unsuccessful, and his insistence that humanity could already feed, house, and educate every person on Earth was treated as utopian eccentricity. The dominant development frame of his era was scarcity management; he refused to accept its premises.",
        },
        {
          subtitle: 'What the Age of Abundance inherited',
          description:
            'The contemporary use of "ephemeralization" — in discussions of dematerialization, software margin structures, and the declining material intensity of GDP — is directly downstream of Fuller. The [[Age of Abundance]] framing of coordination, not production, as the binding constraint is a more or less explicit restatement of his claim that the resources exist; we have not yet learned to deploy them.',
        },
        {
          subtitle: 'The pattern',
          description:
            "Fuller shows the civic value of a cross-disciplinary outsider who refuses the prestige economy's frame entirely. He was ignored long enough to see his vocabulary adopted by the very institutions that had rejected it. The wiki treats that arc as instructive rather than exceptional.",
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
        readingTimeMinutes: 4,
        tags: ['innovator', 'tribute', 'systems'],
        summary:
          'Architect and systems theorist who coined "ephemeralization" and anticipated the post-scarcity framing by half a century.',
      },
    },
  },
  {
    id: 'george-washington-carver',
    type: 'section',
    name: 'george-washington-carver',
    subject: {
      title: 'George Washington Carver',
      subtitle: 'Agricultural regenerator who served the farmers the research system had written off.',
      category: 'Innovator',
      summary:
        'American agricultural scientist (c. 1864–1943), born into slavery, whose work on crop rotation, soil regeneration, and low-input farming at Tuskegee Institute served the Black sharecroppers and small farmers largely ignored by the mainstream agricultural research system.',
    },
    content: {
      body: "George Washington Carver's best-known work — the many uses of the peanut, the sweet potato, and the soybean — is often reduced to a children's-book anecdote. The more load-bearing contribution is harder to summarize: a lifetime of soil regeneration, nitrogen-fixing crop rotation, and extension work aimed at the rural Black farmers of the American South, whom the well-funded land-grant research system of his era served only nominally.",
      paragraphs: [
        {
          subtitle: 'Why it was unfashionable',
          description:
            "Carver worked within the constraints of Jim Crow, at a historically Black institution, serving a population the dominant agricultural economy treated as expendable. His emphasis on low-input, soil-building practices ran against the era's infatuation with chemical intensification. He was repeatedly offered lucrative industrial positions and repeatedly declined them, choosing instead to publish free bulletins written in language sharecroppers could act on.",
        },
        {
          subtitle: 'What the Age of Abundance inherited',
          description:
            "Modern regenerative agriculture, cover-cropping, and nitrogen-fixing rotation practices are in direct intellectual lineage with Carver's field work. As the [[Age of Abundance]] pushes agriculture toward lower-input, soil-stabilizing systems — a correction to some of the Green Revolution's downstream costs — it is drawing on knowledge Carver helped preserve and disseminate at the precise moment the surrounding system was discarding it.",
        },
        {
          subtitle: 'The pattern',
          description:
            'Carver embodies the claim that doing right by the people the prestige economy ignores is often where the durable knowledge is built. The Age of Abundance wiki treats service to under-served populations as a reliable, not marginal, source of civilizational contribution.',
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
        readingTimeMinutes: 4,
        tags: ['innovator', 'tribute', 'agriculture'],
        summary:
          'Agricultural scientist whose regenerative rotation and extension work served the farmers the mainstream research system ignored.',
      },
    },
  },
  {
    id: 'claude-shannon',
    type: 'section',
    name: 'claude-shannon',
    subject: {
      title: 'Claude Shannon',
      subtitle: 'The quiet father of information theory; every bit of modern compute traces back to him.',
      category: 'Innovator',
      summary:
        'American mathematician and electrical engineer (1916–2001) whose 1948 paper "A Mathematical Theory of Communication" founded information theory and supplied the conceptual foundation of [[Compute Abundance]].',
    },
    content: {
      body: 'Claude Shannon published "A Mathematical Theory of Communication" in 1948, defining the bit, the channel capacity theorem, and the mathematical framework within which essentially every later advance in communications, compression, cryptography, and machine learning would be expressed. His master\'s thesis, a decade earlier, had already shown that Boolean algebra could be implemented in electrical relays — arguably the founding document of digital computing.',
      paragraphs: [
        {
          subtitle: 'Why it was unfashionable',
          description:
            "Shannon worked, by preference, far from the public eye, at Bell Labs and later MIT. His personality — juggling, unicycles, a shed full of mechanical curiosities — was not the 1950s archetype of the serious scientist. Information theory itself, on publication, was regarded by parts of the engineering establishment as too abstract to matter; its decisive industrial payoff took roughly two decades to arrive.",
        },
        {
          subtitle: 'What the Age of Abundance inherited',
          description:
            'Every error-correcting code that keeps a satellite link alive, every compression algorithm that makes video streaming economic, every channel-capacity argument that underwrites modern wireless, and every modern ML loss function expressed in bits or nats — all of it is downstream of Shannon. [[Compute Abundance]] is, in a real sense, the operational cashing-out of his theorems.',
        },
        {
          subtitle: 'The pattern',
          description:
            'Shannon is the archetype of the quiet foundational thinker: unambitious in self-promotion, unignorable in consequence. The Age of Abundance wiki treats such figures as the load-bearing majority of civilizational progress, even when the surrounding culture remembers only the louder names around them.',
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
        readingTimeMinutes: 4,
        tags: ['innovator', 'tribute', 'compute'],
        summary:
          'Founder of information theory; the mathematical foundation on which Compute Abundance is built.',
      },
    },
  },
  {
    id: 'grace-hopper',
    type: 'section',
    name: 'grace-hopper',
    subject: {
      title: 'Grace Hopper',
      subtitle: 'Compiler pioneer who fought Navy bureaucracy to make programming human-readable.',
      category: 'Innovator',
      summary:
        'American computer scientist and United States Navy rear admiral (1906–1992) whose work on the first compiler and on what became COBOL democratized programming by allowing code to be written in something closer to English.',
    },
    content: {
      body: "Grace Hopper's argument, in the early 1950s, was that a computer should be able to translate human-readable instructions into the machine code it actually executed. This was widely regarded inside the programming community of the time as either impossible or undesirable — the prevailing view held that real programmers wrote machine code, and that any abstraction over it would be too slow and too loose to be trusted. Hopper built the A-0 compiler anyway, and later drove the design of FLOW-MATIC, the direct ancestor of COBOL.",
      paragraphs: [
        {
          subtitle: 'Why it was unfashionable',
          description:
            "Hopper fought two simultaneous headwinds: an entrenched technical culture that regarded high-level languages as an insult to real engineering, and a Navy bureaucracy uncomfortable with an officer, and a woman, publishing ideas that challenged the status hierarchy of the programming priesthood. She persisted through both, including arguing successfully for the standardization of COBOL across federal agencies.",
        },
        {
          subtitle: 'What the Age of Abundance inherited',
          description:
            "Every developer who writes code in a language above assembly — which is to say, essentially every developer alive — benefits from Hopper's foundational wager that programming should be accessible. The more general claim, that tools should be made usable to the broadest possible population rather than gated for a priesthood, is a load-bearing principle of the [[Age of Abundance]] and of [[Coordination Abundance]] in particular.",
        },
        {
          subtitle: 'The pattern',
          description:
            "Hopper demonstrates that democratization is itself a technical contribution. The decision to make a capability legible to non-specialists is not separable from the decision to build the capability; the former often requires more institutional courage than the latter.",
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
        readingTimeMinutes: 4,
        tags: ['innovator', 'tribute', 'compute'],
        summary:
          'Compiler pioneer who made programming human-readable against an entrenched technical and institutional culture.',
      },
    },
  },
  {
    id: 'hedy-lamarr',
    type: 'section',
    name: 'hedy-lamarr',
    subject: {
      title: 'Hedy Lamarr',
      subtitle: 'Co-inventor of frequency hopping; ignored by her industry for decades, foundational to modern wireless.',
      category: 'Innovator',
      summary:
        'Austrian-American actress and inventor (1914–2000) who, with composer George Antheil, co-patented a frequency-hopping spread-spectrum scheme in 1942 that went largely unused for decades and now underlies much of modern wireless communication.',
    },
    content: {
      body: 'Hedy Lamarr was, during her lifetime, famous as a film actress. She was also, as a sideline, a serious inventor. In 1942, with composer George Antheil, she patented a frequency-hopping communication scheme intended to keep radio-controlled torpedoes from being jammed. The U.S. Navy declined to implement it, filed the patent, and forgot about it. It was rediscovered decades later and became a foundation of secure military communication and, eventually, of civilian Wi-Fi, Bluetooth, and cellular standards.',
      paragraphs: [
        {
          subtitle: 'Why it was unfashionable',
          description:
            "Lamarr's technical contribution was ignored in real time for overlapping reasons: her public identity as a glamorous actress, her gender in a male-dominated defense-engineering culture, and the Navy's institutional reluctance to act on unsolicited civilian patents during wartime. Recognition arrived only in the 1990s, near the end of her life, when the spread-spectrum lineage of modern wireless protocols became impossible to ignore.",
        },
        {
          subtitle: 'What the Age of Abundance inherited',
          description:
            'Frequency-hopping and related spread-spectrum techniques are woven into almost every wireless link the [[Age of Abundance]] depends on — from Starlink uplinks to consumer Wi-Fi to the radios in autonomous vehicles. The connectivity layer of abundance rests on primitives Lamarr helped originate while her industry filed her in the celebrity column.',
        },
        {
          subtitle: 'The pattern',
          description:
            'Lamarr exemplifies a recurring failure mode of the prestige economy: it mis-files contributors by their most legible identity and discards their other work. The wiki treats the correction of that mis-filing as a legitimate act of historical maintenance, not a sentimental one.',
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
        readingTimeMinutes: 4,
        tags: ['innovator', 'tribute', 'communications'],
        summary:
          'Co-inventor of frequency hopping; ignored by her industry for decades, foundational to modern wireless connectivity.',
      },
    },
  },
];
