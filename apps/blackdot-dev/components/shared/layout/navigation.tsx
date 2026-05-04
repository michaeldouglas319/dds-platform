"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home } from "lucide-react"
import { motion } from "framer-motion"

export function Navigation() {
  const pathname = usePathname()

  // Don't show navigation on landing page
  if (pathname === "/") {
    return null
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="absolute top-4 right-4 z-50 pointer-events-auto">
        <Link href="/">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 flex items-center justify-center bg-background/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-background/60 transition-colors cursor-pointer"
          >
            <Home className="w-5 h-5 text-foreground" />
          </motion.div>
        </Link>
      </div>
    </nav>
  )
}
