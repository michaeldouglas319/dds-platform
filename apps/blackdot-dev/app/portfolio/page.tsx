'use client';

/**
 * Portfolio Showcase Page - Sunny Patel
 *
 * Renders complete portfolio with:
 * - Hero section with centered title and description
 * - Professional experience, education, skills, and projects sections
 * - Scroll-triggered fade-in animations using Framer Motion
 * - Dark theme with brand colors and section spacing
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  resumeJobsPatel,
  educationEntriesPatel,
  skillCategoriesPatel,
  portfolioProjectsPatel,
} from '@/lib/config/content';
// TODO: Restore these imports when /shared-comp-showcase components are implemented
// import PortfolioExperienceRenderer from '@/app/shared-comp-showcase/components/PortfolioExperienceRenderer';
// import PortfolioEducationRenderer from '@/app/shared-comp-showcase/components/PortfolioEducationRenderer';
// import PortfolioSkillsRenderer from '@/app/shared-comp-showcase/components/PortfolioSkillsRenderer';
// import PortfolioProjectsRenderer from '@/app/shared-comp-showcase/components/PortfolioProjectsRenderer';

function SectionWrapper({ children, id }: { children: React.ReactNode; id: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.2, once: false });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      id={id}
    >
      {children}
    </motion.div>
  );
}

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Nav to Landing Pages */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <a href="/portfolio/landing" className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">Landing Router</a>
        <a href="/portfolio/landing/v1" className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors">V1</a>
        <a href="/portfolio/landing/v2" className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors">V2</a>
        <a href="/portfolio/landing/v3" className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors">V3</a>
        <a href="/portfolio/landing/v4" className="px-3 py-2 text-sm bg-emerald-700 hover:bg-emerald-600 text-white rounded transition-colors">V4 WebGPU</a>
      </div>
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-b from-blue-600/20 via-transparent to-transparent" />
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
              Sunny Patel
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-2xl md:text-3xl font-semibold text-blue-300 mb-6">
              Full-Stack Developer & Software Engineer
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
              Building scalable applications with modern web technologies. Currently interning at IBM.
              Passionate about 3D graphics, cloud infrastructure, and cybersecurity.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex justify-center gap-4 flex-wrap"
          >
            <a
              href="#experience"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              View Experience
            </a>
            <a
              href="#projects"
              className="px-6 py-3 border border-blue-400 text-blue-300 hover:bg-blue-600/10 font-semibold rounded-lg transition-colors"
            >
              See Projects
            </a>
          </motion.div>
        </div>
      </section>

      {/* Experience Section */}
      <SectionWrapper id="experience">
        <section className="w-full py-24 px-4 bg-gradient-to-b from-slate-900/50 to-slate-950">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <div className="inline-block relative">
                <h2 className="text-5xl font-bold text-white">Experience</h2>
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 w-32" />
              </div>
              <p className="text-gray-400 mt-4 text-lg">Professional journey and work history</p>
            </div>
            {/* <PortfolioExperienceRenderer jobs={resumeJobsPatel} /> */}
            <div className="text-gray-400 text-center py-8">Experience section - component removed</div>
          </div>
        </section>
      </SectionWrapper>

      {/* Education Section */}
      <SectionWrapper id="education">
        <section className="w-full py-24 px-4 bg-slate-950">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <div className="inline-block relative">
                <h2 className="text-5xl font-bold text-white">Education</h2>
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 w-32" />
              </div>
              <p className="text-gray-400 mt-4 text-lg">Academic background and coursework</p>
            </div>
            {/* <PortfolioEducationRenderer entries={educationEntriesPatel} /> */}
            <div className="text-gray-400 text-center py-8">Education section - component removed</div>
          </div>
        </section>
      </SectionWrapper>

      {/* Skills Section */}
      <SectionWrapper id="skills">
        <section className="w-full py-24 px-4 bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <div className="inline-block relative">
                <h2 className="text-5xl font-bold text-white">Skills</h2>
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 w-32" />
              </div>
              <p className="text-gray-400 mt-4 text-lg">Technologies and expertise</p>
            </div>
            {/* <PortfolioSkillsRenderer categories={skillCategoriesPatel} /> */}
            <div className="text-gray-400 text-center py-8">Skills section - component removed</div>
          </div>
        </section>
      </SectionWrapper>

      {/* Projects Section */}
      <SectionWrapper id="projects">
        <section className="w-full py-24 px-4 bg-slate-900">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <div className="inline-block relative">
                <h2 className="text-5xl font-bold text-white">Projects</h2>
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 w-32" />
              </div>
              <p className="text-gray-400 mt-4 text-lg">Featured work and side projects</p>
            </div>
            {/* <PortfolioProjectsRenderer projects={portfolioProjectsPatel} /> */}
            <div className="text-gray-400 text-center py-8">Projects section - component removed</div>
          </div>
        </section>
      </SectionWrapper>

      {/* Footer */}
      <footer className="w-full py-12 px-4 border-t border-slate-700 bg-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400">Built with Next.js, React Three Fiber, and Tailwind CSS</p>
          <p className="text-gray-600 text-sm mt-2">© 2024 Sunny Patel. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
