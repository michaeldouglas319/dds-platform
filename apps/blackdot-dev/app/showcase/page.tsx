'use client';

import { SectionBatchRenderer, getAllThemeVariants, useThemeVariants } from '@dds/renderer';
import { ThemeVariantSwitcherCompact } from '@dds/renderer/lib/themes/theme-variant-switcher';
import type { UniversalSection } from '@dds/types';
import siteConfig from '../../data/site.config.json';
import styles from './showcase.module.css';

/**
 * Comprehensive section showcase
 * Displays all sections from site.config.json in a carousel/loop with theme switching
 */
export default function ShowcasePage() {
  const { currentVariant, isDark, toggleTheme } = useThemeVariants();
  const allThemeVariants = getAllThemeVariants();

  // Extract all sections from all pages
  const allSections = siteConfig.pages.flatMap((page: any) => page.sections || []) as UniversalSection[];

  return (
    <div className={styles.showcaseContainer}>
      {/* Header with controls */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>Section Showcase</h1>
            <p className={styles.subtitle}>
              Modular component library explorer for {siteConfig.app.name} {siteConfig.app.label}
            </p>
          </div>

          <div className={styles.controls}>
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className={styles.themeToggle} title="Toggle light/dark mode">
              <span className={styles.themeIcon}>{isDark ? '🌙' : '☀️'}</span>
              <span className={styles.themeName}>{isDark ? 'Dark' : 'Light'}</span>
            </button>

            {/* Theme Variant Switcher */}
            <div className={styles.variantSwitcher}>
              <ThemeVariantSwitcherCompact className={styles.variantButtons} />
            </div>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Total Sections</span>
            <span className={styles.statValue}>{allSections.length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Current Variant</span>
            <span className={styles.statValue}>{currentVariant}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Theme Variants</span>
            <span className={styles.statValue}>{allThemeVariants.length}</span>
          </div>
        </div>
      </header>

      {/* Showcase Grid */}
      <main className={styles.showcaseMain}>
        {allSections.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No sections available</h2>
            <p>Add sections to your site.config.json to display them here</p>
          </div>
        ) : (
          <div className={styles.sectionGrid}>
            {allSections.map((section, index) => (
              <ShowcaseCard key={`${section.id}-${index}`} section={section} index={index} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            DDS Section Showcase • {siteConfig.app.name} {siteConfig.app.label}
          </p>
          <p className={styles.footerMeta}>
            Total sections rendered: {allSections.length} • Select a theme variant above to preview styles
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Individual section showcase card
 */
function ShowcaseCard({ section, index }: { section: UniversalSection; index: number }) {
  return (
    <div className={styles.showcaseCard}>
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <div className={styles.cardMeta}>
          <span className={styles.cardIndex}>#{index + 1}</span>
          <h3 className={styles.cardTitle}>
            {section.subject?.title || section.name || `Section ${index + 1}`}
          </h3>
        </div>
        <span className={styles.cardType}>{section.type}</span>
      </div>

      {/* Card Preview */}
      <div className={styles.cardPreview}>
        <SectionBatchRenderer sections={[section]} />
      </div>

      {/* Card Details */}
      <div className={styles.cardDetails}>
        <div className={styles.detailsGrid}>
          {section.id && (
            <div className={styles.detail}>
              <span className={styles.detailLabel}>ID</span>
              <code className={styles.detailValue}>{section.id}</code>
            </div>
          )}
          {section.type && (
            <div className={styles.detail}>
              <span className={styles.detailLabel}>Type</span>
              <code className={styles.detailValue}>{section.type}</code>
            </div>
          )}
          {section.name && (
            <div className={styles.detail}>
              <span className={styles.detailLabel}>Name</span>
              <code className={styles.detailValue}>{section.name}</code>
            </div>
          )}
          {section.display?.layout && (
            <div className={styles.detail}>
              <span className={styles.detailLabel}>Layout</span>
              <code className={styles.detailValue}>{section.display.layout}</code>
            </div>
          )}
        </div>

        {/* Raw JSON (collapsible) */}
        <details className={styles.jsonToggle}>
          <summary>View JSON</summary>
          <pre className={styles.jsonPre}>
            <code>{JSON.stringify(section, null, 2)}</code>
          </pre>
        </details>
      </div>
    </div>
  );
}
