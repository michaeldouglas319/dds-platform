/**
 * Forward-looking seed wiki articles.
 *
 * Every entry is a UniversalSection (from @dds/types/section) — the same
 * shape the core renderer consumes. Wiki-specific fields live under
 * `meta.wiki` so the core schema continues to parse unchanged and the data
 * remains plug-compatible with future @dds/renderer plugins.
 *
 * These entries describe horizons the wiki commits to tracking: inflection
 * points, crisp definitions, and concepts that are not yet load-bearing but
 * likely to become so across the Age of Abundance transition.
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
export const futureArticles = [
  {
    id: 'fusion-era',
    type: 'section',
    name: 'fusion-era',
    subject: {
      title: 'Fusion Era',
      subtitle: 'Commercial fusion as the inflection point beyond the solar learning curve.',
      category: 'Future Concept',
      summary:
        'The Fusion Era names the moment when commercial fusion moves from physics milestone to deployable generation, extending [[Energy Abundance]] into domains where solar and storage alone cannot reach.',
    },
    content: {
      body: 'The Fusion Era names the civilizational threshold at which commercial fusion — tokamaks, stellarators, and inertial confinement systems — moves from physics milestone to deployable generation. It does not replace the solar-plus-storage backbone of [[Energy Abundance]]; it extends it into domains where solar cannot reach: firm baseload on polar latitudes, energy-dense industrial heat, and deep-space propulsion. ITER\'s first-plasma program and a cohort of private ventures have reframed the question from "if" to "at what levelized cost."',
      paragraphs: [
        {
          subtitle: 'Three converging architectures',
          description:
            'Tokamaks confine plasma magnetically in a toroidal field; stellarators twist the geometry to stabilize it without a plasma current; inertial confinement compresses fuel pellets with lasers or magnetic pulses. Each approach has a different cost curve and risk profile, and each has crossed engineering milestones in the 2020s that were long considered decades away. The plural architecture is a feature: a single winning design is not required for the Fusion Era to arrive.',
        },
        {
          subtitle: 'Why it matters even if solar is cheaper',
          description:
            'Even at sub-penny solar electricity, some workloads demand characteristics photovoltaics cannot supply: continuous high-temperature heat for cement and steel, compact shipboard power, and off-world generation where sunlight is intermittent or dim. Fusion\'s value is not kWh parity but the workloads it unlocks. Combined with [[Multi-Planetary Civilization]], it becomes the default export of serious off-world industry.',
        },
        {
          subtitle: 'Risks and open questions',
          description:
            'Tritium breeding, materials science under sustained neutron flux, and regulatory frameworks written for fission are the visible engineering risks. The deeper open question is whether fusion arrives early enough to matter for decarbonization, or whether it lands in a grid already saturated with cheap renewables and serves primarily industrial and extraterrestrial niches. The wiki treats both outcomes as compatible with the Age of Abundance thesis.',
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
        tags: ['future', 'energy', 'fusion', 'horizon'],
        summary:
          'Commercial fusion as an inflection point that extends energy abundance into workloads and geographies solar cannot reach.',
      },
    },
  },
  {
    id: 'multi-planetary-civilization',
    type: 'section',
    name: 'multi-planetary-civilization',
    subject: {
      title: 'Multi-Planetary Civilization',
      subtitle: 'Mars settlement, orbital industry, and planetary redundancy as species insurance.',
      category: 'Future Concept',
      summary:
        'The project of establishing self-sustaining human presence beyond Earth — on Mars, in cislunar space, and across orbital industrial platforms — framed as insurance against single-planet risk and as an expansion of the abundance frontier.',
    },
    content: {
      body: 'Multi-Planetary Civilization is the project of establishing self-sustaining human presence beyond Earth. In the contemporary framing, it is neither a romantic frontier nor a vanity program but a straightforward risk-diversification argument: a species confined to a single biosphere is a single-point-of-failure system. SpaceX\'s reusable-launch cost curve has done for orbital access what the photovoltaic Wright curve did for electricity, reopening questions that were dormant for half a century.',
      paragraphs: [
        {
          subtitle: 'Three tiers of off-world presence',
          description:
            'The roadmap has three visible tiers. Orbital industry — microgravity manufacturing, solar-power platforms, in-space assembly — is already commercial. Cislunar infrastructure — the Moon, its poles, and Lagrange points — is the staging ground for deep operations. Mars settlement is the first full-biosphere test of whether humans can build a second home. Each tier compounds the capability of the next.',
        },
        {
          subtitle: 'Why it is an abundance story',
          description:
            'Off-world industry does not merely duplicate Earth; it accesses resources (continuous sunlight, vacuum, low gravity, asteroid metals) that are expensive or impossible here. Paired with the [[Fusion Era]] and [[Autonomous Mobility]], the orbital environment is where some abundance goods — perfect crystals, exotic pharmaceuticals, gigawatt solar arrays — are produced most cheaply. The terrestrial economy imports them rather than duplicates them.',
        },
        {
          subtitle: 'Ethics and open questions',
          description:
            'Planetary protection, the legal status of extraterrestrial property, and the governance of off-world settlements are unresolved. So is the deeper question of who gets to go, and on whose terms. Critics note that species insurance can become species escapism if it excuses neglect of Earth\'s biosphere. The wiki treats terrestrial stewardship and multi-planetary expansion as complementary rather than substitute commitments.',
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
        tags: ['future', 'space', 'mars', 'risk'],
        summary:
          'Establishing self-sustaining human presence beyond Earth as species insurance and as an expansion of the abundance frontier.',
      },
    },
  },
  {
    id: 'brain-machine-interfaces',
    type: 'section',
    name: 'brain-machine-interfaces',
    subject: {
      title: 'Brain-Machine Interfaces',
      subtitle: 'From restoring function to expanding communication bandwidth.',
      category: 'Horizon',
      summary:
        'Direct neural interfaces — invasive and non-invasive — progressing from medical restoration through cognitive augmentation toward a redefinition of human communication bandwidth.',
    },
    content: {
      body: 'Brain-machine interfaces (BMIs) are devices that read from or write to neural tissue with sufficient fidelity to substitute for the body\'s native input-output channels. Neuralink, Synchron, Precision Neuroscience, and a growing cohort of academic labs have moved the field from proof-of-concept to implanted human trials. The short-term value is medical — restoring movement, sight, and speech to people with severe impairment — but the long-term trajectory points at a redefinition of what "communication bandwidth" means.',
      paragraphs: [
        {
          subtitle: 'Three generations of capability',
          description:
            'The first generation restores function: cursor control, limb prosthetics, and speech decoding for people with paralysis or ALS. The second generation augments healthy users: memory prosthetics, mood regulation, and closed-loop therapy for depression or chronic pain. The third generation — speculative but not implausible — compresses the latency between minds and machines, or between minds and minds, to something closer to thought than typing. Each generation crosses a different ethical line.',
        },
        {
          subtitle: 'Bandwidth as the binding constraint',
          description:
            'Human language is a remarkably slow channel: roughly forty bits per second. Most of the economic value of [[Open-Source AGI]] bottlenecks on how quickly humans can state intent and review output. BMIs are one of the few credible routes to widening that channel. If they succeed, the collaboration pattern between humans and models shifts from prompt-and-review to something more like co-cognition, with profound implications for [[Education Abundance]] and software authorship.',
        },
        {
          subtitle: 'Risks and open questions',
          description:
            'The failure modes are severe and unfamiliar: surgical complications, long-term biocompatibility, covert influence on cognition or mood, and the concentration of neural data in private hands. Consent doctrines designed for medical devices do not yet cover cognitive augmentation at scale. Whether BMIs arrive inside frameworks of [[Verifiable Identity]] and strong data rights, or outside them, will shape whether they become an abundance technology or a surveillance one.',
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
        tags: ['future', 'neurotech', 'bmi', 'horizon'],
        summary:
          'Neural interfaces moving from medical restoration through cognitive augmentation to a redefinition of communication bandwidth.',
      },
    },
  },
  {
    id: 'autonomous-mobility',
    type: 'section',
    name: 'autonomous-mobility',
    subject: {
      title: 'Autonomous Mobility',
      subtitle: 'Self-driving fleets, drone corridors, and humanoid labor as a unified transport stack.',
      category: 'Future Concept',
      summary:
        'The convergence of self-driving ground vehicles, low-altitude drone logistics, and humanoid robotics into a single autonomous mobility stack that drives the cost of moving atoms toward the cost of moving bits.',
    },
    content: {
      body: 'Autonomous Mobility is the convergence of three once-separate programs — self-driving ground vehicles, low-altitude drone logistics, and humanoid labor — into a single stack governed by shared perception, planning, and safety primitives. The premise is that moving atoms is about to follow the cost curve that moved bits: as perception models generalize, the marginal cost of a delivery, a commute, or a warehouse pick trends toward the cost of the electricity that powers it.',
      paragraphs: [
        {
          subtitle: 'One stack, three surfaces',
          description:
            'Waymo, Cruise, and Tesla\'s FSD program operate on the ground. Zipline and Wing run drone corridors overhead. Figure, 1X, and Agility Robotics build humanoids that share the same foundation-model perception stack. The shared substrate means that a breakthrough in sensor fusion, simulation, or safety validation propagates across all three surfaces at once. Autonomy is increasingly a single capability with different form factors.',
        },
        {
          subtitle: 'Second-order effects on cities and labor',
          description:
            'Cheap autonomous transport reshapes the geometry of cities: parking becomes land for housing, last-mile logistics becomes continuous rather than batched, and the labor value of a commute falls to whatever the passenger chooses to do with reclaimed hours. Paired with [[Abundance Cities]], it weakens the century-old coupling between where one lives and where one works. The transition cost — to drivers, couriers, and warehouse workers — is real and front-loaded, and is the principal political question.',
        },
        {
          subtitle: 'Risks and open questions',
          description:
            'Edge-case safety, adversarial robustness, and the liability regime for autonomous harm are unresolved. Drone corridors raise noise, privacy, and airspace-sovereignty questions that cities are only beginning to confront. Humanoid labor collides with employment law written for a world where the laborer was a person. The wiki treats these as the live coordination problems of the next decade, not as frictions that "will sort themselves out."',
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
        tags: ['future', 'mobility', 'robotics', 'autonomy'],
        summary:
          'Self-driving fleets, drone corridors, and humanoid robots converge into a single stack that pushes the cost of moving atoms toward the cost of moving bits.',
      },
    },
  },
  {
    id: 'decentralized-energy-grids',
    type: 'section',
    name: 'decentralized-energy-grids',
    subject: {
      title: 'Decentralized Energy Grids',
      subtitle: 'Peer-to-peer electrons, virtual power plants, and the grid as a market.',
      category: 'Future Concept',
      summary:
        'The transformation of the electrical grid from a one-way utility into a peer-to-peer market of prosumers, batteries, EVs, and virtual power plants, operating as the distribution layer of [[Energy Abundance]].',
    },
    content: {
      body: 'Decentralized Energy Grids are the network architecture that lets [[Energy Abundance]] actually reach people. The legacy grid — one-way, centrally dispatched, designed around large thermal plants — is a poor match for a generation fleet made of millions of rooftops, batteries, electric vehicles, and controllable loads. The replacement is a peer-to-peer market in which any device can be a producer, consumer, or both, clearing in near real time.',
      paragraphs: [
        {
          subtitle: 'Virtual power plants as the aggregation layer',
          description:
            'A virtual power plant (VPP) is a software-coordinated fleet of distributed resources — home batteries, smart water heaters, EV chargers, commercial HVAC — that bids into wholesale markets as a single dispatchable asset. Tesla\'s South Australia VPP, Sunrun\'s utility partnerships, and Octopus\'s Kraken platform are early production examples. VPPs turn consumer hardware into grid infrastructure without any new transmission lines.',
        },
        {
          subtitle: 'Peer-to-peer electrons',
          description:
            'Beyond aggregation, an emerging layer of programmable settlement — metering, attestation, and micropayments for kilowatt-hours — allows neighbors to sell surplus solar to each other without routing through a retailer. In jurisdictions that permit it, this collapses the retail margin and surfaces real-time local price signals. The coordination problem is not the electrons; it is the identity, billing, and dispute layer, which connects this article to [[Verifiable Identity]] and [[Coordination Abundance]].',
        },
        {
          subtitle: 'Risks and open questions',
          description:
            'Grid stability under high distributed penetration, the regulatory classification of prosumer-to-prosumer sales, and cyber-physical security of millions of internet-connected assets are the visible risks. The political question is whether incumbent utilities resist, partner with, or are restructured around the new architecture. The transition is technically solved in laboratories; it is unsolved in statute.',
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
        tags: ['future', 'energy', 'grid', 'vpp'],
        summary:
          'The grid becomes a peer-to-peer market of prosumers and virtual power plants, delivering the distribution layer of energy abundance.',
      },
    },
  },
  {
    id: 'longevity-escape-velocity',
    type: 'section',
    name: 'longevity-escape-velocity',
    subject: {
      title: 'Longevity Escape Velocity',
      subtitle: 'The biotech threshold where annual life expectancy gains exceed one year.',
      category: 'Definition',
      summary:
        'Longevity Escape Velocity (LEV) is the threshold at which annual gains in healthy life expectancy exceed one year per year, effectively making biological aging a treatable condition rather than a time limit.',
    },
    content: {
      body: 'Longevity Escape Velocity (LEV) is a technical term coined by the gerontologist Aubrey de Grey and now used more broadly: it names the threshold at which annual gains in healthy life expectancy exceed one year per calendar year. Below that line, each birthday still shortens the expected remainder of life. Above it, remaining lifespan grows faster than it is spent. LEV is not immortality; it is aging becoming a treatable condition rather than a fixed time budget.',
      paragraphs: [
        {
          subtitle: 'The convergence behind the claim',
          description:
            'Three distinct fields are converging on the aging phenotype: senolytics that clear damaged cells, partial cellular reprogramming (Yamanaka factors applied below the reprogramming threshold), and AI-driven target discovery that collapses drug-development timelines. None of the three is the full answer. Their convergence is what makes the LEV hypothesis a horizon to track rather than a curiosity.',
        },
        {
          subtitle: 'Why it belongs in an abundance encyclopedia',
          description:
            'Aging is the rate-limiting disease: cardiovascular disease, most cancers, neurodegeneration, and frailty share it as the underlying driver. Treating aging compresses morbidity and expands the productive window of a life, which is the health analog of [[Energy Abundance]]. Combined with [[Education Abundance]], it makes serial careers and multi-decade learning projects the default rather than the exception.',
        },
        {
          subtitle: 'Risks and open questions',
          description:
            'Distributional capture is the obvious risk: a therapy that adds decades but costs millions per course reinforces existing inequality at a civilizational scale. The deeper open question is whether LEV arrives as a cluster of cheap, compounding interventions (more like statins) or as a high-priced platform (more like CAR-T). The answer will be partly scientific and partly a choice about [[Coordination Abundance]] and public-sector biotech funding.',
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
        tags: ['future', 'definition', 'longevity', 'biotech'],
        summary:
          'The threshold at which annual gains in healthy life expectancy exceed one year per year, making aging a treatable condition.',
      },
    },
  },
  {
    id: 'open-source-agi',
    type: 'section',
    name: 'open-source-agi',
    subject: {
      title: 'Open-Source AGI',
      subtitle: 'Community-governed foundation models with verifiable training.',
      category: 'Future Concept',
      summary:
        'Foundation models at or near general capability whose weights, data, and training process are openly auditable and collectively governed, as an alternative to private concentration of advanced AI.',
    },
    content: {
      body: 'Open-Source AGI describes the horizon in which foundation models at or near general capability are openly auditable in weights, data, and training process, and are governed by some coalition broader than a single firm. It is the AI analog of [[Coordination Abundance]]: the underlying capability is necessary but insufficient; the question is who holds the keys. The trajectory from LLaMA through Mistral, DeepSeek, and subsequent open releases has made the baseline open model more capable than last year\'s frontier closed one.',
      paragraphs: [
        {
          subtitle: 'What "open" has to mean',
          description:
            'Open weights alone are necessary but not sufficient. A credible open-source AGI also requires an open training corpus (or at least an auditable provenance trail), reproducible training recipes, and third-party evaluation. Projects such as EleutherAI\'s Pythia and the LAION and OLMo efforts have pushed toward that stricter standard. The wiki uses "open" in this fuller sense, not the marketing sense.',
        },
        {
          subtitle: 'Governance models',
          description:
            'Open-source AGI requires a governance layer: who decides what the next training run optimizes for, who can fork, and who bears liability when the model is misused. Candidates range from standards-body consortia (analogous to the IETF) to credibly neutral non-profits with supermajority decision rules to on-chain governance experiments. None has yet scaled to the capital requirements of frontier training. This is the coordination frontier of the field.',
        },
        {
          subtitle: 'Risks and open questions',
          description:
            'The core objection — that open weights accelerate misuse — is serious and unresolved. The counter-argument is that closed concentration is also an alignment failure, in which legitimacy and accountability are ceded to a handful of firms. The wiki treats both risks as load-bearing and does not presume either side has already won. The practical test is whether open-source AGI can match frontier capability on a budget the public sector is willing to fund.',
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
        tags: ['future', 'ai', 'agi', 'open-source', 'governance'],
        summary:
          'Foundation models at general capability governed openly, with auditable weights, data, and training — the AI analog of coordination abundance.',
      },
    },
  },
  {
    id: 'abundance-cities',
    type: 'section',
    name: 'abundance-cities',
    subject: {
      title: 'Abundance Cities',
      subtitle: 'Charter cities, network states, and post-zoning urbanism.',
      category: 'Future Concept',
      summary:
        'New urban forms — charter cities, special economic zones, and network states — that treat governance, zoning, and construction as design variables rather than inherited constraints.',
    },
    content: {
      body: 'Abundance Cities are new urban forms built on the premise that governance, zoning, and construction are design variables, not inherited constraints. They span a spectrum: charter cities (Próspera in Honduras, NEOM in Saudi Arabia), special economic zones at the city scale, privately-run innovation districts, and fully dematerialized network states that claim jurisdiction over diaspora communities before they acquire territory. Each experiment tests a different hypothesis about whether cheaper housing, mobility, and energy can be unlocked by rewriting the rules stack.',
      paragraphs: [
        {
          subtitle: 'Three flavors of experiment',
          description:
            'Charter cities negotiate with a host nation for a distinct regulatory regime inside a physical footprint. Special economic zones lower trade and tax barriers without touching urban form. Network states, in Balaji Srinivasan\'s formulation, begin as online communities, acquire capital and territory, and seek recognition only after achieving scale. The three flavors compete as hypotheses about the minimum viable jurisdiction.',
        },
        {
          subtitle: 'Post-zoning urbanism',
          description:
            'More prosaically, the abundance city thesis also applies to existing cities that repeal or radically simplify zoning. Japanese land-use law, Auckland\'s 2016 upzoning, and Minneapolis\' 2019 elimination of single-family-only zoning have produced measurable rent and construction effects. This strand of the thesis is less glamorous than charter cities but has a larger near-term impact. It connects directly to [[Autonomous Mobility]], since the highest-leverage zoning reforms become possible only when parking minimums stop mattering.',
        },
        {
          subtitle: 'Risks and open questions',
          description:
            'The legitimacy problem is acute. A city whose rules are written by its founders rather than its residents can replicate the company town rather than escape it. Human-rights protections, democratic accountability, and exit rights are the load-bearing constraints that distinguish abundance cities from extractive enclaves. The wiki tracks each experiment on those criteria, not on GDP alone.',
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
        tags: ['future', 'cities', 'governance', 'network-state'],
        summary:
          'New urban forms — from charter cities to post-zoning reforms — treating governance and construction as design variables.',
      },
    },
  },
  {
    id: 'carbon-abundance',
    type: 'section',
    name: 'carbon-abundance',
    subject: {
      title: 'Carbon Abundance',
      subtitle: 'Direct air capture at scale and the rise of synthetic fuels.',
      category: 'Future Concept',
      summary:
        'The regime in which atmospheric CO2 becomes a cheap industrial feedstock — captured at scale, converted into synthetic fuels, plastics, and building materials — reframing decarbonization as an abundance problem rather than a restraint problem.',
    },
    content: {
      body: 'Carbon Abundance describes the regime in which atmospheric CO2 stops being a waste stream and becomes a cheap industrial feedstock. It is the subtle thesis that if [[Energy Abundance]] delivers sub-penny electrons, direct air capture (DAC) and electrochemical CO2 conversion become economic by brute force: the capital stack is dominated by electricity cost, and at near-zero power the whole chain tips into the money. Climeworks, Carbon Engineering, and a cohort of electrosynthesis startups are early tests of this claim.',
      paragraphs: [
        {
          subtitle: 'From capture to feedstock',
          description:
            'DAC at scale is only half the story. The other half is what happens to the captured carbon: sequestration in basalt and saline aquifers, conversion into synthetic jet and marine fuels (e-fuels), feedstock for plastics and aggregates, and — at a longer horizon — carbonate building materials that store CO2 in the built environment. Each destination has a different cost curve and a different bottleneck. The integrated system is closer than any single link.',
        },
        {
          subtitle: 'Why framing matters',
          description:
            'Climate policy has historically framed carbon as a restraint problem — emit less. Carbon Abundance reframes it as an abundance problem: build enough clean energy to make DAC cheaper than not-doing-it, and the flow reverses. This is not a license for delayed mitigation; removal is additive to emissions reduction, not a substitute. But it does mean the endgame of climate work is industrial, not purely abstentional, and that reframing changes which projects are fundable.',
        },
        {
          subtitle: 'Risks and open questions',
          description:
            'Moral hazard is the standard objection: cheap removal at some future date is used today to justify current emissions. Verification is the under-discussed objection: permanent storage must be audited over centuries, which implies institutions with century-scale trust horizons — a capacity civilization does not currently have. This is where Carbon Abundance crosses into [[Coordination Abundance]] and [[Verifiable Identity]].',
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
        tags: ['future', 'climate', 'dac', 'carbon'],
        summary:
          'Atmospheric CO2 becomes a cheap industrial feedstock once cheap clean electricity makes direct air capture and carbon conversion economic by default.',
      },
    },
  },
  {
    id: 'water-abundance',
    type: 'section',
    name: 'water-abundance',
    subject: {
      title: 'Water Abundance',
      subtitle: 'Desalination, atmospheric harvesting, and closed-loop agriculture.',
      category: 'Future Concept',
      summary:
        'The delivery of abundant fresh water to every settlement, driven by cheap-electricity desalination, atmospheric water generation, and closed-loop agricultural systems that recycle most of what they consume.',
    },
    content: {
      body: 'Water Abundance is what [[Energy Abundance]] looks like through a hydrological lens. Reverse-osmosis desalination is energy-bound: at historical electricity prices, it is an expensive last resort; at sub-penny kWh, it is cheaper than long-haul pipelines from distant basins. Atmospheric water generators, solar-thermal stills, and closed-loop agriculture add complementary supply paths. The combined effect is that freshwater scarcity becomes a distribution and governance problem rather than a resource problem.',
      paragraphs: [
        {
          subtitle: 'Three supply paths',
          description:
            'Coastal desalination (Israel, Saudi Arabia, coastal California) provides bulk supply where seawater is near. Atmospheric water generation — condensing humidity directly — works at household and village scale in any environment with reasonable humidity, with no permitting or pipeline required. Closed-loop agriculture (vertical farms, recirculating aquaculture, controlled-environment greenhouses) reduces demand by recycling 90%+ of input water. Each path has different cost curves and different failure modes.',
        },
        {
          subtitle: 'Second-order effects',
          description:
            'Abundant fresh water reshapes agriculture, settlement patterns, and geopolitics. Food production becomes location-independent: arbitrary-latitude farming and desert agriculture become ordinary rather than exotic. Watershed disputes that currently drive conflict — the Nile, the Tigris-Euphrates, the Indus — lose their zero-sum character when any downstream country can manufacture equivalent supply. That does not eliminate politics; it changes what politics is about.',
        },
        {
          subtitle: 'Risks and open questions',
          description:
            'Brine disposal from large-scale desalination, the embodied energy of atmospheric generators, and groundwater overdraft that continues regardless of new supply are the technical risks. The governance risk is that water abundance, like every other abundance, is captured by whoever owns the hardware. The coordination question is how to treat large-scale water infrastructure as public utility rather than private toll road.',
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
        tags: ['future', 'water', 'desalination', 'agriculture'],
        summary:
          'Cheap electricity turns desalination, atmospheric generation, and closed-loop agriculture into abundant water supply, reframing scarcity as a distribution problem.',
      },
    },
  },
  {
    id: 'education-abundance',
    type: 'section',
    name: 'education-abundance',
    subject: {
      title: 'Education Abundance',
      subtitle: 'AI tutors, credentialed mastery, and lifelong access.',
      category: 'Future Concept',
      summary:
        'The regime in which every learner has continuous access to an expert tutor, mastery is verified directly rather than signaled by institution, and education becomes a lifelong service rather than a bounded stage of life.',
    },
    content: {
      body: 'Education Abundance is the regime in which every learner on Earth has continuous access to a patient, expert, responsive tutor; in which mastery is verified directly rather than signaled by the institution attended; and in which formal education ceases to be a bounded stage of life and becomes a lifelong service. The combination of foundation-model tutors, open credentials, and cheap [[Autonomous Mobility]] collapses the geographic and cost moats that have defined education for a century.',
      paragraphs: [
        {
          subtitle: 'The Bloom problem, revisited',
          description:
            'Benjamin Bloom\'s 1984 "two-sigma problem" observed that one-on-one tutoring raised average student performance by roughly two standard deviations over group instruction, but no society could afford to provide it. AI tutors are the first plausible answer. Early studies on GPT-class tutors in Khan Academy\'s Khanmigo and in Nigerian edtech trials show effect sizes consistent with the Bloom result at marginal cost approaching zero. The scale is newly achievable; the quality tail remains the question.',
        },
        {
          subtitle: 'Credentialed mastery',
          description:
            'If the tutor is free, the choke point becomes credentialing: how does a prospective employer, collaborator, or citizen verify mastery? Open credentials (verifiable, portable, cryptographically signed) and direct assessment — demonstrate the skill, get the badge — break the bundling of teaching, testing, and signaling that universities have held for a thousand years. This is where [[Education Abundance]] intersects [[Verifiable Identity]] in a load-bearing way.',
        },
        {
          subtitle: 'Risks and open questions',
          description:
            'The obvious risk is that AI tutors fossilize existing curricula rather than expand them, and that unbundled credentials become dominated by a few private platforms. The less-obvious risk is that the socializing functions of school — friendship, citizenship, the shared civic frame — do not survive their decoupling from instruction. The wiki treats the social function as a peer problem to be designed for, not a legacy to be shed.',
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
        tags: ['future', 'education', 'ai-tutor', 'credentials'],
        summary:
          'Continuous AI tutoring, directly-verified mastery, and lifelong access redefine education as a service rather than a bounded stage of life.',
      },
    },
  },
  {
    id: 'verifiable-identity',
    type: 'section',
    name: 'verifiable-identity',
    subject: {
      title: 'Verifiable Identity',
      subtitle: 'Proof of personhood and anti-sybil protocols without surveillance.',
      category: 'Definition',
      summary:
        'A class of cryptographic protocols that prove a digital actor is a unique human without exposing who they are, enabling one-person-one-vote, sybil-resistant coordination, and humane AI interfaces at scale.',
    },
    content: {
      body: 'Verifiable Identity names the class of cryptographic protocols that prove a digital actor is a unique human being — or a specific human, when authorized — without exposing who they are, where they live, or what else they do online. The canonical use case is anti-sybil defense: one person, one vote, one grant, one claim, in systems that cannot rely on legal identity or platform accounts. Worldcoin, BrightID, Gitcoin Passport, and a growing family of zero-knowledge personhood proofs are early experiments.',
      paragraphs: [
        {
          subtitle: 'Why it is the hinge primitive',
          description:
            'Most abundance-era coordination fails without sybil resistance. [[Open-Source AGI]] governance, universal basic services, participatory budgeting, decentralized energy markets, and credentialed mastery all presume that the counted actor is a unique person. Legacy identity systems — state IDs, social-network accounts — trade privacy for uniqueness, and they fail silently for stateless, minor, or marginalized users. Verifiable Identity is the primitive that lets uniqueness and privacy co-exist.',
        },
        {
          subtitle: 'Three design families',
          description:
            'Biometric approaches (iris, palm, voiceprint) enroll uniqueness at the sensor. Social-graph approaches (BrightID, Proof-of-Humanity) infer uniqueness from verified human attestations. Cryptographic government-ID approaches (zero-knowledge proofs over passports) reuse state identity without revealing it. Each family has a distinct failure mode — coercion, collusion, and issuer capture, respectively — and hybrid stacks that combine two or more families are emerging as the practical answer.',
        },
        {
          subtitle: 'Risks and open questions',
          description:
            'Biometric collection raises surveillance concerns even when the data is discarded locally. Social graphs inherit the exclusions of existing networks. Government-anchored systems reintroduce state dependency in a layer designed to escape it. The coordination question is not which family wins but whether standards, interop, and credibly neutral governance emerge before any single issuer becomes a chokepoint. The wiki treats Verifiable Identity as the load-bearing plumbing of [[Coordination Abundance]] and returns to it often.',
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
        tags: ['future', 'definition', 'identity', 'privacy', 'sybil'],
        summary:
          'Cryptographic proof-of-personhood protocols that combine uniqueness with privacy, enabling sybil-resistant coordination without surveillance.',
      },
    },
  },
];
