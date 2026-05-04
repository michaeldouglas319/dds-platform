'use client';

import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onSelectProduct?: () => void;
}

/**
 * Empty state when no product is selected
 * Prompts user to select a product to begin configuration
 */
export function EmptyState({ onSelectProduct }: EmptyStateProps) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <Package className="w-16 h-16 text-blue-500" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center max-w-md"
        >
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            No Product Selected
          </h2>
          <p className="text-sm text-muted-foreground">
            Select a product from the library to begin configuring and visualizing in 3D.
          </p>
        </motion.div>

        {onSelectProduct && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={onSelectProduct}
              variant="default"
              size="lg"
              className="gap-2"
            >
              <Package className="w-4 h-4" />
              Browse Products
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
