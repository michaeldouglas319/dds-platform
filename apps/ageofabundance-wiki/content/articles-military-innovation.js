/**
 * Military-innovation seed wiki articles.
 *
 * Batch theme: "swords into plowshares" — technologies born under wartime
 * urgency or state-security budgets that later became civilian abundance
 * drivers. Each entry is a UniversalSection (from @dds/types/section) —
 * the same shape the core renderer consumes. Wiki-specific fields live
 * under `meta.wiki` so the core schema continues to parse unchanged.
 *
 * Editorial stance: the batch is honest about moral complexity. Military
 * origin is acknowledged; civilian benefit is not used to launder cost.
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
export const militaryInnovationArticles = [
  {
    id: 'military-innovation-crossovers',
    type: 'section',
    name: 'military-innovation-crossovers',
    subject: {
      title: 'Military Innovation Crossovers',
      subtitle: 'When wartime urgency becomes civilian abundance.',
      category: 'Crossover',
      summary:
        'A recurring pattern in the run-up to the [[Age of Abundance]]: technologies developed under wartime urgency or state-security budgets later escape their original context and become foundational civilian infrastructure — without erasing the moral cost of their origins.',
    },
    content: {
      body: 'Many of the technologies now treated as load-bearing for the [[Age of Abundance]] began as instruments of war or deterrence. Packet-switched networks, satellite navigation, jet propulsion, nuclear fission, strong cryptography, and long-endurance drones were all funded first by militaries and only later commercialized. The pattern is strong enough to deserve its own entry, but weak enough that it should not be used to justify militarization as an innovation strategy.',
      paragraphs: [
        {
          subtitle: 'The pattern',
          description:
            'Wartime and Cold War procurement produced three unusual conditions that civilian markets rarely supply at once: patient capital on decade-long timescales, tolerance for extremely high failure rates on frontier problems, and a single demanding customer willing to pay for capability rather than price. Under those conditions, technologies that would have been unfundable in a normal commercial regime — early transistors, inertial navigation, nuclear reactors, global data networks — reached the maturity threshold at which diffusion becomes possible. The crossover to abundance happened later, and usually required a separate political decision to declassify, deregulate, or commercialize.',
        },
        {
          subtitle: 'Representative crossovers',
          description:
            'The clearest examples covered in this batch include [[ARPANET to Internet|ARPANET]] becoming the public Internet and foundation of [[Compute Abundance]] and [[Coordination Abundance]]; [[GPS]] becoming the substrate for [[Autonomous Mobility]] and global logistics; civilian fission power descending from the Manhattan Project and shaping the path toward [[Energy Abundance]] and the [[Fusion Era]]; [[Jet Engines]] from WWII powering mass commercial aviation; [[Satellite Communications]] with SIGINT heritage now enabling rural broadband; [[Drone Tech Dual-Use]] moving from strike platforms to agricultural and logistics drones; and [[Cryptography]] from wartime codebreaking enabling [[Verifiable Identity]] and digital trust.',
        },
        {
          subtitle: 'Moral ledger',
          description:
            'The crossover pattern is real but it is not a justification. Each of these technologies was paid for partly in destruction: cities bombed from jet aircraft, populations surveilled by satellite and by the same cryptographic systems that later protected dissidents, reactors whose waste and accidents are still being managed, drones that normalized remote killing. The [[Military-Industrial Complex]] that produced these capabilities also produced arms races, client-state wars, and persistent [[Resource Scarcity and War|resource-scarcity conflicts]]. A serious accounting treats the civilian dividend and the wartime cost as belonging to the same ledger, not separate ones.',
        },
        {
          subtitle: 'Open questions',
          description:
            'Would a well-funded civilian research state — something like a much larger NIH, DARPA-civilian, or publicly chartered research utility — have produced similar breakthroughs without the wartime premium? Evidence is mixed: the civilian Apollo program, the Human Genome Project, and public solar R&D suggest yes; the long gap between theoretical proposals and fielded capability for many of these technologies suggests the military "forcing function" mattered. A more hopeful framing associated with [[Deterrence by Abundance]] argues that, having inherited these capabilities, the post-scarcity project now has an obligation to develop future general-purpose technologies under civilian auspices rather than reenact the cycle.',
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
        tags: ['innovation', 'crossover', 'history', 'overview', 'ethics'],
        summary:
          'The recurring pattern by which wartime-funded technologies escape their origins to become civilian abundance infrastructure — with an honest moral ledger.',
      },
    },
  },
  {
    id: 'arpanet-to-internet',
    type: 'section',
    name: 'arpanet-to-internet',
    subject: {
      title: 'ARPANET to Internet',
      subtitle: 'Packet switching, Cold War origins, and the foundation of coordination abundance.',
      category: 'History',
      summary:
        'ARPANET, funded by the U.S. Defense Department in the late 1960s to explore survivable packet-switched communication, evolved through successive decommissionings and commercializations into the public Internet — now the substrate for [[Compute Abundance]] and [[Coordination Abundance]].',
    },
    content: {
      body: 'ARPANET is the canonical example of the [[Military Innovation Crossovers]] pattern. A small Cold War research project, intended to explore whether distributed computer networks could survive partial destruction, produced protocols and cultural norms that eventually absorbed most of the world\'s civilian communication.',
      paragraphs: [
        {
          subtitle: 'Origins',
          description:
            'ARPANET was commissioned by the U.S. Advanced Research Projects Agency in the late 1960s. Its core technical idea — packet switching, in which messages are broken into small units routed independently — had been proposed earlier by researchers including Paul Baran at RAND and Donald Davies at the UK National Physical Laboratory. The military motivation was continuity of command under nuclear attack; the research motivation was simply better use of scarce mainframe time. Both framings coexisted in the project from the beginning.',
        },
        {
          subtitle: 'From defense network to public Internet',
          description:
            'Through the 1970s and 1980s the TCP/IP protocol family, email, and early file transfer norms spread from ARPANET to a widening ring of universities and research institutions. The National Science Foundation\'s NSFNET backbone in the late 1980s, the formal decommissioning of ARPANET in 1990, and the lifting of commercial-traffic restrictions on the NSF backbone in the mid-1990s completed the transition. The web, built on top of this substrate in the early 1990s, made it legible to a general public.',
        },
        {
          subtitle: 'Abundance implications',
          description:
            'The Internet is now the default coordination layer for almost every other abundance pillar. [[Compute Abundance]] depends on it for model training and inference traffic; [[Coordination Abundance]] depends on it for open protocols, markets, and governance; rural [[Satellite Communications]] are valued precisely because they extend Internet reach. Without the cultural norm of open, permissionless interconnection inherited from the ARPANET research tradition, the current architecture of near-zero-marginal-cost information distribution would be difficult to reconstruct.',
        },
        {
          subtitle: 'Critiques',
          description:
            'The Internet\'s Cold War origin shows up in its weaknesses as well as its strengths. Early protocols assumed a high-trust research community and under-specified authentication, contributing to decades of spam, fraud, and state-level surveillance. The militarized framing also seeded a long ambivalence about whether the network is civilian infrastructure or a national-security asset — an ambivalence visible in every modern debate about [[Verifiable Identity]], content moderation, and cross-border data flows.',
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
        tags: ['innovation', 'crossover', 'history', 'internet', 'networks'],
        summary:
          'A Cold War research network that, through successive commercializations, became the public Internet and the substrate for most other abundance pillars.',
      },
    },
  },
  {
    id: 'gps',
    type: 'section',
    name: 'gps',
    subject: {
      title: 'GPS',
      subtitle: 'From nuclear-submarine navigation to global civilian positioning.',
      category: 'History',
      summary:
        'The Global Positioning System, funded and operated by the U.S. Department of Defense, was opened to civilian use in stages from the 1980s through the early 2000s. It is now a foundational utility for [[Autonomous Mobility]], global logistics, precision agriculture, and time synchronization.',
    },
    content: {
      body: 'GPS is one of the clearest cases in which a military capability, paid for with defense appropriations and justified by nuclear-deterrence requirements, was deliberately released into civilian use — and turned out to be economically transformative on a scale few of its architects anticipated.',
      paragraphs: [
        {
          subtitle: 'Origins in deterrence',
          description:
            'The lineage runs from early satellite navigation systems such as Transit, which provided positioning for U.S. ballistic-missile submarines, to the modern GPS constellation declared fully operational in the mid-1990s. Its original mission was precise targeting and secure navigation for strategic forces. A coarser civilian signal was made available relatively early, and an intentional accuracy-degradation feature known as Selective Availability was switched off in 2000, sharply increasing the usefulness of civilian receivers.',
        },
        {
          subtitle: 'Civilian diffusion',
          description:
            'Once high-accuracy signals were broadly available, GPS was absorbed into consumer electronics, logistics, aviation, shipping, surveying, and precision agriculture. Combined with cheap smartphones and mobile data, it became invisible infrastructure: most users today do not notice GPS until it fails. In the contemporary abundance stack it underwrites [[Autonomous Mobility]], drone navigation for [[Drone Tech Dual-Use]] civilian applications, and much of the time synchronization that financial and telecommunications networks depend on.',
        },
        {
          subtitle: 'Geopolitics of a public good',
          description:
            'GPS remains a U.S. military system operated as a global public good, which is an unusual arrangement. Competing constellations — GLONASS, Galileo, BeiDou, and regional systems — emerged partly because other states were uncomfortable relying on a single national operator. The result is a plural, partially redundant positioning commons that is more resilient than any single provider but also more politically contested.',
        },
        {
          subtitle: 'Open questions',
          description:
            'GPS jamming and spoofing incidents have become routine in contested regions, reminding users that the civilian dividend depends on continued military restraint. Debates continue about whether precision timing and positioning should eventually be re-architected as a civilian utility with independent governance, or whether the current military-operated arrangement is durable enough. Either way, the pattern of a defense program subsidizing a near-universal civilian capability is unlikely to be repeated in exactly the same form.',
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
        tags: ['innovation', 'crossover', 'history', 'gps', 'navigation', 'logistics'],
        summary:
          'A U.S. military satellite-navigation system, released to civilian use in stages, that became a foundational utility for mobility, logistics, and time.',
      },
    },
  },
  {
    id: 'nuclear-power-from-weapons-programs',
    type: 'section',
    name: 'nuclear-power-from-weapons-programs',
    subject: {
      title: 'Nuclear Power from Weapons Programs',
      subtitle: 'Civilian reactors as a partial inheritance of the Manhattan Project.',
      category: 'History',
      summary:
        'Civilian nuclear power grew directly out of wartime fission research, and much of its engineering, institutional culture, and public controversy traces to that origin. The relationship to [[Energy Abundance]] and the [[Fusion Era]] is real but complicated.',
    },
    content: {
      body: 'No major abundance technology sits more uncomfortably on the civilian/military boundary than nuclear fission. The same physics that enabled the first weapons enabled the first reactors, and the institutions, supply chains, and anxieties of the two applications have been entangled ever since.',
      paragraphs: [
        {
          subtitle: 'From weapons program to reactors',
          description:
            'The Manhattan Project\'s industrial base — enrichment plants, plutonium production reactors, and a large trained workforce — was repurposed after the war into both a nuclear-weapons complex and a civilian reactor program. Many early civilian reactor designs descended from naval-propulsion reactors developed for submarines. The institutional choice to industrialize pressurized-water reactors first, rather than alternative designs that might have had different safety or waste profiles, was shaped heavily by this military lineage.',
        },
        {
          subtitle: 'The abundance case',
          description:
            'Fission remains one of the few proven, scalable, low-carbon sources of firm electrical power. In scenarios where solar, wind, and storage are insufficient on their own — for example, high-latitude grids, heavy industry, and certain kinds of heat applications — expanded civilian fission is part of most credible paths to [[Energy Abundance]]. The [[Fusion Era]], if it arrives, inherits much of the regulatory, workforce, and public-trust infrastructure built up around fission, for better and worse.',
        },
        {
          subtitle: 'Costs honestly stated',
          description:
            'The civilian dividend is not free. Fission produced long-lived waste whose disposal is still politically unresolved in most jurisdictions. Major accidents — Three Mile Island, Chernobyl, Fukushima — imposed real human, ecological, and economic costs. Proliferation risk, in which civilian fuel cycles contribute to weapons capability, is built into the technology rather than incidental to it. An honest abundance account treats these as design constraints rather than footnotes.',
        },
        {
          subtitle: 'Open questions',
          description:
            'Would a purely civilian path to fission — one that prioritized walk-away-safe designs, closed fuel cycles, or thorium from the beginning — have produced a different and more trusted industry? The historical record does not settle the question. Looking forward, the key issues are whether small modular reactors and advanced fission concepts can be licensed and built at a cadence that matters for climate timelines, and whether the [[Fusion Era]] will be governed under a more civilian frame than its predecessor was.',
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
        tags: ['innovation', 'crossover', 'history', 'energy', 'nuclear', 'ethics'],
        summary:
          'Civilian nuclear power as a partial inheritance of wartime fission research — with real abundance potential and real costs that must be accounted together.',
      },
    },
  },
  {
    id: 'jet-engines',
    type: 'section',
    name: 'jet-engines',
    subject: {
      title: 'Jet Engines',
      subtitle: 'Wartime propulsion research and the democratization of long-distance travel.',
      category: 'History',
      summary:
        'Turbojet engines, developed under wartime urgency in Britain and Germany in the late 1930s and 1940s, became the basis of commercial jet aviation and, within a few decades, near-universal access to long-distance mobility for a large share of the global middle class.',
    },
    content: {
      body: 'The jet engine is a textbook case of wartime research producing a civilian transformation that arguably exceeded its military significance. Commercial aviation reshaped trade, migration, tourism, and family life in ways that continue to ripple through the abundance transition.',
      paragraphs: [
        {
          subtitle: 'Origins',
          description:
            'Practical turbojets were developed in parallel in the United Kingdom, under Frank Whittle, and in Germany, under Hans von Ohain, in the late 1930s. World War II provided both the funding and the tolerance for expensive failure that propelled the technology from laboratory to fielded aircraft. Postwar, Allied and Soviet programs rapidly adapted wartime research into increasingly reliable civilian engines, helped by the transfer of personnel and knowledge across institutions.',
        },
        {
          subtitle: 'Commercial aviation',
          description:
            'By the late 1950s and 1960s, commercial jet airliners such as the de Havilland Comet and Boeing 707 had begun replacing piston aircraft on long routes. Subsequent generations of engines dramatically improved fuel efficiency, reliability, and noise. Combined with deregulation in several major markets, this produced an order-of-magnitude expansion in accessible air travel over the following decades — a shift that would have been difficult to justify on purely military grounds.',
        },
        {
          subtitle: 'Abundance implications',
          description:
            'Cheap aviation is an ambiguous member of the abundance stack. On one hand, it collapsed distance as a constraint on family, work, and culture — a genuine form of mobility abundance. On the other, it is carbon-intensive, and decarbonizing aviation (through sustainable fuels, efficiency gains, or eventual electrification of short-haul) remains one of the harder problems in the [[Energy Abundance]] transition. Future abundance is likely to include more and cleaner aviation, not less.',
        },
        {
          subtitle: 'Open questions',
          description:
            'The jet engine case raises a recurring question about innovation policy: how often does a military program accidentally incubate a technology whose civilian value far exceeds its military value? If the answer is "often," that is an argument for more aggressive civilian counterparts to military R&D rather than a justification for military budgets. The climate cost of mass aviation also sharpens debates about whether some abundance technologies should be deliberately slowed while cleaner substitutes mature.',
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
        tags: ['innovation', 'crossover', 'history', 'aviation', 'mobility'],
        summary:
          'Wartime turbojet research that became the engine of commercial aviation and near-universal long-distance mobility — with an unresolved climate tail.',
      },
    },
  },
  {
    id: 'satellite-communications',
    type: 'section',
    name: 'satellite-communications',
    subject: {
      title: 'Satellite Communications',
      subtitle: 'From signals intelligence to rural broadband.',
      category: 'Crossover',
      summary:
        'Modern satellite communications descend from a mixture of civilian research, Cold War signals-intelligence programs, and military command-and-control requirements. The same orbital infrastructure now enables global broadband, disaster response, and connectivity in places terrestrial networks cannot reach.',
    },
    content: {
      body: 'Satellites in communications, like GPS, sit on the civilian/military boundary. Early geostationary comsats were dual-purpose from the beginning, and contemporary large low-Earth-orbit constellations continue the pattern — civilian in branding, strategically significant in practice.',
      paragraphs: [
        {
          subtitle: 'Mixed heritage',
          description:
            'Communications satellites emerged in the 1960s with both civilian and military customers from the start. National signals-intelligence agencies invested heavily in satellite collection; military command-and-control programs drove demand for hardened links; civilian operators served broadcasters, telecoms, and ships. Launch vehicles themselves, until recently, were often repurposed or closely related to ballistic missiles, further entangling the civilian space economy with defense.',
        },
        {
          subtitle: 'Contemporary constellations',
          description:
            'Large low-Earth-orbit constellations, deployed in the late 2010s and 2020s, lowered the latency and cost of satellite broadband to levels competitive with terrestrial networks in many contexts. Their role became visible worldwide during the Russia–Ukraine conflict, when civilian satellite broadband provided resilient connectivity for affected populations and for Ukrainian forces — a case discussed in more detail in [[Starlink in Ukraine]]. The same constellations power rural broadband, maritime and aviation connectivity, and a growing share of IoT and remote-monitoring traffic.',
        },
        {
          subtitle: 'Abundance implications',
          description:
            'For the purposes of the [[Age of Abundance]], the most important property of satellite communications is geographic equity. Terrestrial networks will always be cheaper where population density is high; satellite capacity is one of the few ways to deliver meaningful connectivity to low-density, remote, or crisis-affected populations without waiting for decades of infrastructure build-out. That makes comsats an important complement to fiber in any honest model of universal [[Coordination Abundance]].',
        },
        {
          subtitle: 'Open questions',
          description:
            'The same properties that make satellite comms a civilian abundance lever — ubiquity, resilience, cross-border reach — also make them strategically valuable, and therefore politically contested. Who governs orbit, who can switch off service in a crisis, how spectrum is shared, and how debris risk is managed are unresolved questions. The [[Starlink in Ukraine]] case in particular illustrated the fragility of relying on a single commercial operator for life-critical infrastructure during conflict.',
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
        tags: ['innovation', 'crossover', 'history', 'satellites', 'communications'],
        summary:
          'Dual-use satellite communications — descended from signals-intelligence and C2 programs — now the principal route to connectivity in places terrestrial networks cannot reach.',
      },
    },
  },
  {
    id: 'drone-tech-dual-use',
    type: 'section',
    name: 'drone-tech-dual-use',
    subject: {
      title: 'Drone Tech Dual-Use',
      subtitle: 'From military UAVs to agriculture, logistics, and delivery.',
      category: 'Crossover',
      summary:
        'Unmanned aerial vehicles matured under two decades of military demand before commoditizing into a civilian industry spanning agriculture, logistics, inspection, mapping, and short-range delivery. The technology\'s civilian and military trajectories remain tightly coupled.',
    },
    content: {
      body: 'Drones are the most contemporary example of the [[Military Innovation Crossovers]] pattern, and the most ethically live. The same airframes, control systems, and computer-vision stacks that enable precision agriculture also enable precision strikes; the same logistics drones that deliver medicine in remote regions share components with loitering munitions.',
      paragraphs: [
        {
          subtitle: 'Military maturation',
          description:
            'Long-endurance unmanned aerial vehicles became central to post-2001 counterterrorism operations, and the subsequent decade of sustained military demand drove rapid improvements in autopilots, datalinks, onboard compute, and small electric propulsion. The Russia–Ukraine conflict from 2022 onward accelerated a second wave: cheap first-person-view drones, loitering munitions, and ubiquitous battlefield surveillance at a scale and cost that reshaped assumptions about modern combat, as discussed in [[Drone Warfare]].',
        },
        {
          subtitle: 'Civilian diffusion',
          description:
            'The same underlying stack — brushless motors, GPS, IMUs, small computers, and increasingly capable vision models — produced a civilian drone industry covering agriculture (crop monitoring, targeted spraying), construction and infrastructure inspection, mapping and surveying, cinematography, conservation, and last-mile logistics. In some regions, medical-supply drones routinely outperform ground transport for time-critical deliveries. The economic logic of autonomous small aircraft is only now being fully absorbed by civilian supply chains.',
        },
        {
          subtitle: 'Abundance implications',
          description:
            'For the abundance transition, drones matter as a cheap, flexible layer of physical actuation: they let digital coordination reach into physical space without the cost of roads, rails, or crewed aircraft. Combined with [[Autonomous Mobility]] on the ground and [[GPS]]/[[Satellite Communications]] for positioning and backhaul, they form part of a broader ambient-logistics capability relevant to [[Atoms Abundance]]. Agricultural applications in particular have plausible contributions to food and water efficiency.',
        },
        {
          subtitle: 'Open questions',
          description:
            'The ethical coupling is unusually tight: exporting a civilian agricultural drone model often exports latent military capability as well, and restricting one frequently restricts the other. Questions about airspace governance, privacy, noise, and accountability for autonomous action in shared space are unresolved. An honest post-scarcity framing treats [[Drone Warfare]] and civilian drone abundance as two faces of the same technology, requiring governance that explicitly addresses both.',
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
        tags: ['innovation', 'crossover', 'history', 'drones', 'logistics', 'ethics'],
        summary:
          'A tightly coupled dual-use technology: military UAV maturation produced the civilian drone industry, and the two trajectories remain difficult to separate.',
      },
    },
  },
  {
    id: 'cryptography',
    type: 'section',
    name: 'cryptography',
    subject: {
      title: 'Cryptography',
      subtitle: 'From codebreaking to the foundation of digital trust.',
      category: 'History',
      summary:
        'Modern cryptography inherits from wartime codebreaking, Cold War signals-intelligence investment, and the public-key revolution of the 1970s. It is now the substrate for [[Verifiable Identity]], secure commerce, private messaging, and much of what is meant by digital trust.',
    },
    content: {
      body: 'Few fields illustrate the [[Military Innovation Crossovers]] pattern more sharply than cryptography. The same intelligence apparatus that cracked Axis codes during World War II and built signals-intelligence capabilities during the Cold War also trained the mathematicians, seeded the institutions, and shaped the standards that underwrite civilian digital life today.',
      paragraphs: [
        {
          subtitle: 'Wartime foundations',
          description:
            'The World War II codebreaking programs at Bletchley Park and their U.S. counterparts produced not only operational intelligence but also the practical birth of programmable computing, the discipline of cryptanalysis at industrial scale, and a generation of mathematicians and engineers trained in applied cryptography. In the following decades, the U.S. National Security Agency and allied signals-intelligence services sustained large, classified cryptographic research programs that shaped what was publicly possible in the field.',
        },
        {
          subtitle: 'The public-key revolution',
          description:
            'A crucial break occurred in the 1970s, when public-key cryptography — the idea that two parties can establish a shared secret or verify identity without prior contact — emerged in the open academic literature, with parallel and partially secret developments inside government agencies. Subsequent decades saw the spread of practical standards for encryption, digital signatures, and authenticated protocols into commercial software, and, eventually, into browser and mobile defaults that now protect most civilian network traffic by default.',
        },
        {
          subtitle: 'Abundance implications',
          description:
            'Cryptography is the load-bearing primitive for [[Verifiable Identity]], secure payments, confidential messaging, and most non-trivial trust assumptions in [[Coordination Abundance]]. Without strong, broadly available cryptography, civilian financial systems, supply-chain integrity, private communication, and credible governance protocols do not work at scale. It is also foundational for emerging primitives like verifiable credentials and zero-knowledge proofs, which are plausibly important to post-scarcity governance.',
        },
        {
          subtitle: 'Open questions',
          description:
            'The civilian/security tension is unresolved. Governments periodically seek to mandate exceptional access — "backdoors" — into consumer cryptography, which the technical community has consistently argued cannot be implemented without systemic weakening. Post-quantum migration is under way and will take years; standards, implementations, and dependencies across the economy all need to move together. And as with other crossovers, export controls and sanctions continue to treat strong cryptography partly as a weapon, which sits uneasily with its role as universal civilian infrastructure.',
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
        tags: ['innovation', 'crossover', 'history', 'cryptography', 'identity', 'security'],
        summary:
          'From wartime codebreaking and Cold War SIGINT through the public-key revolution to the load-bearing primitive behind digital trust and verifiable identity.',
      },
    },
  },
];
