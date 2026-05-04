"use client"

import React from 'react';
import { X } from 'lucide-react';
import type { JobSection } from '@/app/constants/resumeData.config';

interface JobInfoPanelProps {
  job: JobSection | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Job Info Panel Component
 *
 * Displays detailed information about a selected job position.
 * Inspired by Plateforme 10's info panel design.
 *
 * Features:
 * - Slide-in animation from right
 * - Responsive design (mobile & desktop)
 * - Graceful handling of missing data
 * - Close button and overlay click to dismiss
 */
export function JobInfoPanel({ job, isOpen, onClose }: JobInfoPanelProps) {
  if (!job) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-500 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-md border-b border-white/10">
            <div className="flex items-start justify-between p-6">
              <div className="flex-1">
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                  style={{
                    backgroundColor: job.color ? `${job.color}20` : '#3b82f620',
                    color: job.color || '#3b82f6',
                    border: `1px solid ${job.color || '#3b82f6'}40`,
                  }}
                >
                  {job.period || 'N/A'}
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {job.role || 'Position'}
                </h2>
                <p className="text-lg text-gray-300">
                  {job.company || 'Company'}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close panel"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Heading */}
            {job.content?.heading && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {job.content.heading}
                </h3>
                <div
                  className="h-1 w-20 rounded-full"
                  style={{ backgroundColor: job.color || '#3b82f6' }}
                />
              </div>
            )}

            {/* Description paragraphs */}
            {job.content?.paragraphs && job.content.paragraphs.length > 0 ? (
              <div className="space-y-4">
                {job.content.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-gray-300 leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No description available.</p>
            )}

            {/* Highlights */}
            {job.content?.highlights && job.content.highlights.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">
                  Key Highlights
                </h4>
                <ul className="space-y-2">
                  {job.content.highlights.map((highlight, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-300"
                    >
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: job.color || '#3b82f6' }}
                      />
                      <span className="flex-1">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Image (if available) */}
            {job.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-white/10">
                <img
                  src={job.imageUrl}
                  alt={`${job.company} - ${job.role}`}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    // Gracefully handle missing images
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
