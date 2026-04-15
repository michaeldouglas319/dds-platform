/**
 * Contemporary conflicts seed articles.
 *
 * This batch analyzes 2020s-era conflicts through the abundance/scarcity
 * lens used throughout the wiki. Each entry is a UniversalSection (from
 * @dds/types/section) with wiki-specific fields nested under `meta.wiki`,
 * matching the shape in `content/articles.js`.
 *
 * Editorial stance: strictly non-partisan; honest about uncertainty;
 * no invented casualty figures, dates, or quotations. Where specifics are
 * contested or unresolved, the prose hedges rather than asserts.
 *
 * @typedef {import('./articles.js').WikiArticle} WikiArticle
 */

/** @type {WikiArticle[]} */
export const contemporaryConflictArticles = [
  {
    id: 'contemporary-conflicts',
    type: 'section',
    name: 'contemporary-conflicts',
    subject: {
      title: 'Contemporary Conflicts',
      subtitle: 'Abundance and scarcity dynamics in 2020s warfare and coercion.',
      category: 'Contemporary',
      summary:
        'An overview of how abundance and scarcity dynamics shape the conflicts of the 2020s — from drones and semiconductors to energy leverage, information operations, and contested orbits.',
    },
    content: {
      body: 'The conflicts of the 2020s are legible through the same lens the wiki applies to peaceful transformation: where is a resource becoming abundant, where is it becoming scarce, and who controls the chokepoints in between. Unlike the industrial wars of the 20th century, contemporary confrontations are fought simultaneously across physical, digital, orbital, and informational terrain, with private firms, open-source communities, and states all holding consequential leverage. This framework article introduces the batch and states the editorial thesis that unites the entries that follow.',
      paragraphs: [
        {
          subtitle: 'Abundance changes the shape of conflict',
          description:
            'When a capability becomes cheap and widely distributed — imagery from commercial satellites, inference from open-weight models, propulsion from consumer drone parts — the advantage of incumbency shrinks and the advantage of iteration grows. This is the thread running through [[Drone Warfare]], [[Information Warfare]], and [[Cybersecurity as Civil Defense]]: abundance on the offense side is forcing defenders to rebuild doctrine in public, often with uneven results.',
        },
        {
          subtitle: 'Scarcity returns as deliberate leverage',
          description:
            'Even amid broad abundance, specific chokepoints — leading-edge semiconductors, certain [[Rare Earth Geopolitics|critical minerals]], high-bandwidth orbital slots, pipeline gas — have become instruments of coercion. Entries like [[Semiconductor Sovereignty]] and [[Energy Weaponization (Post-2022)]] examine how scarcity is manufactured and how abundance responses (reshoring, renewables build-out, recycling) are being accelerated in reply. See also [[Resource Scarcity and War]] and [[Energy Wars]].',
        },
        {
          subtitle: 'Private infrastructure as strategic terrain',
          description:
            'Firms providing connectivity, compute, and payments now sit astride conflict zones in ways that states cannot easily substitute. [[Starlink in Ukraine]] is the canonical illustration, but the pattern extends to cloud providers, cybersecurity vendors, and model hosts. This raises open questions about legitimacy, accountability, and the limits of [[Verifiable Identity|private-sector]] responsibility in wartime.',
        },
        {
          subtitle: 'Open questions',
          description:
            'The batch deliberately avoids forecasting outcomes. Will abundance-driven asymmetry stabilize deterrence or destabilize it (see [[Deterrence by Abundance]])? Can contested commons like low Earth orbit and the information environment be governed without either balkanization or capture? Do [[Climate Conflict]] pressures compound or eventually discipline the others? These remain live, and the articles flag where consensus does not yet exist.',
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
        tags: ['contemporary', 'conflict', 'overview', 'framework'],
        summary:
          'Framework article introducing the 2020s conflicts batch through the abundance/scarcity lens.',
      },
    },
  },
  {
    id: 'drone-warfare',
    type: 'section',
    name: 'drone-warfare',
    subject: {
      title: 'Drone Warfare',
      subtitle: 'The Ukraine–Russia war as the laboratory of abundant, disposable airpower.',
      category: 'Conflict',
      summary:
        'Small, cheap, rapidly-iterated uncrewed systems have reshaped the economics of attack and defense, with first-person-view drones emerging as the defining weapon of the Ukraine–Russia war.',
    },
    content: {
      body: 'The Ukraine–Russia war, ongoing since 2022, has become the most intensively observed drone conflict in history. Both sides field commercial quadcopters modified for reconnaissance and grenade drops, purpose-built first-person-view (FPV) loitering munitions, long-range one-way attack platforms, and increasingly, naval and ground uncrewed systems. Observers across the political spectrum agree the war has changed what "airpower" means; they disagree sharply about what lessons generalize.',
      paragraphs: [
        {
          subtitle: 'Asymmetric abundance',
          description:
            'The canonical framing — a drone costing a few hundred dollars disabling an armored vehicle costing several million — captures something real about the cost-exchange ratio, though exact figures vary by platform and are often contested. What is less disputed is that a globally abundant supply chain (consumer batteries, flight controllers, cameras, RF components) lets both sides iterate designs on weekly cycles. This is [[Military Innovation Crossovers]] running in reverse: civilian hardware militarized at civilian tempo.',
        },
        {
          subtitle: 'Defense is harder than offense, for now',
          description:
            'Electronic warfare, nets, cages, and interceptor drones have all seen use, but no single countermeasure has proven dominant. Tethered fiber-optic FPVs sidestep jamming entirely. The result is an environment in which traditional massed armor and static logistics are extraordinarily vulnerable, and in which dispersed, concealed, small-unit tactics are rewarded — a shift some analysts compare in magnitude to the machine gun or the tank, while others caution against over-generalization from one theater.',
        },
        {
          subtitle: 'Honest moral framing',
          description:
            'Cheap, precise, remotely operated weapons lower the cost of killing in both directions. Civilians in range of FPV operators are at real and growing risk; operators themselves are insulated from the moral weight of line-of-sight combat. The wiki treats this as a genuine harm of abundance misapplied, not an inevitability. Discussions of [[Peace Dividend]] and [[Positive Peace]] sit in productive tension with this entry rather than resolving it.',
        },
        {
          subtitle: 'Open questions',
          description:
            'Whether drone-saturated battlefields favor defenders long-term (as current evidence tentatively suggests) or eventually favor well-funded attackers with autonomous swarms is unsettled. So is the question of how proliferation to non-state actors reshapes domestic security. Readers should be skeptical of confident predictions, including this wiki\'s.',
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
        tags: ['contemporary', 'conflict', 'drones', 'ukraine', 'military-technology'],
        summary:
          'FPV and loitering-munition drones have made airpower cheap, abundant, and disposable, reshaping battlefield economics.',
      },
    },
  },
  {
    id: 'starlink-in-ukraine',
    type: 'section',
    name: 'starlink-in-ukraine',
    subject: {
      title: 'Starlink in Ukraine',
      subtitle: 'Private satellite internet as strategic wartime infrastructure.',
      category: 'Geopolitics',
      summary:
        'Starlink terminals dispatched to Ukraine shortly after the February 2022 invasion became the archetypal case of private-sector space infrastructure acting as strategic wartime connectivity.',
    },
    content: {
      body: 'Shortly after the February 2022 Russian invasion, SpaceX\'s Starlink service began operating in Ukraine, with terminals arriving through a mix of donations, government purchases, and civilian crowdfunding. The deployment is widely credited with keeping Ukrainian command, civilian communications, and drone operations functional as terrestrial networks were damaged. It is also the clearest real-world test of what it means for war-relevant infrastructure to be owned and governed by a private firm.',
      paragraphs: [
        {
          subtitle: 'Connectivity abundance under fire',
          description:
            'Low-Earth-orbit constellations turn bandwidth into something closer to a commodity: enough satellites, enough spectrum, enough ground stations, and coverage becomes nearly ubiquitous. In peacetime this manifests as rural broadband; in Ukraine it manifested as resilient military and civilian links that could not be comprehensively severed by kinetic strikes on fiber. See [[Satellite Communications]] for the longer arc.',
        },
        {
          subtitle: 'Private infrastructure, public consequences',
          description:
            'Because the service is operated by a single firm, decisions about geographic coverage, feature availability (notably around offensive use cases), and pricing have had direct operational effects. Reporting has documented instances where coverage policy and ownership decisions — including choices attributed personally to [[Elon Musk]] — became matters of allied diplomacy. This is not a unique arrangement in history, but it is unusually legible and unusually fast-moving.',
        },
        {
          subtitle: 'Precedent for the abundance era',
          description:
            'The case is frequently cited in discussions of how [[Verifiable Identity|private-sector]] platforms should relate to states in crisis, and how redundancy, interoperability, and clear legal frameworks can prevent single-firm chokepoints from becoming single points of failure. Multiple competing constellations, open standards, and pre-negotiated wartime service agreements are all proposed responses; none has yet been adopted at scale.',
        },
        {
          subtitle: 'Open questions',
          description:
            'Was Starlink\'s role in Ukraine a one-off born of exceptional circumstance, or a template for how abundant private infrastructure will behave in future conflicts? How should democracies govern firms whose products become strategically indispensable mid-crisis? These questions recur throughout the batch and are not settled here.',
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
        tags: ['contemporary', 'conflict', 'starlink', 'ukraine', 'satellites', 'private-infrastructure'],
        summary:
          'Starlink in Ukraine illustrates how abundant private satellite connectivity can become strategic wartime infrastructure.',
      },
    },
  },
  {
    id: 'semiconductor-sovereignty',
    type: 'section',
    name: 'semiconductor-sovereignty',
    subject: {
      title: 'Semiconductor Sovereignty',
      subtitle: 'Leading-edge chips as contested strategic resource.',
      category: 'Geopolitics',
      summary:
        'TSMC\'s dominance of leading-edge fabrication, US export controls on advanced chips and tools, and multi-jurisdictional industrial policy have turned semiconductors into the central supply-chain contest of the 2020s.',
    },
    content: {
      body: 'Advanced semiconductors — particularly logic chips at the most recent process nodes and the extreme-ultraviolet lithography tools used to make them — have emerged as the defining contested resource of the decade. A small number of firms, most prominently TSMC in Taiwan and ASML in the Netherlands, sit at chokepoints no state can quickly replicate. This has turned chip supply into a matter treated by many governments as closer to nuclear materials than to ordinary trade.',
      paragraphs: [
        {
          subtitle: 'Geography of the chokepoint',
          description:
            'Taiwan\'s centrality to leading-edge fabrication is the most discussed feature of the landscape, with knock-on implications for cross-strait tensions that the wiki does not attempt to adjudicate. The United States responded with the CHIPS and Science Act (2022) and successive rounds of export controls restricting advanced chip and tool sales to specified jurisdictions; allied governments adopted broadly similar measures. The European Union and Japan launched their own industrial programs.',
        },
        {
          subtitle: 'Compute as contested abundance',
          description:
            'From the abundance perspective, chips are the physical substrate of [[Compute Abundance]] — the pillar that makes modern AI, simulation, and design-space search tractable. A world in which compute is politically rationed is a world in which other abundances (drug discovery, climate modeling, robotics) are partially rationed too. The policy debate is therefore not only about military advantage but about who gets to build what, when.',
        },
        {
          subtitle: 'Responses and limits',
          description:
            'Responses include on-shoring fabs (slow, expensive, and still dependent on global tool and materials supply chains), diversifying packaging and mature-node capacity, investing in alternative architectures, and — on the open side — open-source hardware and RISC-V ecosystems. None removes the chokepoint quickly; all change the shape of the graph. See [[Rare Earth Geopolitics]] for an adjacent chokepoint story and [[Military Innovation Crossovers]] for the dual-use dimension.',
        },
        {
          subtitle: 'Open questions',
          description:
            'Whether export controls slow rival capability development by years or merely months, whether on-shoring produces genuinely resilient supply or politically comfortable redundancy, and whether a crisis around Taiwan can be deterred by economic interdependence alone are all actively contested. Reasonable analysts disagree; the wiki flags the disagreement rather than resolving it.',
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
        tags: ['contemporary', 'conflict', 'semiconductors', 'taiwan', 'industrial-policy', 'compute'],
        summary:
          'Advanced chips have become the contested chokepoint of the 2020s, driving export controls, reshoring, and a new industrial politics of compute.',
      },
    },
  },
  {
    id: 'information-warfare',
    type: 'section',
    name: 'information-warfare',
    subject: {
      title: 'Information Warfare',
      subtitle: 'When compute abundance becomes a weapon aimed at shared reality.',
      category: 'Conflict',
      summary:
        'Deepfakes, coordinated influence operations, and model poisoning weaponize the same compute abundance that drives beneficial AI, stressing the trust infrastructure of open societies.',
    },
    content: {
      body: 'Information warfare is not new, but the 2020s combination of cheap generative models, global platform reach, and highly targetable audiences has changed its scale and character. Deepfaked audio and video, large-scale synthetic-persona campaigns, and attempts to corrupt training data or retrieval indices for widely used models all fall under the heading. The abundance story is ambivalent: the same drop in the cost of producing plausible media that empowers creators empowers propagandists.',
      paragraphs: [
        {
          subtitle: 'Mechanisms',
          description:
            'Contemporary influence operations combine at least three elements: generative content production (text, image, audio, video), distribution through platforms and messaging apps, and feedback loops that tune messaging based on engagement. Model poisoning — deliberate injection of misleading or politically tilted material into data that will be scraped and trained on — is a less mature but actively discussed vector, relevant both to [[Open-Source AGI]] ecosystems and to closed-weight commercial models.',
        },
        {
          subtitle: 'Defensive stacks',
          description:
            'Proposed defenses include cryptographic content provenance (e.g., C2PA-style signed capture and edit histories), platform-level detection and friction, media-literacy investment, and — most relevant to the wiki\'s framework — [[Verifiable Identity]] layers that let recipients distinguish known humans and institutions from anonymous or synthetic sources without collapsing into universal deanonymization. None is a silver bullet; most work best in combination.',
        },
        {
          subtitle: 'Non-partisan framing',
          description:
            'Influence operations are run by many governments and many private actors across the political spectrum. The wiki refrains from attributing specific contemporary campaigns to specific actors beyond what is established in public indictments or formally declassified reporting, and notes that accusations of information warfare are themselves a form of information warfare. Skepticism cuts in every direction.',
        },
        {
          subtitle: 'Open questions',
          description:
            'Whether abundant synthetic media degrades public trust permanently or prompts an adaptive immune response (more skeptical audiences, better provenance norms) is unresolved. Whether open-weight models meaningfully accelerate influence operations beyond what closed APIs already enable is actively debated among researchers. The honest answer in both cases is "we do not yet know."',
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
        tags: ['contemporary', 'conflict', 'information-warfare', 'deepfakes', 'ai', 'trust-infrastructure'],
        summary:
          'Cheap generative models and global reach have scaled influence operations, stressing the trust infrastructure abundance depends on.',
      },
    },
  },
  {
    id: 'energy-weaponization-post-2022',
    type: 'section',
    name: 'energy-weaponization-post-2022',
    subject: {
      title: 'Energy Weaponization (Post-2022)',
      subtitle: 'Gas leverage, pipeline sabotage, and the accelerated European abundance response.',
      category: 'Geopolitics',
      summary:
        'Russia\'s use of natural gas supply as leverage after its 2022 invasion of Ukraine, the Nord Stream pipeline incidents, and Europe\'s accelerated pivot to renewables and LNG diversification reshaped European energy politics.',
    },
    content: {
      body: 'In the months surrounding Russia\'s February 2022 invasion of Ukraine, European dependence on Russian pipeline gas became a central axis of the conflict. Cut-offs and price shocks during 2022 exposed the strategic cost of concentrated fossil-fuel dependence and triggered policy responses whose long-term effect is still being measured. The Nord Stream pipeline incidents of September 2022 — whose attribution remains formally unresolved in public reporting — added a physical-sabotage dimension that the wiki does not attempt to adjudicate.',
      paragraphs: [
        {
          subtitle: 'Scarcity as coercion',
          description:
            'The episode is a textbook case of [[Resource Scarcity and War]] logic: a resource that is substitutable over years can be strategically decisive over months. European gas storage, LNG import capacity, industrial curtailment, and demand response all became geopolitical variables. Households, not just states, experienced the coercion directly through energy bills. See [[Energy Wars]] for the longer tradition.',
        },
        {
          subtitle: 'The abundance response',
          description:
            'European renewables deployment, heat-pump adoption, grid interconnection, and LNG terminal construction all accelerated markedly post-2022, with policy packages such as REPowerEU articulating the shift explicitly. Analysts disagree on how much of the acceleration was already underway for climate reasons and how much was specifically security-driven, but the direction is not disputed. This is [[Energy Abundance]] being pulled forward by a scarcity shock — historically a common pattern.',
        },
        {
          subtitle: 'Unevenness and cost',
          description:
            'The transition was and remains uneven. Heavy industry in some regions curtailed or relocated. Lower-income households bore disproportionate price pain. Coal use temporarily rose in several countries before falling again. The wiki treats these costs as real rather than footnotes, and as a reminder that abundance transitions have distributional politics that a pure technology lens misses.',
        },
        {
          subtitle: 'Open questions',
          description:
            'Whether European industrial competitiveness recovers as renewable buildout matures, whether gas leverage returns via different suppliers, and whether the speed of the post-2022 pivot is a template or an exception for other regions all remain open. Readers should treat confident projections with the usual skepticism.',
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
        tags: ['contemporary', 'conflict', 'energy', 'europe', 'renewables', 'geopolitics'],
        summary:
          'Post-2022 European energy politics — gas leverage, pipeline sabotage, accelerated renewables — as an abundance response to a scarcity shock.',
      },
    },
  },
  {
    id: 'cybersecurity-civil-defense',
    type: 'section',
    name: 'cybersecurity-civil-defense',
    subject: {
      title: 'Cybersecurity as Civil Defense',
      subtitle: 'Ransomware on hospitals and utilities, and what abundance-era defense looks like.',
      category: 'Conflict',
      summary:
        'Ransomware and state-linked intrusions targeting hospitals, pipelines, water utilities, and local governments have elevated cybersecurity from an IT concern to a civil-defense concern.',
    },
    content: {
      body: 'A steady stream of intrusions against hospitals, pipelines, water utilities, school districts, and municipal governments has pushed cybersecurity out of the IT department and into civil defense. The threat actors range from criminal ransomware crews to state-linked groups to hybrids that blur the distinction. The common feature is that software-mediated critical infrastructure inherits software\'s vulnerability profile, and that abundance of attack tools has outpaced abundance of defense capacity in most jurisdictions.',
      paragraphs: [
        {
          subtitle: 'The new threat surface',
          description:
            'Electrification, digitization, and remote monitoring — all abundance-era wins — enlarge the attack surface at the same time they enlarge the economic surface. A hospital whose electronic records, imaging, and infusion pumps are networked delivers better care and is simultaneously easier to paralyze. The answer is not to de-network but to build defensive depth proportional to the dependency.',
        },
        {
          subtitle: 'What abundance-era defense looks like',
          description:
            'Emerging good practice includes secure-by-default software supply chains, memory-safe languages for new critical code, mandatory incident reporting, sector-specific information-sharing organizations, cyber-insurance discipline on minimum hygiene, and public-interest red teaming. [[Verifiable Identity]] and strong authentication deployed broadly (not just for elites) foreclose entire attack classes. See [[ARPANET to Internet]] for the historical arc of networks getting defenses retrofitted.',
        },
        {
          subtitle: 'Civil-defense framing',
          description:
            'Treating cybersecurity as civil defense implies public investment comparable to fire services and public health, not just private risk management. It also implies that attacks on hospitals and water utilities should be treated as attacks on civilians under the relevant legal frameworks — a normative claim that international bodies have partially articulated but not consistently enforced.',
        },
        {
          subtitle: 'Open questions',
          description:
            'Whether AI assistance tilts the offense/defense balance toward defenders (better code review, anomaly detection) or attackers (cheaper exploit development, more persuasive phishing) is genuinely unresolved. Nor is it clear how small municipalities and rural utilities can sustainably reach the defensive floor the threat environment demands.',
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
        tags: ['contemporary', 'conflict', 'cybersecurity', 'ransomware', 'critical-infrastructure', 'civil-defense'],
        summary:
          'Critical-infrastructure intrusions have turned cybersecurity into a civil-defense problem requiring public investment proportional to societal dependence.',
      },
    },
  },
  {
    id: 'space-contested-commons',
    type: 'section',
    name: 'space-contested-commons',
    subject: {
      title: 'Space as Contested Commons',
      subtitle: 'ASAT tests, Kessler risk, and why LEO access is a shared infrastructure problem.',
      category: 'Geopolitics',
      summary:
        'Anti-satellite weapon tests, growing orbital debris, and crowding in low Earth orbit make access to space a commons-governance problem that a [[Multi-Planetary Civilization]] must solve.',
    },
    content: {
      body: 'Low Earth orbit (LEO) is simultaneously becoming more useful — thanks to large commercial constellations, cheap launch, and abundant earth-observation data — and more fragile. Kinetic anti-satellite (ASAT) tests conducted by multiple spacefaring powers over recent decades have generated debris clouds that threaten all users, including the testing state. The Kessler syndrome — a runaway collisional cascade that could render certain orbits unusable for generations — is no longer purely theoretical.',
      paragraphs: [
        {
          subtitle: 'Abundance that depends on a shared floor',
          description:
            'Satellite communications, earth observation, GPS-class navigation, and space science all depend on orbits remaining navigable. Unlike most abundance pillars, this one has a hard physical upper bound on how crowded it can safely become, and the failure mode — cascading debris — is effectively irreversible on human timescales. See [[Satellite Communications]] for the utility story and [[Multi-Planetary Civilization]] for why the failure mode matters beyond Earth.',
        },
        {
          subtitle: 'Governance gaps',
          description:
            'The Outer Space Treaty (1967) and follow-on agreements provide a thin legal floor but were not written for mega-constellations, rideshare launches, or counterspace weapons. Voluntary moratoria on destructive ASAT tests have been announced by some states and not others. Traffic coordination, collision-avoidance data sharing, and end-of-life deorbit compliance are partial and uneven. This is a [[Governance Protocols]] problem of the classic kind: technically tractable, politically under-resourced.',
        },
        {
          subtitle: 'What abundance-compatible space looks like',
          description:
            'Proposed elements include binding debris-mitigation standards, active debris removal (still experimental and expensive), transparent space-situational-awareness sharing, and norms against kinetic ASAT demonstrations. A commercial industry that cannot insure its own operations in a debris-cascading LEO has self-interested reason to support such norms; alignment between commercial and security actors is necessary but not sufficient.',
        },
        {
          subtitle: 'Open questions',
          description:
            'Whether Kessler-like cascades can be prevented by norms alone or require enforcement mechanisms that states have not yet agreed to, and whether non-kinetic counterspace (jamming, cyber, dazzling) becomes a substitute or a complement to kinetic action, are both unresolved. The wiki flags these without pretending to adjudicate.',
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
        tags: ['contemporary', 'conflict', 'space', 'orbital-debris', 'asat', 'commons'],
        summary:
          'Orbital debris, ASAT tests, and LEO crowding make space a contested commons whose governance is load-bearing for the abundance agenda.',
      },
    },
  },
  {
    id: 'climate-conflict',
    type: 'section',
    name: 'climate-conflict',
    subject: {
      title: 'Climate Conflict',
      subtitle: 'Water stress, migration, and feedback loops stress-testing the international order.',
      category: 'Contemporary',
      summary:
        'Climate change is rarely the sole cause of conflict but frequently a force multiplier, stressing water, food, migration, and sovereignty regimes in ways the 20th-century international order was not designed for.',
    },
    content: {
      body: 'Climate change is seldom the single cause of any particular conflict, and responsible analysis avoids the trap of monocausal attribution. But as a force multiplier — amplifying water scarcity, crop failure, displacement pressure, and coastal infrastructure loss — its contribution to conflict risk is widely acknowledged across security, development, and scientific communities. The abundance framework suggests both where the stress lands hardest and where the responses have the most leverage.',
      paragraphs: [
        {
          subtitle: 'Stress vectors',
          description:
            'Transboundary river basins under drought stress generate negotiation failures that can harden into confrontations. Heat extremes reduce labor productivity and crop yields in the regions least able to absorb the loss. Sea-level rise makes coastal cities and low-lying states existentially vulnerable on timescales shorter than infrastructure lifetimes. Permafrost methane and Arctic ice loss feed back into the climate system with poorly bounded uncertainty. Each vector interacts with the others.',
        },
        {
          subtitle: 'Migration and sovereignty',
          description:
            'Climate-driven displacement, both internal and cross-border, is likely to be one of the defining governance problems of the century. The international refugee regime, designed around political persecution, does not cleanly cover climate displacement. Domestic politics around migration in receiving countries is already contentious. The wiki treats this as a genuine coordination problem rather than a question with an obvious answer, and notes that partisans on all sides tend to understate the difficulty.',
        },
        {
          subtitle: 'Abundance as partial answer',
          description:
            'Cheap clean energy, desalination, vertical agriculture, and climate-resilient crops do not undo accumulated warming but change the shape of the stress curve. [[Energy Abundance]] enables cooling, desalination, and synthetic fuels; [[Compute Abundance]] enables better forecasting and adaptation planning; [[Coordination Abundance]] enables transboundary basin agreements and early-warning systems. The response is plural and unglamorous, and most of the levers are already known.',
        },
        {
          subtitle: 'Open questions',
          description:
            'Whether the international order adapts incrementally, reconfigures sharply, or fragments under compounding stress is unsettled and probably will be for decades. Whether climate cooperation survives under conditions of broader geopolitical rivalry — or requires it to ease first — is one of the central open questions of the batch. See also [[Post-War Reconstruction]] for adjacent dynamics and [[Positive Peace]] for the underlying frame.',
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
        tags: ['contemporary', 'conflict', 'climate', 'migration', 'water', 'international-order'],
        summary:
          'Climate change as conflict force multiplier, and the abundance tools that partially shape the stress curve.',
      },
    },
  },
];
