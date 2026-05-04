import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Physics-Based Character Controller | DDS V3',
  description:
    'Learn how to build a physics-based character controller with AI-assisted development. Interactive tutorial by Ian Curtis covering capsule physics, raycasting, animation states, and cross-platform input.',
  keywords: [
    'physics',
    'character controller',
    'game development',
    'three.js',
    'webgl',
    'AI',
    'tutorial',
  ],
  authors: [{ name: 'Ian Curtis' }],
  openGraph: {
    title: 'Physics-Based Character Controller | DDS V3',
    description:
      'Learn how to build a physics-based character controller with AI-assisted development.',
    type: 'article',
    url: 'https://dds-v3.vercel.app/demos/physics-character-controller',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Physics-Based Character Controller',
    description:
      'Interactive tutorial on building physics-based character controllers.',
  },
}

export default function PhysicsCharacterControllerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
