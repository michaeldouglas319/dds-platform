"use client"

import { Suspense, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { getSectionsByPage } from "@/lib/config/content"
import { PageHeader } from "@/components/shared/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { use } from "react"
import { SceneErrorBoundary } from "@/components/SceneErrorBoundary"
import { NeuralNetworkScene } from '@/app/resumev3/scene/components/NeuralNetworkScene'
import type { UnifiedSection } from "@/lib/config/content"

interface DetailPageProps {
  params: Promise<{ sectionId: string }>
}

export default function BusinessSectionDetailPage({ params }: DetailPageProps) {
  const { sectionId } = use(params)
  const router = useRouter()

  const section = useMemo(() => {
    const sections = getSectionsByPage('business')
    return sections.find((s) => s.id === sectionId)
  }, [sectionId])

  if (!section) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 z-0">
          <SceneErrorBoundary>
            <Canvas
              shadows
              dpr={[1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1]}
              camera={{ position: [0, 0, 1.1], fov: 50 }}
              gl={{ 
                antialias: true,
                powerPreference: 'high-performance',
                preserveDrawingBuffer: false,
                alpha: true,
              }}
            >
              <Suspense fallback={null}>
                <NeuralNetworkScene particleCountMultiplier={0.5} />
              </Suspense>
            </Canvas>
          </SceneErrorBoundary>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg p-8 border border-border/50 shadow-lg">
            <Button variant="ghost" onClick={() => router.back()} className="gap-2 mb-8">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <div>Section not found</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* 3D Background Scene */}
      <div className="fixed inset-0 z-0">
        <SceneErrorBoundary>
          <Canvas
            shadows
            dpr={[1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1]}
            camera={{ position: [0, 0, 1.1], fov: 50 }}
            gl={{ 
              antialias: true,
              powerPreference: 'high-performance',
              preserveDrawingBuffer: false,
              alpha: true,
            }}
          >
            <Suspense fallback={null}>
              <NeuralNetworkScene particleCountMultiplier={0.6} />
            </Suspense>
          </Canvas>
        </SceneErrorBoundary>
      </div>

      {/* Content Overlay */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-8 border border-border/50 shadow-lg space-y-8">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {/* Page Header */}
          <PageHeader section={section} showBackButton={false} />

          {/* Subtitle */}
          {section.subtitle && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium">{section.subtitle}</span>
            </div>
          )}

          {/* Image */}
          {section.imageUrl && (
            <div className="rounded-lg overflow-hidden h-96 border border-border/50">
              <img 
                src={section.imageUrl || "/placeholder.svg"} 
                alt={section.title || "Section"} 
                className="w-full h-full object-cover" 
              />
            </div>
          )}

          {/* Content Heading */}
          {section.content?.heading && (
            <h2 className="text-2xl font-bold">{section.content.heading}</h2>
          )}

          {/* Paragraphs */}
          {section.content?.paragraphs && section.content.paragraphs.length > 0 && (
            <div className="space-y-6">
              {section.content.paragraphs.map((para, idx) => {
                if (typeof para === 'string') {
                  return (
                    <p key={idx} className="text-base text-foreground/80 leading-relaxed">
                      {para}
                    </p>
                  );
                } else {
                  return (
                    <div key={idx} className="space-y-2">
                      <h4 className="font-semibold text-foreground">{para.subtitle}</h4>
                      <p className="text-base text-foreground/80 leading-relaxed">{para.description}</p>
                      {para.citations && para.citations.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          {para.citations.map((citation, cIdx) => (
                            <a key={cIdx} href={citation.url} target="_blank" rel="noopener noreferrer" className="underline">
                              {citation.text}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
              })}
            </div>
          )}

          {/* Stats */}
          {section.content?.stats && section.content.stats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {section.content.stats.map((stat, idx) => (
                <div key={idx} className="bg-muted/50 rounded-lg p-4 border border-border/50">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Features */}
          {section.content?.features && section.content.features.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Key Features</h3>
              <ul className="space-y-2">
                {section.content.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-base text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Highlights */}
          {section.content?.highlights && section.content.highlights.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Key Points</h3>
              <div className="flex flex-wrap gap-2">
                {section.content.highlights.map((highlight, idx) => {
                  if (typeof highlight === 'string') {
                    return (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {highlight}
                      </Badge>
                    );
                  } else {
                    return (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {highlight.subtitle}: {highlight.description}
                      </Badge>
                    );
                  }
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

