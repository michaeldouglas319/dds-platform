'use client'

import { useState } from 'react'
import { HighlightsList, DurationBar, MetricsCard } from '@/components/composites/DataDisplay'

/**
 * Tier 1 Demo Page
 * Visual testing and exploration of all Tier 1 improvements
 *
 * Access at: http://localhost:3000/tier1-demo
 */

export default function Tier1DemoPage() {
  const [activeTab, setActiveTab] = useState<'highlights' | 'duration' | 'metrics' | 'combined'>('highlights')

  // Sample data from resume
  const teslaRole = {
    company: 'Tesla',
    role: 'Software Engineer',
    period: 'Jan 2025 - Present',
    color: '#cc0000',
    highlights: [
      'Front-end Development: TypeScript, React, Python',
      'Full-stack for performative native applications',
      'Owner of 2 complete applications, supporting multiple others',
      'Database Expertise: MySQL, PostgreSQL, MSSQL, ClickHouse, MongoDB',
      'Agent & RAG Systems: UI/UX design for data preparation & retrieval',
      'AI SDK integration & development'
    ],
    paragraphs: [
      'Experienced in full-stack full life cycle development for performative, in-house applications, owning several applications in their entirety while supporting several others.',
      'Expertise spans multiple database technologies including MySQL, PostgreSQL, MSSQL, ClickHouse, and MongoDB. Deeply familiar with agent and RAG (Retrieval-Augmented Generation) systems, contributing to the future of data preparation and retrieval through innovative UI/UX design and AI SDK integration.',
      'Previously served as Vision Engineering Technician II and Vision Engineering Technician, developing and maintaining cutting-edge vision systems for vehicle quality inspections using machine learning, high-resolution imaging, and various training platforms.'
    ]
  }

  const teslaVisionRole = {
    company: 'Tesla',
    role: 'Vision Engineering Technician',
    period: 'May 2023 - Jan 2025',
    color: '#cc0000',
    highlights: [
      '95% reduction in process times through automation',
      'Owner of high-value inspection systems',
      'Enhanced 12+ legacy projects',
      'Python, Machine Learning, Computer Vision'
    ],
    paragraphs: [
      'Developed and maintained cutting-edge vision systems for vehicle quality inspections, utilizing machine learning, high-resolution imaging and various training platforms.',
      'Created custom solutions to manipulate datasets in bulk, reducing process times by 95%, and another application to generate complex data-queries resulting in improved efficiency for various skill levels.',
      'Owner of numerous high-value inspections and enhanced over a dozen legacy projects, significantly increasing product longevity. Recognized across quality and process departments for rapid and high-quality delivery.',
      'Validated implementation of Python and various machine learning techniques, with a passion for advancing computer vision capabilities.'
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Tier 1 Improvements Demo</h1>
          <p className="text-slate-400">Visual testing of HighlightsList, DurationBar, and MetricsCard components</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          {(['highlights', 'duration', 'metrics', 'combined'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-red-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'highlights' && '📋 Highlights List'}
              {tab === 'duration' && '⏱️ Duration Bar'}
              {tab === 'metrics' && '📊 Metrics Card'}
              {tab === 'combined' && '🎯 Combined Card'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* HIGHLIGHTS LIST DEMO */}
          {activeTab === 'highlights' && (
            <div className="space-y-8">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">HighlightsList Component</h2>
                <p className="text-slate-300 mb-6">Displays all highlights from JSON. Currently showing <span className="font-bold">{teslaRole.highlights.length}</span> items (previously limited to 3)</p>

                <div className="space-y-8">
                  {/* Layout: Wrapped (Default) */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Layout: Wrapped (Default)</h3>
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                      <HighlightsList
                        items={teslaRole.highlights}
                        color={teslaRole.color}
                        layout="wrapped"
                        textSize="sm"
                        bullet={true}
                      />
                    </div>
                  </div>

                  {/* Layout: Grid */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Layout: Grid (2 columns)</h3>
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                      <HighlightsList
                        items={teslaRole.highlights}
                        color={teslaRole.color}
                        layout="grid"
                        maxColumns={2}
                        textSize="sm"
                        bullet={true}
                      />
                    </div>
                  </div>

                  {/* Layout: Inline */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Layout: Inline with Truncation (max 3)</h3>
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                      <HighlightsList
                        items={teslaRole.highlights}
                        color={teslaRole.color}
                        layout="inline"
                        maxItems={3}
                        textSize="sm"
                        bullet={true}
                      />
                    </div>
                  </div>

                  {/* Different color */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Custom Color (Indigo)</h3>
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                      <HighlightsList
                        items={teslaRole.highlights.slice(0, 4)}
                        color="#6366f1"
                        layout="wrapped"
                        textSize="sm"
                        bullet={true}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-emerald-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-emerald-400 mb-2">✅ Tier 1 Achievement</h3>
                <p className="text-slate-300">Previously: 3 highlights shown<br/>Now: All <span className="font-bold">{teslaRole.highlights.length} highlights</span> displayed with configurable layouts</p>
              </div>
            </div>
          )}

          {/* DURATION BAR DEMO */}
          {activeTab === 'duration' && (
            <div className="space-y-8">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">DurationBar Component</h2>
                <p className="text-slate-300 mb-6">Visualizes employment duration with animated progress bars</p>

                <div className="space-y-8">
                  {/* Tesla Current Role */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">Tesla - Current Role (Ongoing)</h3>
                    <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                      <DurationBar
                        startDate="Jan 2025"
                        endDate="Present"
                        color={teslaRole.color}
                        showLabel={true}
                        format="both"
                        animate={true}
                        metadata={{
                          label: 'Software Engineer'
                        }}
                      />
                    </div>
                  </div>

                  {/* Tesla Previous Role (Completed) */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">Tesla - Previous Role (1.5+ years)</h3>
                    <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                      <DurationBar
                        startDate="May 2023"
                        endDate="Jan 2025"
                        color={teslaRole.color}
                        showLabel={true}
                        format="both"
                        animate={true}
                        metadata={{
                          label: 'Vision Engineering Technician'
                        }}
                      />
                    </div>
                  </div>

                  {/* Different Format Options */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">Format Options</h3>
                    <div className="space-y-4">
                      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                        <p className="text-xs text-slate-500 mb-2">Format: "months"</p>
                        <DurationBar
                          startDate="May 2023"
                          endDate="Jan 2025"
                          color="#6366f1"
                          format="months"
                          showLabel={false}
                        />
                      </div>
                      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                        <p className="text-xs text-slate-500 mb-2">Format: "years"</p>
                        <DurationBar
                          startDate="May 2023"
                          endDate="Jan 2025"
                          color="#6366f1"
                          format="years"
                          showLabel={false}
                        />
                      </div>
                      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                        <p className="text-xs text-slate-500 mb-2">Format: "both"</p>
                        <DurationBar
                          startDate="May 2023"
                          endDate="Jan 2025"
                          color="#6366f1"
                          format="both"
                          showLabel={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-emerald-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-emerald-400 mb-2">✅ Tier 1 Achievement</h3>
                <p className="text-slate-300">Previously: No duration visualization<br/>Now: Animated bars showing employment length with "Ongoing" indicators</p>
              </div>
            </div>
          )}

          {/* METRICS CARD DEMO */}
          {activeTab === 'metrics' && (
            <div className="space-y-8">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">MetricsCard Component</h2>
                <p className="text-slate-300 mb-6">Automatically extracts metrics from text (95%, 12+, etc)</p>

                <div className="space-y-8">
                  {/* Auto-Extract from Paragraphs */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">Auto-Extracted Metrics from Job Description</h3>
                    <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                      <MetricsCard
                        content={teslaVisionRole.paragraphs.join(' ')}
                        layout="grid"
                        columns={2}
                        size="md"
                        backgroundColor="bg-slate-800/50"
                        showBorder={true}
                      />
                    </div>
                  </div>

                  {/* Manual Metrics */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">Manual Metrics Configuration</h3>
                    <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                      <MetricsCard
                        metrics={[
                          { value: '95%', label: 'Process Time Reduction', color: '#10b981' },
                          { value: '12+', label: 'Legacy Projects Enhanced', color: '#f59e0b' },
                          { value: '2', label: 'Complete Applications Owned', color: '#3b82f6' }
                        ]}
                        layout="grid"
                        columns={3}
                        size="md"
                        backgroundColor="bg-slate-800/50"
                      />
                    </div>
                  </div>

                  {/* Different Layouts */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">Layout Options</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-2">Layout: Grid (3 columns)</p>
                        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                          <MetricsCard
                            metrics={[
                              { value: '95%', label: 'Efficiency', color: '#10b981' },
                              { value: '12+', label: 'Projects', color: '#f59e0b' },
                              { value: '100%', label: 'Success Rate', color: '#3b82f6' }
                            ]}
                            layout="grid"
                            columns={3}
                            size="sm"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-2">Layout: List (Stacked)</p>
                        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                          <MetricsCard
                            metrics={[
                              { value: '95%', label: 'Process Time Reduction', color: '#10b981' },
                              { value: '12+', label: 'Legacy Projects Enhanced', color: '#f59e0b' },
                              { value: '2', label: 'Apps Owned', color: '#3b82f6' }
                            ]}
                            layout="list"
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-emerald-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-emerald-400 mb-2">✅ Tier 1 Achievement</h3>
                <p className="text-slate-300">Previously: No metrics shown<br/>Now: Automatic extraction and display of achievement metrics (95%, 12+, etc) with multiple layout options</p>
              </div>
            </div>
          )}

          {/* COMBINED DEMO */}
          {activeTab === 'combined' && (
            <div className="space-y-8">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Combined Demo (JobInfoCard)</h2>
                <p className="text-slate-300 mb-6">All three components working together - what you see in the 3D scene</p>

                <div className="space-y-8">
                  {/* Tesla Current Role */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">{teslaRole.company} - {teslaRole.role}</h3>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-xl space-y-3">
                      {/* Header */}
                      <div className="border-b border-slate-700/50 pb-3">
                        <h2 className="text-lg font-bold" style={{ color: teslaRole.color }}>
                          {teslaRole.company}
                        </h2>
                        <p className="text-sm text-slate-300">{teslaRole.role}</p>
                      </div>

                      {/* Duration Bar */}
                      <div>
                        <DurationBar
                          startDate="Jan 2025"
                          endDate="Present"
                          color={teslaRole.color}
                          showLabel={true}
                          format="both"
                          animate={true}
                          metadata={{
                            label: 'Employment Duration'
                          }}
                        />
                      </div>

                      {/* Metrics Card */}
                      <div>
                        <MetricsCard
                          content={teslaRole.paragraphs.join(' ')}
                          layout="grid"
                          columns={2}
                          size="sm"
                          maxMetrics={3}
                          backgroundColor="bg-slate-800/50"
                          showBorder={true}
                        />
                      </div>

                      {/* Highlights */}
                      <div className="border-t border-slate-700/50 pt-3">
                        <p className="text-xs text-slate-400 mb-2 font-semibold uppercase">Key Skills & Achievements</p>
                        <HighlightsList
                          items={teslaRole.highlights}
                          color={teslaRole.color}
                          layout="wrapped"
                          textSize="xs"
                          bullet={true}
                        />
                      </div>

                      {/* Footer */}
                      <div className="text-xs text-slate-500 border-t border-slate-700/50 pt-3">
                        {teslaRole.paragraphs[0] && (
                          <p className="line-clamp-2 text-slate-400">
                            {teslaRole.paragraphs[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tesla Vision Role */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">{teslaVisionRole.company} - {teslaVisionRole.role}</h3>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-xl space-y-3">
                      {/* Header */}
                      <div className="border-b border-slate-700/50 pb-3">
                        <h2 className="text-lg font-bold" style={{ color: teslaVisionRole.color }}>
                          {teslaVisionRole.company}
                        </h2>
                        <p className="text-sm text-slate-300">{teslaVisionRole.role}</p>
                      </div>

                      {/* Duration Bar */}
                      <div>
                        <DurationBar
                          startDate="May 2023"
                          endDate="Jan 2025"
                          color={teslaVisionRole.color}
                          showLabel={true}
                          format="both"
                          animate={true}
                          metadata={{
                            label: 'Employment Duration'
                          }}
                        />
                      </div>

                      {/* Metrics Card */}
                      <div>
                        <MetricsCard
                          content={teslaVisionRole.paragraphs.join(' ')}
                          layout="grid"
                          columns={2}
                          size="sm"
                          maxMetrics={3}
                          backgroundColor="bg-slate-800/50"
                          showBorder={true}
                        />
                      </div>

                      {/* Highlights */}
                      <div className="border-t border-slate-700/50 pt-3">
                        <p className="text-xs text-slate-400 mb-2 font-semibold uppercase">Key Skills & Achievements</p>
                        <HighlightsList
                          items={teslaVisionRole.highlights}
                          color={teslaVisionRole.color}
                          layout="wrapped"
                          textSize="xs"
                          bullet={true}
                        />
                      </div>

                      {/* Footer */}
                      <div className="text-xs text-slate-500 border-t border-slate-700/50 pt-3">
                        {teslaVisionRole.paragraphs[0] && (
                          <p className="line-clamp-2 text-slate-400">
                            {teslaVisionRole.paragraphs[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-emerald-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-emerald-400 mb-2">✅ Complete Tier 1 Package</h3>
                <p className="text-slate-300">All improvements working together in one cohesive card design. These cards appear as 3D annotations in the resume scene when you navigate between jobs.</p>
                <p className="text-slate-400 text-sm mt-2">Visit <span className="font-mono">http://localhost:3000/resume-parallax</span> to see them in the 3D scene</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
