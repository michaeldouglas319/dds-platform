"use client"

import { getSectionsByPage } from "@/lib/config/content/sections"
import { PageHeader } from "@/components/shared/layout/page-header"

export default function AboutPage() {
  const sections = getSectionsByPage("about")
  const mainSection = sections[0]

  if (!mainSection) {
    return <div>No about data found</div>
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader section={mainSection} showBackButton={false} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          {mainSection.content?.paragraphs?.map((para: string | { description: string }, idx: number) => (
            <p key={idx} className="text-base text-foreground/80 leading-relaxed">
              {typeof para === 'string' ? para : para.description}
            </p>
          ))}
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Core Skills</h3>
          <div className="grid grid-cols-2 gap-4">
            {["React", "Three.js", "TypeScript", "Node.js", "Tailwind CSS", "WebGL", "Next.js", "PostgreSQL"].map(
              (skill) => (
                <div key={skill} className="p-4 rounded-lg bg-accent/10 border border-border">
                  <p className="font-semibold text-sm">{skill}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
