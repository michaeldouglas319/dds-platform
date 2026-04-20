/**
 * Maps globe_events.tag values (from UCDP/USGS/ReliefWeb feeds) to wiki article tags.
 * An event tag maps to 1+ wiki article tags — all articles with ANY of those
 * wiki tags are considered "related" and shown in the ArmsEventPanel.
 *
 * The wiki's 33 conflict articles are organized in 4 batches across 4 main tags:
 * - conflict: economic scarcity, competition, war patterns
 * - contemporary: current & emerging conflicts, drone warfare, cyber, energy, semiconductors
 * - peace: positive peace, deterrence, reconstruction, disarmament, infrastructure
 * - innovation: dual-use technology, ARPANET, GPS, satellites, cryptography
 *
 * Tune these mappings as the content library evolves.
 */

export const EVENT_TAG_TO_WIKI_TAGS: Record<string, string[]> = {
  lethal: ['conflict', 'contemporary', 'economics'],
  protest: ['conflict', 'peace', 'contemporary'],
  political: ['conflict', 'peace', 'innovation'],
  infrastructure: ['infrastructure', 'peace', 'conflict'],
  cyber: ['innovation', 'conflict', 'contemporary'],
  displacement: ['peace', 'conflict', 'contemporary'],
  famine: ['conflict', 'economics', 'peace'],
  disease: ['peace', 'conflict'],
  disaster: ['peace', 'conflict'],
  science: ['innovation', 'economics'],
}
