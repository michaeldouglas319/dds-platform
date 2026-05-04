'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { LoadingScene } from './LoadingScene'
import { Suspense } from 'react'

export interface LoadingOverlayConfig {
  /** Custom loading message */
  message?: string
  /** Submessage/detail text */
  submessage?: string
  /** Show progress dots animation */
  showProgressDots?: boolean
  /** Sphere configuration */
  sphere?: {
    color?: string
    emissiveColor?: string
    emissiveIntensity?: number
    scale?: number
    pulseSpeed?: number
    pulseIntensity?: number
  }
  /** Neural network configuration */
  network?: {
    scale?: number
  }
  /** Background gradient colors */
  background?: {
    from?: string
    via?: string
    to?: string
  }
}

interface ThreeDLoadingOverlayProps {
  /** Whether the overlay is visible */
  isLoading: boolean
  /** Configuration for the overlay appearance */
  config?: LoadingOverlayConfig
}

/**
 * Full-screen 3D loading overlay with neural network and center sphere
 * Designed for use during navigation, async operations, and route loading
 */
export function ThreeDLoadingOverlay({
  isLoading,
  config = {}
}: ThreeDLoadingOverlayProps) {
  const {
    message = 'Loading...',
    submessage,
    showProgressDots = true,
    sphere,
    network,
    background = {},
  } = config

  const backgroundConfig = {
    from: background.from || 'slate-950',
    via: background.via || 'blue-950',
    to: background.to || 'slate-950',
  }

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            background: `linear-gradient(135deg,
              rgb(2 6 23 / 0.98),
              rgb(23 37 84 / 0.98),
              rgb(2 6 23 / 0.98)
            )`,
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* 3D Scene Background */}
          <div className="absolute inset-0">
            <Suspense fallback={null}>
              <LoadingScene
                sphere={sphere}
                network={network}
                camera={{ position: [0, 0, 8], fov: 50 }}
                lighting={{ ambientIntensity: 0.4, pointLightIntensity: 1 }}
              />
            </Suspense>
          </div>

          {/* Content Overlay */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="relative z-10 flex flex-col items-center gap-6"
          >
            {/* Main Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h2 className="text-2xl font-semibold text-white/90">
                {message}
              </h2>
              {submessage && (
                <p className="mt-2 text-sm text-white/60">
                  {submessage}
                </p>
              )}
            </motion.div>

            {/* Progress Dots */}
            {showProgressDots && (
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeInOut',
                    }}
                    className="h-3 w-3 rounded-full bg-blue-400"
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Vignette Effect */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 100%)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Preset configurations for common loading scenarios
export const LoadingPresets = {
  navigation: {
    message: 'Loading page...',
    sphere: {
      color: '#3b82f6',
      emissiveColor: '#3b82f6',
      emissiveIntensity: 0.6,
      scale: 0.3,
    },
  } as LoadingOverlayConfig,

  routeRegistry: {
    message: 'Loading routes...',
    submessage: 'Configuring navigation',
    sphere: {
      color: '#8b5cf6',
      emissiveColor: '#8b5cf6',
      emissiveIntensity: 0.7,
      scale: 0.35,
    },
  } as LoadingOverlayConfig,

  authCheck: {
    message: 'Verifying access...',
    submessage: 'Checking permissions',
    sphere: {
      color: '#06b6d4',
      emissiveColor: '#06b6d4',
      emissiveIntensity: 0.5,
      scale: 0.28,
      pulseSpeed: 3,
    },
  } as LoadingOverlayConfig,

  operation: {
    message: 'Processing...',
    sphere: {
      color: '#10b981',
      emissiveColor: '#10b981',
      emissiveIntensity: 0.6,
      scale: 0.3,
      pulseSpeed: 2.5,
    },
  } as LoadingOverlayConfig,

  dataLoad: {
    message: 'Loading data...',
    sphere: {
      color: '#f59e0b',
      emissiveColor: '#f59e0b',
      emissiveIntensity: 0.7,
      scale: 0.32,
    },
  } as LoadingOverlayConfig,
} as const
