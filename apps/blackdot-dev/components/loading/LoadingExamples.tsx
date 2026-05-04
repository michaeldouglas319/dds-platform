'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLoading, useNavigationLoading, useLoadingOperation } from '@/lib/contexts/LoadingContext'
import { LoadingPresets } from './ThreeDLoadingOverlay'

/**
 * Example component demonstrating various loading overlay use cases
 * This component shows how to use the loading system in different scenarios
 */
export function LoadingExamples() {
  const router = useRouter()
  const { startLoading, stopLoading } = useLoading()
  const { startNavigation } = useNavigationLoading()
  const { withLoading } = useLoadingOperation()
  const [result, setResult] = useState<string>('')

  // Example 1: Manual loading control
  const handleManualLoading = async () => {
    startLoading('operation', {
      message: 'Processing your request...',
      submessage: 'This may take a few seconds',
      sphere: {
        color: '#10b981',
        emissiveIntensity: 0.8,
        pulseSpeed: 3,
      },
    })

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    stopLoading()
    setResult('Manual loading completed!')
  }

  // Example 2: Navigation loading
  const handleNavigation = (path: string) => {
    startNavigation()
    router.push(path)
    // Loading will auto-stop when pathname changes
  }

  // Example 3: Automatic loading with wrapper
  const handleAsyncOperation = async () => {
    const result = await withLoading(
      async () => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))
        return 'Operation successful!'
      },
      'data-load',
      {
        message: 'Fetching data...',
        submessage: 'Please wait',
      }
    )
    setResult(result)
  }

  // Example 4: Custom configuration
  const handleCustomLoading = async () => {
    startLoading('custom', {
      message: 'Custom Loading Experience',
      submessage: 'With custom sphere configuration',
      showProgressDots: true,
      sphere: {
        color: '#f59e0b',
        emissiveColor: '#f59e0b',
        emissiveIntensity: 1.0,
        scale: 0.5,
        pulseSpeed: 4,
        pulseIntensity: 0.5,
      },
      network: {
        scale: 1.2,
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 2500))
    stopLoading()
    setResult('Custom loading completed!')
  }

  // Example 5: Using presets
  const handlePresetLoading = async (presetName: string) => {
    const preset = LoadingPresets[presetName as keyof typeof LoadingPresets]
    startLoading('custom', preset)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    stopLoading()
    setResult(`${presetName} preset completed!`)
  }

  return (
    <div className="space-y-8 rounded-xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-white">Loading Overlay Examples</h2>
        <p className="text-sm text-white/60">
          Demonstrations of the 3D loading overlay system with neural network and sphere
        </p>
      </div>

      {/* Result Display */}
      {result && (
        <div className="rounded-lg bg-green-500/10 p-4 text-green-400 border border-green-500/20">
          {result}
        </div>
      )}

      {/* Examples Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Manual Control */}
        <div className="rounded-lg border border-white/10 bg-slate-800/50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-white">1. Manual Control</h3>
          <p className="mb-4 text-sm text-white/60">
            Start and stop loading manually with custom configuration
          </p>
          <button
            onClick={handleManualLoading}
            className="w-full rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600"
          >
            Start Manual Loading
          </button>
        </div>

        {/* Navigation Loading */}
        <div className="rounded-lg border border-white/10 bg-slate-800/50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-white">2. Navigation Loading</h3>
          <p className="mb-4 text-sm text-white/60">
            Show loading during page navigation (auto-stops on route change)
          </p>
          <button
            onClick={() => handleNavigation('/dashboard')}
            className="w-full rounded-lg bg-purple-500 px-4 py-2 font-medium text-white transition hover:bg-purple-600"
          >
            Navigate with Loading
          </button>
        </div>

        {/* Async Wrapper */}
        <div className="rounded-lg border border-white/10 bg-slate-800/50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-white">3. Async Wrapper</h3>
          <p className="mb-4 text-sm text-white/60">
            Automatically wrap async operations with loading state
          </p>
          <button
            onClick={handleAsyncOperation}
            className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-medium text-white transition hover:bg-cyan-600"
          >
            Execute Async Operation
          </button>
        </div>

        {/* Custom Configuration */}
        <div className="rounded-lg border border-white/10 bg-slate-800/50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-white">4. Custom Config</h3>
          <p className="mb-4 text-sm text-white/60">
            Fully customized sphere, network, and message configuration
          </p>
          <button
            onClick={handleCustomLoading}
            className="w-full rounded-lg bg-amber-500 px-4 py-2 font-medium text-white transition hover:bg-amber-600"
          >
            Custom Loading
          </button>
        </div>
      </div>

      {/* Preset Examples */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">5. Preset Configurations</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {Object.keys(LoadingPresets).map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetLoading(preset)}
              className="rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700/50"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Code Example */}
      <div className="rounded-lg border border-white/10 bg-slate-950/80 p-6">
        <h3 className="mb-3 text-lg font-semibold text-white">Usage Example</h3>
        <pre className="overflow-x-auto text-xs text-white/80">
{`import { useLoading } from '@/lib/contexts/LoadingContext'

function MyComponent() {
  const { startLoading, stopLoading } = useLoading()

  const handleClick = async () => {
    startLoading('operation', {
      message: 'Processing...',
      sphere: { color: '#3b82f6' }
    })

    await someAsyncOperation()
    stopLoading()
  }

  return <button onClick={handleClick}>Click Me</button>
}`}
        </pre>
      </div>
    </div>
  )
}
