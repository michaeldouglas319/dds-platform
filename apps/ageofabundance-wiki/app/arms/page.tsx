import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const ArmsDrilldown = dynamic(
  () => import('../../components/arms-drilldown').then(m => m.ArmsDrilldown),
  { ssr: false, loading: () => <div style={{ width: '100%', height: '100vh', background: '#0a0a0a' }} /> }
)

export const metadata: Metadata = {
  title: 'Abundance at Arms — Global Conflict Map',
  description:
    'Global conflict mapping with real-time intelligence, data layers, and source integration.',
  robots: 'noindex, nofollow',
}

export default function ArmsPage() {
  return <ArmsDrilldown />
}
