/**
 * Seed wiki article dataset — Conflict Economics batch.
 *
 * Every entry is a UniversalSection (from @dds/types/section) — the same
 * shape the core renderer consumes. Wiki-specific fields live under
 * `meta.wiki` so the core schema continues to parse unchanged and the data
 * remains plug-compatible with future @dds/renderer plugins.
 *
 * This batch covers the economic foundations of war and peace examined
 * through the abundance lens: resource-driven conflict, the peace dividend,
 * guns-vs-butter tradeoffs, rare earth geopolitics, energy wars, the
 * military-industrial complex, the broken window fallacy, and the
 * Kardashev-scale framing of civilizational violence.
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
export const conflictEconomicsArticles = [
  {
    id: 'resource-scarcity-and-war',
    type: 'section',
    name: 'resource-scarcity-and-war',
    subject: {
      title: 'Resource Scarcity and War',
      subtitle: 'The historical thread from grain and oil to rare earths and fresh water.',
      category: 'History',
      summary:
        'A survey of the pattern in which competition over finite material inputs — grain, oil, water, minerals — has repeatedly escalated into interstate conflict, and why abundance reframes rather than abolishes the question.',
    },
    content: {
      body: 'Much of recorded interstate conflict can be read as a dispute over who controls, extracts, or transports a scarce material input. Grain-producing hinterlands, silver mines, spice routes, coal seams, oil fields, freshwater rivers, and — in the present century — lithium, cobalt, and gallium each appear as recurring casus belli. The [[Age of Abundance]] thesis does not deny this pattern; it asks what remains of the pattern when the underlying inputs stop being scarce.',
      paragraphs: [
        {
          subtitle: 'The Malthusian-geopolitical synthesis',
          description:
            'Classical political economy, from Malthus forward, treated population pressure against fixed resources as a structural driver of famine and war. Twentieth-century geopolitics — Mackinder, Spykman, the Carter Doctrine on Gulf oil — formalized this into doctrines of territorial control over chokepoints and extraction zones. The common logic: when a critical input is inelastic in supply and unevenly distributed, whoever commands it commands everyone downstream.',
        },
        {
          subtitle: 'Water, grain, and the 21st-century pattern',
          description:
            'Contemporary analysts point to Nile Basin disputes, Tigris–Euphrates damming, South China Sea fisheries, and grain export controls during the 2022 Black Sea crisis as evidence the pattern is not historical. Roughly a third of the global population lives in transboundary river basins with unresolved allocation regimes. These are the proximate scarcities most likely to drive [[Contemporary Conflicts]] in the coming decades.',
        },
        {
          subtitle: 'How abundance reframes the question',
          description:
            'Near-zero-marginal-cost energy changes the scarcity calculus for water (via desalination), food (via indoor and precision agriculture), and many minerals (via recycling and substitution driven by [[Atoms Abundance]]). The reframing is not that conflict disappears but that the material rationale for territorial conquest weakens. See [[Peace Dividend]] for the positive case and [[Kardashev and Conflict]] for the empirical skepticism.',
        },
        {
          subtitle: 'Open questions',
          description:
            'Does abundance dissolve resource conflict or merely relocate it — from oil to the rare earths that build the post-oil economy, from land to data, from water to compute? The honest answer is that the evidence is partial and the transition period may be the most dangerous. Scarcity-driven war is a tendency, not a law; abundance weakens the tendency without guaranteeing peace.',
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
        tags: ['conflict', 'economics', 'history', 'resources', 'geopolitics'],
        summary:
          'A survey of how competition over scarce material inputs has driven interstate conflict, and how abundance reframes the underlying logic.',
      },
    },
  },
  {
    id: 'peace-dividend',
    type: 'section',
    name: 'peace-dividend',
    subject: {
      title: 'Peace Dividend',
      subtitle: 'When the material rationale for conquest weakens, what happens to the war budget?',
      category: 'Concept',
      summary:
        'The economic argument that abundance — especially energy abundance — reduces the returns to territorial conquest and frees resources for civilian use, together with the serious critiques of that view.',
    },
    content: {
      body: 'The "peace dividend" originally named the post-Cold-War reallocation of military spending to civilian ends. In abundance-era usage, the term has broadened to describe the structural case that cheap, distributed access to energy, food, water, and compute lowers the expected returns to territorial conquest — and therefore, on the margin, the incentive to wage it. The claim is contested and the evidence is mixed.',
      paragraphs: [
        {
          subtitle: 'The mechanism',
          description:
            'Conquest pays when the conquered territory holds inputs the conqueror cannot cheaply obtain elsewhere. [[Energy Abundance]] erodes this logic for hydrocarbons; desalination erodes it for fresh water; synthetic biology and recycling erode it for many materials. When the same kilowatt-hour can be produced on one\'s own rooftop as in a contested basin, the expected value of seizing the basin falls. See also [[Deterrence by Abundance]] for the strategic extension of the argument.',
        },
        {
          subtitle: 'Evidence and counter-evidence',
          description:
            'Proponents cite the correlation between rising per-capita energy access and declining interstate war frequency over the twentieth century, and the fact that post-1990 conflicts have trended toward civil and hybrid forms rather than classic resource grabs. Critics note that the same period saw massive arms buildups, new categories of conflict (cyber, proxy, informational), and that correlation is not causation — wealth and institutional quality are confounded with abundance.',
        },
        {
          subtitle: 'Critiques',
          description:
            'Three critiques deserve serious weight. First, abundance can enable new forms of conflict: cheap drones, cheap compute for disinformation, and cheap bioengineering lower the cost of offense as well as defense (see [[Drone Warfare]] and [[Military Innovation Crossovers]]). Second, status, ideology, and identity drive wars that pure material accounting cannot explain. Third, the transition itself concentrates control of new chokepoints — see [[Rare Earth Geopolitics]] — and the transition period may be more dangerous than either the scarcity or the abundance steady state.',
        },
        {
          subtitle: 'Relation to positive peace',
          description:
            'The peace dividend as defined here is largely a negative-peace argument: it reduces the incentive for war without addressing the institutions that sustain cooperation. The complement is [[Positive Peace]] — the governance, [[Coordination Abundance|coordination]], and [[Distributional Justice in Abundance|distributional]] infrastructure that turns reduced incentive into durable settlement. Neither half is sufficient alone.',
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
        tags: ['conflict', 'economics', 'peace', 'theory', 'energy'],
        summary:
          'The economic argument that abundance weakens the material rationale for conquest, together with the structural critiques of that view.',
      },
    },
  },
  {
    id: 'guns-vs-butter',
    type: 'section',
    name: 'guns-vs-butter',
    subject: {
      title: 'Guns vs Butter',
      subtitle: 'The classic tradeoff and what happens when the marginal costs of both collapse.',
      category: 'Theory',
      summary:
        'The introductory-economics production-possibilities frontier between military and civilian goods, reframed for a world in which the marginal costs of producing both are approaching zero.',
    },
    content: {
      body: 'The guns-versus-butter tradeoff is the canonical teaching example of the production-possibilities frontier: a society with finite labor, capital, and materials must choose between military output ("guns") and civilian output ("butter"). Every marginal tank is a marginal tractor foregone. The framework has organized thinking about war economies since at least the First World War. The [[Age of Abundance]] challenges not the logic but its input assumptions.',
      paragraphs: [
        {
          subtitle: 'The classical frame',
          description:
            'In the classical statement, the frontier is concave — increasing specialization in either guns or butter costs progressively more of the other — and a nation at war pushes its allocation toward guns, accepting reduced civilian consumption. Wartime rationing, civilian conscription of industry, and "home front" mobilization are empirical expressions of movement along the frontier. The Cold War debate over defense budgets was, in its textbook form, a dispute about where on the frontier to sit.',
        },
        {
          subtitle: 'What collapses when marginal costs collapse',
          description:
            'When the marginal cost of energy approaches zero, and the marginal cost of automated production — including both civilian goods and, critically, autonomous weapons — approaches zero with it, the frontier does not vanish but it shifts and flattens. The binding constraint is no longer raw productive capacity; it is attention, governance, rare inputs, and legitimacy. See [[Post-Scarcity Economics]] for the broader treatment.',
        },
        {
          subtitle: 'Post-scarcity reframing',
          description:
            'In an abundance-era reframing, the relevant tradeoff is no longer "guns or butter" but "guns or attention" — civilian abundance is so cheap that it barely competes with military production, but the political and cognitive bandwidth consumed by a mobilization economy does. The risk flips: the danger is not that war starves civilians of goods but that abundant, cheap autonomous weapons proliferate faster than the [[Governance Protocols]] that could constrain them.',
        },
        {
          subtitle: 'Open questions',
          description:
            'Does cheap production make militarization more or less likely? The pessimistic read is that when guns are nearly free, marginal restraint erodes. The optimistic read is that butter is so abundant that the political coalition for war starves of grievance. The historical record does not yet adjudicate; the current decade is, in effect, the experiment.',
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
        tags: ['conflict', 'economics', 'theory', 'tradeoffs'],
        summary:
          'The classic production-possibilities tradeoff between military and civilian goods, reframed for a near-zero-marginal-cost economy.',
      },
    },
  },
  {
    id: 'rare-earth-geopolitics',
    type: 'section',
    name: 'rare-earth-geopolitics',
    subject: {
      title: 'Rare Earth Geopolitics',
      subtitle: 'Lithium, cobalt, neodymium, gallium — the supply chains that replace oil as conflict surfaces.',
      category: 'History',
      summary:
        'How the transition to an electrified, digitized economy has concentrated strategic risk in a small set of minerals and processing chokepoints, and how atoms abundance could defuse or merely displace that risk.',
    },
    content: {
      body: 'The electrification of energy, transport, and compute depends on a short list of minerals whose extraction and — more critically — processing are geographically concentrated. Lithium and cobalt for batteries, neodymium and dysprosium for permanent magnets, gallium and germanium for semiconductors, and a wider basket of platinum-group metals for catalysis now occupy the strategic position oil held in the twentieth century. Whether this constitutes a new scarcity regime or a transitional one is the central question.',
      paragraphs: [
        {
          subtitle: 'The concentration problem',
          description:
            'Roughly two-thirds of cobalt is mined in the Democratic Republic of the Congo, and a comparable share of rare-earth processing capacity sits in a single country. Lithium extraction is concentrated across a handful of salt flats and hard-rock deposits. Gallium and germanium, byproducts of bauxite and zinc refining, are similarly narrow. Export controls, stockpiling, and "friend-shoring" initiatives in the early 2020s are direct responses to this concentration.',
        },
        {
          subtitle: 'Supply chains as conflict surfaces',
          description:
            'In the oil century, pipeline routes, tanker chokepoints, and refinery locations were sites of deterrence, sanction, and occasional war. The analogous surfaces in the mineral century are mines, refineries, magnet factories, and semiconductor fabs. Many of these are located in or depend on politically fragile regions; several are co-located with active [[Contemporary Conflicts]]. The strategic calculus is not new, but its geography is.',
        },
        {
          subtitle: 'How atoms abundance could defuse it',
          description:
            'Three trajectories matter. First, substitution — iron-air, sodium-ion, and solid-state chemistries reduce cobalt and lithium intensity per unit storage. Second, recycling — urban mining of retired batteries and electronics closes the loop as installed base grows. Third, alternative processing — non-Chinese rare-earth separation capacity is expanding, and direct-reduction routes could cut the chokepoints. If [[Atoms Abundance]] delivers, the current minerals regime looks transitional rather than structural.',
        },
        {
          subtitle: 'Or merely displace it',
          description:
            'The pessimistic reading is that each generation of abundance technology births a new chokepoint. Copper for grid expansion, helium and neon for lithography, enriched isotopes for advanced reactors, fab equipment whose manufacture is itself concentrated — the list does not empty. Abundance may reduce the aggregate volume of resource conflict without eliminating any individual case. See [[Resource Scarcity and War]] for the long view.',
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
        tags: ['conflict', 'economics', 'minerals', 'supply-chains', 'geopolitics'],
        summary:
          'The mineral chokepoints of the electrified economy, their role as conflict surfaces, and how atoms abundance could defuse or displace them.',
      },
    },
  },
  {
    id: 'energy-wars',
    type: 'section',
    name: 'energy-wars',
    subject: {
      title: 'Energy Wars',
      subtitle: 'From Gulf tankers to European pipelines — and why distributed solar changes the map.',
      category: 'History',
      summary:
        'A survey of how control over energy resources and transit routes has shaped twentieth- and twenty-first-century conflict, and how distributed solar-plus-storage alters the underlying strategic geography.',
    },
    content: {
      body: 'From the Anglo-Persian concessions of the early twentieth century to the 1973 oil embargo, the 1990–1991 Gulf War, the 2003 Iraq war, and the Russia–Ukraine gas dynamic of the 2020s, control over hydrocarbon production and transit has been a persistent driver of strategic competition. The phrase "energy wars" names a pattern whose specifics vary — occupation, embargo, pipeline sabotage, tanker interdiction — but whose logic is unusually stable: concentrated, transportable energy creates chokepoints, and chokepoints create leverage.',
      paragraphs: [
        {
          subtitle: 'The pipeline century',
          description:
            'Twentieth-century energy geopolitics organized itself around fixed infrastructure — refineries, pipelines, LNG terminals, tanker routes through the Strait of Hormuz and the Bosporus. Whoever owned the infrastructure owned a standing option on coercion. The Russia–Europe gas relationship through the 2000s and 2010s was the clearest modern case: Nord Stream, Yamal, and Ukrainian transit lines were simultaneously commercial assets and strategic weapons, and their weaponization in 2022 accelerated European decarbonization faster than any climate policy had.',
        },
        {
          subtitle: 'How distributed solar-plus-storage changes the map',
          description:
            'A rooftop or field of photovoltaic panels paired with batteries has no pipeline, no strait, and no foreign operator. Its "fuel" arrives from the sun at no marginal cost and is not interdictable by any navy. As installed capacity scales, the strategic premium on controlling hydrocarbon territory falls, and the strategic premium on controlling panel and battery manufacturing rises (see [[Rare Earth Geopolitics]]). The chokepoint does not disappear; it moves from geology to industrial capacity, which is in principle reproducible in ways an oil field is not.',
        },
        {
          subtitle: 'The Ukraine inflection',
          description:
            'The war in Ukraine — see [[Contemporary Conflicts]] and [[Starlink in Ukraine]] — functioned as a natural experiment in energy coercion. Europe\'s ability to survive the 2022–2023 winter with reduced Russian gas, through a combination of LNG imports, efficiency, mild weather, and accelerated renewables deployment, suggested that the coercive value of pipeline gas is time-limited once substitutes exist. It did not suggest that energy coercion itself is finished.',
        },
        {
          subtitle: 'Open questions',
          description:
            'Does distributed energy eliminate energy wars, or merely shorten their duration and shift their form? The honest answer is that a fully decarbonized grid has never been tested under great-power conflict. Grid interdependence, undersea cables, and critical-infrastructure cyber vulnerabilities may reconstitute the chokepoint logic in new form. [[Energy Abundance]] is a necessary but not sufficient condition for the end of energy wars.',
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
        tags: ['conflict', 'economics', 'energy', 'history', 'geopolitics'],
        summary:
          'How control of energy production and transit has shaped conflict, and how distributed solar-plus-storage alters the strategic map.',
      },
    },
  },
  {
    id: 'military-industrial-complex',
    type: 'section',
    name: 'military-industrial-complex',
    subject: {
      title: 'Military-Industrial Complex',
      subtitle: 'Eisenhower\'s warning and how abundance-era production reshapes procurement lock-in.',
      category: 'Doctrine',
      summary:
        'The institutional alignment between standing military establishments, defense contractors, and legislative constituencies, and how abundance-era production — drones, autonomy, software — is reshaping the incentive structure that sustains it.',
    },
    content: {
      body: 'In his 1961 farewell address, President Dwight Eisenhower warned of the "unwarranted influence" of a permanent armaments industry aligned with a permanent military establishment — a configuration he named the military-industrial complex. The warning was that wartime procurement habits, once institutionalized, would persist in peacetime and distort both foreign policy and domestic priorities. Six decades later the concept remains a central reference point in debates over defense spending, weapons exports, and the political economy of conflict.',
      paragraphs: [
        {
          subtitle: 'The lock-in mechanism',
          description:
            'The persistence of the complex rests on three mutually reinforcing channels: (1) long procurement cycles that create multi-decade production runs and associated employment bases; (2) geographic distribution of subcontracting across legislative districts, which aligns legislator incentives with program continuation; and (3) the revolving door between procurement officers, senior military leadership, and industry. Any single channel is reformable; the three together are structurally stable.',
        },
        {
          subtitle: 'What abundance-era production changes',
          description:
            'The production economics of drones, autonomous systems, and software-defined weapons differ sharply from those of heavy platforms. Development cycles are shorter, unit costs are lower, and the relevant supply chain is commercial electronics and commodity software rather than bespoke aerospace manufacturing. Ukraine\'s drone ecosystem (see [[Drone Warfare]]) demonstrates that a small, distributed industrial base can produce militarily decisive quantities on timescales incompatible with traditional procurement. This is partly disruptive to the incumbent complex and partly absorbed by it — legacy primes are buying drone startups.',
        },
        {
          subtitle: 'Crossovers and reshoring',
          description:
            'Much abundance-era production is dual-use by construction: the same fabs, the same ML infrastructure, the same autonomy stacks serve civilian and military demand. This is a return to the mid-twentieth-century pattern in which civilian and military manufacturing were deeply entangled, and it has implications for both defense procurement and civilian [[Post-War Reconstruction]]. See [[Military Innovation Crossovers]] for the broader pattern.',
        },
        {
          subtitle: 'Critiques',
          description:
            'Defenders of current structures argue that the complex has delivered a long peace among great powers and that reform proposals underestimate the value of redundancy and long production runs. Critics argue that it has distorted foreign policy toward intervention, captured scientific talent, and resisted every serious attempt at post-conflict drawdown. A fair reading is that the institution is neither monolith nor bogeyman; it is a durable equilibrium that abundance-era production is nudging, not dissolving.',
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
        tags: ['conflict', 'economics', 'doctrine', 'procurement', 'institutions'],
        summary:
          'Eisenhower\'s warning and the institutional lock-in of wartime procurement, reshaped but not dissolved by abundance-era production.',
      },
    },
  },
  {
    id: 'broken-window-fallacy',
    type: 'section',
    name: 'broken-window-fallacy',
    subject: {
      title: 'Broken Window Fallacy',
      subtitle: 'Why war is not economic stimulus, and why the abundance-era opportunity cost is larger than ever.',
      category: 'Theory',
      summary:
        'Frédéric Bastiat\'s parable of the broken window, its application to the recurring claim that war and destruction are economically stimulative, and why the opportunity cost of that claim is especially severe in an abundance economy.',
    },
    content: {
      body: 'In his 1850 essay "That Which Is Seen, and That Which Is Not Seen," the French economist Frédéric Bastiat told the parable of a shopkeeper whose son breaks a window. A bystander consoles the shopkeeper by arguing that the glazier will now have work, which benefits the economy. Bastiat\'s rejoinder — that the shopkeeper would have spent the same money on something else, and that society is now poorer by one window — is the canonical statement of the opportunity-cost critique of destruction-as-stimulus. The parable has remained relevant because the argument it refutes has remained popular.',
      paragraphs: [
        {
          subtitle: 'The recurring claim',
          description:
            'Across the twentieth and twenty-first centuries, commentators have periodically argued that major wars "ended the Great Depression," that reconstruction "boosts GDP," or that defense spending is a superior form of stimulus. The measurements cited — increased industrial output, reduced unemployment, accelerated technological development — are real. What they leave out is the counterfactual: the civilian capital, human lives, and accumulated infrastructure that the same inputs could have produced instead. GDP is a flow measure that does not debit destruction.',
        },
        {
          subtitle: 'What the data actually shows',
          description:
            'Careful economic histories of wartime mobilization generally find that aggregate productive capacity does rise during mobilization, but that per-capita welfare falls, consumption is rationed, and postwar recovery consumes years of accumulated savings. The "stimulus" effect is better read as an emergency exit from coordination failure — if a society is stuck below its production frontier, any sufficiently large shock can restart it — not as evidence that destruction itself creates wealth. [[Post-War Reconstruction]] treats the recovery side explicitly.',
        },
        {
          subtitle: 'The abundance-era opportunity cost',
          description:
            'Bastiat\'s argument becomes sharper as productive capacity grows. In a subsistence economy, the glazier\'s work at least ensures someone is fed; in an abundance economy, the foregone alternatives — the clinic not built, the model not trained, the habitat not restored — represent welfare gains orders of magnitude above what the repair recaptures. The more capable a civilization becomes, the larger the gap between the seen (repair) and the unseen (the abundance it displaced). See [[Post-Scarcity Economics]].',
        },
        {
          subtitle: 'Open questions',
          description:
            'Are there cases in which destruction is net-productive through the forced replacement of obsolete capital — a "creative destruction" reading? Some economists argue that wartime urgency accelerated technologies (radar, jet engines, antibiotics, nuclear power, the early internet) that peacetime markets would have reached more slowly. The honest response is that acceleration under duress is not free — it comes at enormous human cost — and that deliberate abundance-era investment could in principle achieve the same acceleration without the destruction.',
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
        tags: ['conflict', 'economics', 'theory', 'opportunity-cost', 'fallacy'],
        summary:
          'Bastiat\'s parable of the broken window applied to war-as-stimulus, and why abundance makes the opportunity cost of destruction larger than ever.',
      },
    },
  },
  {
    id: 'kardashev-and-conflict',
    type: 'section',
    name: 'kardashev-and-conflict',
    subject: {
      title: 'Kardashev and Conflict',
      subtitle: 'Does climbing the energy ladder correlate with leaving violence behind?',
      category: 'Theory',
      summary:
        'An examination of whether civilizational energy tiers — Nikolai Kardashev\'s scale — correlate with declines in interpersonal and interstate violence, together with Pinker\'s "Better Angels" thesis and its most serious counterarguments.',
    },
    content: {
      body: 'Nikolai Kardashev proposed in 1964 that civilizations could be classified by the energy they harness: Type I commands the full energy budget of its home planet, Type II that of its star, Type III that of its galaxy. Humanity currently sits below Type I — by common estimate around 0.73 on a logarithmic scale. A speculative but recurring question is whether climbing this ladder correlates with reductions in violence, and if so, why.',
      paragraphs: [
        {
          subtitle: 'The empirical "long peace" observation',
          description:
            'Steven Pinker\'s "Better Angels of Our Nature" (2011) argued that by multiple measures — interstate war deaths per capita, homicide rates, judicial torture, capital punishment — violence has declined over centuries and, especially, over the post-1945 era. The argument explicitly links this decline to rising per-capita energy, institutional development, commerce, and what Pinker calls the "expanding circle" of moral concern. The Kardashev framing adds a structural reason: societies with abundant energy have less reason to fight over it.',
        },
        {
          subtitle: 'The Kardashev-specific claim',
          description:
            'If the material incentive for war is largely about capturing scarce, concentrated energy and material resources (see [[Resource Scarcity and War]] and [[Energy Wars]]), then each order-of-magnitude increase in a civilization\'s energy budget should mechanically reduce the relative payoff to conquest. A society that harvests solar energy across its planet\'s surface has little to gain from seizing a neighbor\'s oil fields. Extended further, a Type II civilization operating on stellar-scale energy capture has essentially no local material incentive for conflict at all.',
        },
        {
          subtitle: 'Counterarguments',
          description:
            'Several critiques deserve weight. First, Pinker\'s data has been contested on both measurement grounds (what counts, how normalized) and inference grounds (the post-1945 "long peace" is short relative to historical cycles and partly explained by nuclear deterrence rather than moral progress). Second, status, ideology, and identity-based conflict do not obviously diminish with energy abundance — they may intensify as material grievances recede. Third, abundance enables new categories of harm (autonomous weapons, engineered pathogens, information warfare) whose casualty counts are not yet represented in the historical series. Fourth, the sample size of "civilizations that climbed the Kardashev ladder" is exactly one, in progress, which is not a statistically meaningful dataset.',
        },
        {
          subtitle: 'Open questions',
          description:
            'The Kardashev-conflict hypothesis is probably best read as a structural tendency rather than a law: climbing the ladder weakens one important driver of violence without addressing several others. Whether a Type I civilization would be measurably more peaceful than the current one depends on institutional, cultural, and [[Coordination Abundance|coordination]] variables the scale itself does not capture. See [[Peace Dividend]] for the mechanism, [[Positive Peace]] for the institutional complement, and [[Distributional Justice in Abundance]] for the question of who the abundance reaches.',
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
        tags: ['conflict', 'economics', 'theory', 'kardashev', 'long-peace', 'pinker'],
        summary:
          'Whether civilizational energy tiers correlate with reduced violence, examining Pinker\'s long-peace thesis and its serious counterarguments.',
      },
    },
  },
];
