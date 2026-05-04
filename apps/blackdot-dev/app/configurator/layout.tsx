export default async function ConfiguratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth access level verified by middleware (proxy.ts)
  return children
}
