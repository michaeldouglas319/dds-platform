/**
 * Peace infrastructure article batch.
 *
 * This batch covers positive peace, reconstruction, and deterrence
 * infrastructure — how [[Age of Abundance]] goods actively underwrite peace
 * rather than merely coinciding with its absence of war. Each entry is a
 * UniversalSection (from @dds/types/section) matching the shape used in
 * ./articles.js, with wiki-specific fields under `meta.wiki`.
 *
 * Categories in this batch: 'Peace' | 'Doctrine' | 'Practice' | 'Concept'.
 *
 * @typedef {import('./articles.js').WikiArticle} WikiArticle
 */

/** @type {WikiArticle[]} */
export const peaceInfrastructureArticles = [
  {
    id: 'positive-peace',
    type: 'section',
    name: 'positive-peace',
    subject: {
      title: 'Positive Peace',
      subtitle: 'Not the absence of war but the presence of justice, institutions, and trust.',
      category: 'Peace',
      summary:
        'Johan Galtung\'s distinction between negative peace (no overt violence) and positive peace (the conditions that make violence unnecessary) — and how abundance-era goods underwrite the latter.',
    },
    content: {
      body: 'Positive peace, a concept developed by the Norwegian peace researcher Johan Galtung, describes the presence of the conditions — justice, functioning institutions, mutual trust, shared prosperity — that make organized violence structurally unnecessary. It contrasts with negative peace, which merely denotes the absence of overt war. In an [[Age of Abundance]] framing, positive peace is the normative target: a ceasefire is cheap, but a civilization in which neighbors have no standing reason to fight is expensive to build and maintain.',
      paragraphs: [
        {
          subtitle: 'Structural and cultural violence',
          description:
            'Galtung paired positive peace with two further concepts: structural violence (harm done by institutions — poverty, exclusion, untreated disease) and cultural violence (the narratives that legitimize the first two). On this reading, a society with no active war but with systemic child hunger or entrenched ethnic hierarchy is not at peace; it has simply displaced violence from the battlefield into the balance sheet. Positive peace asks what it would take for both forms to recede together.',
        },
        {
          subtitle: 'Abundance as underwriting',
          description:
            'Abundance-era goods — [[Energy Abundance|cheap clean electrons]], universal basic education, near-zero-marginal-cost diagnostic medicine, [[Compute Abundance|compute]] available to anyone with a device — directly reduce the material substrate of structural violence. They do not guarantee positive peace, but they make the institutions that deliver it cheaper to operate and harder to justify withholding. The [[Peace Dividend]] of earlier eras was mostly fiscal; the abundance-era dividend is partly that dignity itself becomes less expensive.',
        },
        {
          subtitle: 'Measurement and the Global Peace Index',
          description:
            'The Institute for Economics and Peace has attempted to operationalize positive peace through eight "pillars" — well-functioning government, equitable distribution of resources, free flow of information, good relations with neighbors, high human capital, acceptance of the rights of others, low corruption, and sound business environment. The measurement remains contested, but the exercise is useful: it converts a philosophical distinction into something institutions can audit against.',
        },
        {
          subtitle: 'Critiques and limits',
          description:
            'Critics warn that "positive peace" can be used to launder the status quo — any regime can claim its institutions embody justice. Others note that abundance without redistribution can widen structural violence even as aggregate wealth grows; this is the core worry of [[Distributional Justice in Abundance]]. And some peace theorists argue Galtung\'s typology is too tidy, understating how often positive peace is built atop a forgotten act of coercion. The article treats these critiques as load-bearing rather than peripheral.',
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
        tags: ['peace', 'positive-peace', 'galtung', 'institutions', 'justice'],
        summary:
          'Galtung\'s distinction between negative and positive peace, and how abundance-era goods underwrite the conditions — justice, institutions, trust — that make violence unnecessary.',
      },
    },
  },
  {
    id: 'deterrence-by-abundance',
    type: 'section',
    name: 'deterrence-by-abundance',
    subject: {
      title: 'Deterrence by Abundance',
      subtitle: 'When the capacity to produce at scale is itself a security posture.',
      category: 'Doctrine',
      summary:
        'The thesis that a civilization capable of producing drones, energy, food, and compute at abundance scale raises the cost of aggression against it — making industrial depth a pillar of national security.',
    },
    content: {
      body: 'Deterrence by abundance is the thesis that a polity\'s capacity to produce drones, munitions, energy, food, medicines, and compute at very large scale is itself a security posture. The argument is not that abundance pacifies adversaries by example, but that a rival who contemplates coercion must now price in the defender\'s ability to regenerate forces, replace infrastructure, and outlast a siege. In this framing, industrial depth sits alongside nuclear deterrence and alliance politics as a pillar of [[Contemporary Conflicts|contemporary]] strategy.',
      paragraphs: [
        {
          subtitle: 'The arsenal-of-democracy lineage',
          description:
            'The doctrine\'s deepest antecedent is the Second World War American mobilization, in which civilian industrial capacity — automobiles, shipyards, consumer electronics — was converted into military output at a pace no adversary could match. Later Cold War planners made similar arguments about electronics, aerospace, and agriculture. Deterrence by abundance updates this lineage for an era in which the relevant factories produce drones, batteries, satellites, and fabs, and in which the [[Military Innovation Crossovers|civilian-military boundary]] is porous in both directions.',
        },
        {
          subtitle: 'Energy, compute, and the modern stack',
          description:
            '[[Energy Abundance]] is load-bearing for the doctrine: a grid that can be hardened, distributed, and rapidly expanded is harder to coerce than one that depends on a few import terminals (see [[Energy Weaponization (Post-2022)]]). [[Compute Abundance]] matters similarly for the software side of modern conflict — targeting, logistics, electronic warfare. [[Semiconductor Sovereignty]] ties the two together: without domestic or allied fabs, neither the energy transition nor the drone fleet is truly resilient.',
        },
        {
          subtitle: 'Deterrence vs. provocation',
          description:
            'Every deterrent posture risks becoming provocative. A state that visibly builds abundance-scale munitions capacity may convince adversaries that war is unaffordable, or it may convince them that war must happen soon before the gap widens — the classic security dilemma. Proponents of the doctrine argue that the dual-use character of the underlying capacity (the same factories make agricultural drones and military ones) softens this signal; critics are not convinced.',
        },
        {
          subtitle: 'Critiques and limits',
          description:
            'Deterrence by abundance can slide into militarized industrial policy, justifying subsidies and export controls that have little to do with defense. It also risks crowding out the [[Peace Dividend]]: the opportunity cost of a war-ready industrial base is the butter in the [[Guns vs Butter]] tradeoff. And the doctrine does not address asymmetric threats — cyber, biological, or irregular — against which abundance of conventional capacity offers limited protection. Treating it as one instrument among many, rather than a master key, is the more defensible posture.',
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
        tags: ['peace', 'deterrence', 'doctrine', 'industrial-policy', 'security'],
        summary:
          'The doctrine that abundance-scale production of drones, energy, and compute raises the cost of aggression — an element of national security alongside alliances and nuclear posture.',
      },
    },
  },
  {
    id: 'post-war-reconstruction',
    type: 'section',
    name: 'post-war-reconstruction',
    subject: {
      title: 'Post-War Reconstruction',
      subtitle: 'From the Marshall Plan to abundance-era rebuilding.',
      category: 'Practice',
      summary:
        'How reconstruction doctrine has evolved from the Marshall Plan to present-day efforts, and how [[Energy Abundance]] and [[Compute Abundance]] change what "rebuilding" can mean.',
    },
    content: {
      body: 'Post-war reconstruction is the body of practice concerned with rebuilding societies after organized violence ends: physical infrastructure, governance institutions, economic circulation, and social trust. The canonical modern template is the Marshall Plan, under which the United States transferred large sums to Western European economies between 1948 and 1951. Later programs in Japan, the Balkans, Iraq, Afghanistan, and — in the ongoing present — Ukraine have refined, and in some cases refuted, the assumptions of that template.',
      paragraphs: [
        {
          subtitle: 'The Marshall Plan template',
          description:
            'The Marshall Plan\'s durable lessons were less about the money than about the design: conditional aid, recipient-led planning, regional integration as an explicit goal, and a willingness to strengthen former adversaries rather than extract reparations. Its critics note that it landed on societies with deep prior industrial and administrative capacity, and that transplanting the template to contexts without those foundations has repeatedly disappointed. The plan is a useful reference, not a universal recipe.',
        },
        {
          subtitle: 'What abundance changes',
          description:
            '[[Energy Abundance]] and [[Compute Abundance]] change the unit economics of rebuilding. Distributed solar plus storage means a destroyed village can be re-electrified without waiting for a transmission line to be rebuilt. Cheap compute and machine translation mean a displaced population can be issued verifiable records, re-enrolled in education, and reconnected to administrative services at a fraction of historical cost. Modular construction and [[Abundance Cities|abundance-city]] design patterns shorten the cycle from rubble to habitable housing. None of this removes the political bottlenecks, but it lowers the material floor.',
        },
        {
          subtitle: 'Governance and legitimacy',
          description:
            'The hardest part of reconstruction is almost never the concrete. It is the legitimacy of whoever coordinates it: which faction writes the contracts, which refugees are allowed home, whose property claims are recognized. [[Governance Protocols]] and [[Verifiable Identity]] infrastructure can make some of these questions auditable rather than negotiable, but only if the relevant parties trust the underlying system. Reconstruction that outpaces legitimate governance tends to be extracted by whoever controls the pipelines.',
        },
        {
          subtitle: 'Critiques and limits',
          description:
            'Reconstruction programs have a long record of capture by contractors, corruption in recipient institutions, and premature declarations of success. Abundance-era tooling can exacerbate these patterns as easily as it mitigates them — cheap compute enables fraud-detection and fraud equally. The honest framing is that abundance lowers material cost but raises the importance of political design: when building is cheap, the question of who decides what gets built becomes more, not less, consequential.',
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
        tags: ['peace', 'reconstruction', 'marshall-plan', 'practice', 'governance'],
        summary:
          'Reconstruction doctrine from the Marshall Plan to the present, and how cheap energy and compute change what "rebuilding" means in the abundance era.',
      },
    },
  },
  {
    id: 'civil-defense-abundance-era',
    type: 'section',
    name: 'civil-defense-abundance-era',
    subject: {
      title: 'Civil Defense in an Abundance Era',
      subtitle: 'Resilience as a peace institution, not just a wartime fallback.',
      category: 'Practice',
      summary:
        'Distributed power, local water, offline compute, and food sovereignty reframed as civil-defense infrastructure — and as the quiet backbone of positive peace.',
    },
    content: {
      body: 'Civil defense is the civilian-facing half of national security: the shelters, drills, stockpiles, and redundancies that keep ordinary life running through shocks. In the twentieth century it was dominated by nuclear-attack preparation and later by natural-disaster response. In an abundance era the emphasis shifts: the same infrastructure that makes daily life cheap — distributed solar, local water treatment, offline-capable compute, regional food production — is also what keeps a population uncoerced when grids, supply chains, or adversaries fail.',
      paragraphs: [
        {
          subtitle: 'Distributed everything',
          description:
            'The single most important civil-defense shift of the abundance era is the move from a small number of very large facilities to a large number of small ones. Rooftop and community solar paired with batteries replace a handful of centralized plants; point-of-use filtration supplements municipal mains; small modular compute supplements hyperscale clouds. The aggregate capacity can be higher than the centralized baseline, and the surface available for coercive attack is much larger and harder to hit in one stroke.',
        },
        {
          subtitle: 'Food and water sovereignty',
          description:
            'Food and water are the oldest levers of siege warfare. Abundance-era civil defense aims to shorten the distance between production and consumption: regional agriculture supported by controlled-environment farms, desalination and treated-greywater systems at the municipal scale, and seed and genetic repositories at the national scale. None of this requires autarky; it requires that no single chokepoint can starve a population into submission within a politically actionable time window.',
        },
        {
          subtitle: 'Offline compute and communication',
          description:
            'A civil-defense posture now includes the question of whether a region can still operate when external networks are denied. Mesh radios, [[Satellite Communications|low-earth-orbit satellite links]], locally hosted language models, offline mapping, and air-gapped backups of civic records are the modern equivalents of the fallout shelter. The goal is not to disconnect by default but to ensure that disconnection is survivable.',
        },
        {
          subtitle: 'Critiques and limits',
          description:
            'Civil-defense framings can be captured by prepper subcultures hostile to the very institutions they claim to protect, or by states seeking to justify surveillance as resilience. Distributed infrastructure is also not automatically democratic — who owns the rooftops, the batteries, the local fabs matters as much as that they exist. The honest claim is narrower: abundance makes civil defense cheaper and more distributed, but the politics of who is protected, and from whom, remain unsolved.',
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
        tags: ['peace', 'civil-defense', 'resilience', 'distributed-infrastructure', 'sovereignty'],
        summary:
          'Civil defense reframed for the abundance era: distributed power, local water, offline compute, and food sovereignty as the backbone of resilience and positive peace.',
      },
    },
  },
  {
    id: 'conflict-prevention-technology',
    type: 'section',
    name: 'conflict-prevention-technology',
    subject: {
      title: 'Conflict Prevention Technology',
      subtitle: 'Early warning, open-source monitoring, and verifiable treaty compliance.',
      category: 'Practice',
      summary:
        'The growing toolkit for detecting, deterring, and de-escalating conflicts before they become wars — from satellite monitoring to open-source intelligence to verifiable identity in arms control.',
    },
    content: {
      body: 'Conflict prevention technology is the set of tools used to detect, document, and de-escalate organized violence before it reaches full-scale war. It spans satellite imagery, open-source intelligence, digital forensics, humanitarian early-warning systems, and the verification regimes that make arms-control treaties enforceable. Historically these were the exclusive instruments of major intelligence services; over the past decade the core capabilities have become publicly accessible, with consequential effects on who can credibly call out an escalation.',
      paragraphs: [
        {
          subtitle: 'Open-source intelligence and the civilian analyst',
          description:
            'Commercial satellites, geolocated social media, flight trackers, ship trackers, and leaked telemetry have collectively produced a class of civilian analyst whose work is sometimes faster and more credible than official disclosures. Documented examples from the post-2014 period include Bellingcat\'s investigations and the near-real-time mapping of troop movements prior to and during [[Contemporary Conflicts|recent conflicts]]. The effect on prevention is indirect but real: deniability becomes costlier when third parties can independently verify what is happening.',
        },
        {
          subtitle: 'Early-warning systems',
          description:
            'Formal early-warning systems combine famine indicators, displacement flows, political-violence event data, and increasingly machine-learning forecasts. They are imperfect — false positives are common, and prevention is hard to credit when it succeeds — but they have become routine inputs to humanitarian and diplomatic planning. The abundance-era contribution is mostly on the data side: cheaper sensing, cheaper [[Compute Abundance|compute]], and cheaper communication let more places be watched more often.',
        },
        {
          subtitle: 'Treaty compliance and verifiable identity',
          description:
            'Arms-control regimes depend on verification: can the parties trust that declared stockpiles match actual stockpiles, that inspectors are seeing what they think they are seeing, that the sensor network has not been tampered with. [[Verifiable Identity]] and cryptographic attestation of sensor data are beginning to enter this space — not as replacements for on-site inspection, but as a tamper-evident layer beneath it. The same primitives underpin emerging proposals for AI-model registries and bio-synthesis screening.',
        },
        {
          subtitle: 'Critiques and limits',
          description:
            'Monitoring does not prevent conflicts whose initiators are indifferent to exposure; the post-2022 period has supplied ample evidence. Open-source intelligence can be weaponized for targeting as easily as for accountability. And verification regimes can entrench existing powers by making the rules of inspection themselves objects of political struggle. Conflict prevention technology is best understood as a multiplier on political will rather than a substitute for it.',
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
        tags: ['peace', 'conflict-prevention', 'osint', 'verification', 'treaties'],
        summary:
          'The toolkit for detecting and de-escalating conflicts before they become wars: early warning, open-source intelligence, and cryptographic verification in arms control.',
      },
    },
  },
  {
    id: 'refugee-infrastructure',
    type: 'section',
    name: 'refugee-infrastructure',
    subject: {
      title: 'Refugee Infrastructure',
      subtitle: 'Housing, healthcare, and education at the scale of forced displacement.',
      category: 'Practice',
      summary:
        'The physical and institutional systems that receive displaced people — and where [[Abundance Cities]] intersect with humanitarian response and broader migration dynamics.',
    },
    content: {
      body: 'Refugee infrastructure is the physical and institutional system that receives people displaced by war, persecution, disaster, and climate. It includes camps and transit centers, urban reception systems, legal-status pipelines, schools and clinics, and the longer-tail services — language training, employment access, family reunification — that determine whether displacement becomes integration or permanent precarity. The scale of need in the 2020s has exceeded the capacity of most existing systems, and the design question is what an abundance-era response would actually look like.',
      paragraphs: [
        {
          subtitle: 'From camps to cities',
          description:
            'The camp model — tents, rations, a perimeter — was designed for short emergencies and has persisted for decades in places where return never came. A growing body of evidence suggests that refugees do better, and host economies do better, when displaced populations are integrated into functioning urban labor markets rather than warehoused. This is where [[Abundance Cities]] becomes directly relevant: cities that can add housing and services at the speed of arrival are also the cities that can receive displaced populations without triggering backlash.',
        },
        {
          subtitle: 'Education and continuity',
          description:
            'Education is the single most durable investment in a displaced child\'s life, and it is routinely the first thing interrupted. Abundance-era tooling — low-cost tablets, offline-capable learning software, verifiable credentials that follow a student across borders — can preserve continuity where physical schools cannot be rebuilt fast enough. Similar logic applies to health records, vaccination histories, and legal documents. [[Verifiable Identity]] is not a substitute for legal status, but it can keep a life legible while status is being negotiated.',
        },
        {
          subtitle: 'Migration dynamics and the receiving polity',
          description:
            'Refugee infrastructure exists inside a political economy that also includes economic migration, climate displacement (see [[Climate Conflict]]), and domestic labor markets. Abundance-era capacity does not dissolve the political difficulties of large-scale reception — the same housing that could receive refugees is wanted by existing residents, and the same clinic budgets are contested. The honest claim is that abundance raises the ceiling on what is possible; the floor is still set by politics.',
        },
        {
          subtitle: 'Critiques and limits',
          description:
            'Humanitarian systems have a recurring pathology of optimizing for donor legibility over recipient welfare. Digital infrastructure, including [[Verifiable Identity]], can entrench surveillance of already-vulnerable populations if deployed without strong rights protections. And "integration" can be a euphemism for assimilation imposed on people who would prefer to return home. A defensible refugee infrastructure is one that maximizes the displaced person\'s own agency — including over their own data — and treats durable solutions as plural.',
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
        tags: ['peace', 'refugees', 'migration', 'humanitarian', 'cities'],
        summary:
          'The physical and institutional systems that receive displaced people — and where abundance-era housing, education, and identity infrastructure intersect with humanitarian response.',
      },
    },
  },
  {
    id: 'humanitarian-logistics',
    type: 'section',
    name: 'humanitarian-logistics',
    subject: {
      title: 'Humanitarian Logistics',
      subtitle: 'Drone delivery, crisis connectivity, and modular shelter as civilian spillover.',
      category: 'Practice',
      summary:
        'The systems that move goods, information, and shelter to people in crisis — increasingly built on civilian spillover from military and commercial capability.',
    },
    content: {
      body: 'Humanitarian logistics is the practice of moving supplies, services, and information to populations in crisis under conditions of damaged infrastructure, contested access, and extreme time pressure. Historically it was adapted from military logistics; more recently it has drawn on commercial e-commerce, civilian drone delivery, and consumer-grade satellite connectivity. The result is a toolkit that is faster, cheaper, and more distributed than the airlift-and-truck model it is replacing — and that owes much of its capability to dual-use spillover.',
      paragraphs: [
        {
          subtitle: 'Last-mile delivery and medical drones',
          description:
            'Fixed-wing medical delivery drones — pioneered by operators like Zipline in Rwanda and Ghana for blood products and vaccines — have demonstrated that a significant fraction of last-mile humanitarian delivery can be done without roads or pilots. The pattern is generalizable: insulin, anti-venom, diagnostic samples, and obstetric supplies all share the same profile of small parcels, high urgency, and awkward geography. Combat drone R&D and civilian delivery drones share enough of the underlying stack that progress in one often accelerates the other (see [[Military Innovation Crossovers]]).',
        },
        {
          subtitle: 'Crisis connectivity',
          description:
            '[[Satellite Communications|Low-earth-orbit satellite communications]] have become, within a few years, the default fallback when terrestrial networks fail. Field hospitals, coordinating NGOs, and displaced communities can reach the wider internet within hours of deployment rather than weeks. This capability has military applications that are not incidental, but the humanitarian use case is genuine and at scale. The accompanying risks — dependency on a single provider, attack surface for adversaries, surveillance of aid recipients — are active policy questions.',
        },
        {
          subtitle: 'Modular shelter and pop-up services',
          description:
            'Abundance-era construction — flat-packed shelters, containerized clinics, pre-assembled solar microgrids, water-purification modules — shortens the time from disaster to usable service. The economics are improving fast enough that some of these systems are cheaper per unit of sheltered person-month than traditional camps, with better thermal comfort and dignity. The bottleneck is rarely the hardware; it is regulatory permission to deploy it across borders.',
        },
        {
          subtitle: 'Critiques and limits',
          description:
            'Humanitarian logistics can be weaponized: denial of access is itself a tactic of war, and technological sophistication does not overcome a sovereign\'s refusal to admit aid. Commercial providers may withdraw service during the worst of a crisis, as has been documented in several post-2022 conflicts. And dependence on dual-use technology creates real dilemmas: the same drone fleet that delivers blood can deliver munitions, and populations receiving aid may become targets for the wrong reasons. The field is increasingly explicit that logistics is a political object, not just a technical one.',
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
        tags: ['peace', 'humanitarian', 'logistics', 'drones', 'connectivity'],
        summary:
          'The systems that move goods, information, and shelter to people in crisis — drones, satellite connectivity, and modular infrastructure drawn from civilian and military spillover.',
      },
    },
  },
  {
    id: 'disarmament-economics',
    type: 'section',
    name: 'disarmament-economics',
    subject: {
      title: 'Disarmament Economics',
      subtitle: 'Decommissioning stockpiles and redirecting defense spending toward abundance.',
      category: 'Concept',
      summary:
        'The political economy of converting military spending and stockpiles into abundance infrastructure — historical precedents, structural obstacles, and the [[Peace Dividend]] question.',
    },
    content: {
      body: 'Disarmament economics studies what happens to an economy when a large pool of capital, labor, and industrial capacity is redirected away from armaments. It covers stockpile decommissioning, base closures, workforce transition, and the contested macroeconomic effects of sustained cuts in defense spending. In an abundance-era framing, the field also asks whether the savings and freed capacity can be directed — politically, not just in theory — toward [[Energy Abundance]], [[Compute Abundance]], housing, and care.',
      paragraphs: [
        {
          subtitle: 'Historical precedents',
          description:
            'The canonical reference is the post-1945 demobilization of the United States and allies, in which tens of millions of personnel and enormous industrial capacity were reabsorbed into civilian life within a few years. Later episodes — post-1991 base closures in the US and Europe, the chemical-weapons decommissioning regimes of the 1990s and 2000s, South African denuclearization — provide more specific lessons about sequencing, verification, and the politics of regional job loss. None were costless, and several produced durable resentment in affected communities.',
        },
        {
          subtitle: 'The peace-dividend question',
          description:
            'Classical treatments (see [[Peace Dividend]] and [[Guns vs Butter]]) frame disarmament as a straightforward reallocation from military to civilian spending, with gains to welfare. More careful analyses qualify this in two directions: first, not all military spending has low civilian multipliers — R&D in particular has substantial spillover (see [[Military Innovation Crossovers]]); second, reallocation is rarely automatic, and the savings can simply evaporate into tax cuts or debt service without a deliberate political program behind them. The [[Broken Window Fallacy]] is a reminder that destroyed capacity is not itself a stimulus — but the inverse is also true, and "freed" capacity is not itself investment.',
        },
        {
          subtitle: 'Stockpile decommissioning',
          description:
            'Physical disarmament — chemical weapons, landmines, excess conventional stockpiles, legacy nuclear material — is slow, expensive, and technically demanding. Abundance-era tooling helps at the margin: cheaper monitoring, better robotic handling of hazardous material, verifiable cryptographic audit of declared inventories. It does not substitute for the political agreements that authorize decommissioning in the first place, and unilateral disarmament in the absence of reciprocal moves remains a minority position among practitioners.',
        },
        {
          subtitle: 'Critiques and limits',
          description:
            'Disarmament economics has a recurring weakness: it tends to assume the political will for conversion that the historical record shows is rare. Defense industries are concentrated, politically organized, and often regionally dominant; abundance industries are diffuse and have weaker lobbies. Any serious program therefore has to pair technical conversion with distributional policy explicitly. And some analysts argue that in a world of renewed great-power competition, the relevant frontier is not disarmament at all but better-designed armament — a position the field must engage rather than dismiss.',
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
        tags: ['peace', 'disarmament', 'economics', 'peace-dividend', 'conversion'],
        summary:
          'The political economy of converting defense spending and stockpiles into abundance infrastructure — historical precedents, structural obstacles, and the peace-dividend debate.',
      },
    },
  },
];
