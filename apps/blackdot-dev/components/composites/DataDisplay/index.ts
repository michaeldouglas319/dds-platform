/**
 * DataDisplay Composites
 *
 * Reusable, configurable components for displaying data in templates
 * - HighlightsList: Display highlights/features with configurable layout
 * - DurationBar: Visualize time ranges (employment, projects, etc)
 * - MetricsCard: Display metrics and achievements with auto-extraction
 *
 * Template-agnostic and work with any data structure
 *
 * @category composite
 * @layer 2
 */

export { HighlightsList, type HighlightsListProps } from './HighlightsList'
export { DurationBar, type DurationBarProps } from './DurationBar'
export { MetricsCard, type MetricsCardProps, type Metric } from './MetricsCard'
