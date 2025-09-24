'use client';

import { motion } from 'framer-motion';
import { getTagColor } from '@/components/shared/tags';

export default function Experience() {
  return (
    <section id="experience" className="min-h-screen flex items-center px-8">
      <motion.div
        className="max-w-6xl mx-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="border-t border-gray-600 pt-8 mb-12">
          <h2 className="text-sm font-medium text-gray-400 tracking-widest uppercase">EXPERIENCE</h2>
        </div>

        <div className="space-y-16">
          <div className="border-b border-gray-700 pb-16">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center text-sm text-gray-400 mb-2">
                  <span>2024 - PRESENT</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full mx-4"></div>
                  <span>BELLEVUE, WA</span>
                </div>
              </div>
            </div>

            <h3 className="text-4xl font-light text-white mb-2">T-Mobile</h3>
            <h4 className="text-xl text-gray-300 mb-8">Software Engineer</h4>

            <p className="text-lg text-gray-300 leading-relaxed mb-6 max-w-4xl">
              Architect and maintain AI copilot serving 4,000+ unique monthly users. First engineer in organization to implement Model Context Protocol (MCP). Built custom agent-to-agent communication systems and developed actionable AI tools including automated ticket creation.
            </p>

            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 text-xs rounded ${getTagColor('OpenAI API')}`}>OpenAI API</span>
              <span className={`px-3 py-1 text-xs rounded ${getTagColor('MCP Protocol')}`}>MCP Protocol</span>
              <span className={`px-3 py-1 text-xs rounded ${getTagColor('Agent Architecture')}`}>Agent Architecture</span>
              <span className={`px-3 py-1 text-xs rounded ${getTagColor('Full-Stack')}`}>Full-Stack</span>
            </div>
          </div>

          <div className="border-b border-gray-700 pb-16">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center text-sm text-gray-400 mb-2">
                  <span>2022 - 2024</span>
                  <span className="mx-4"></span>
                  <span>BELLEVUE, WA</span>
                </div>
              </div>
            </div>

            <h3 className="text-4xl font-light text-white mb-2">T-Mobile</h3>
            <h4 className="text-xl text-gray-300 mb-8">Associate Software Engineer</h4>

            <p className="text-lg text-gray-300 leading-relaxed mb-6 max-w-4xl">
              First to develop enterprise OpenAI API integration (August 2023). Led frontend development of AI troubleshooting interface. Designed and implemented Retrieval-Augmented Generation. Promoted 1 year ahead of standard timeline.
            </p>

            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 text-xs rounded ${getTagColor('React')}`}>React</span>
              <span className={`px-3 py-1 text-xs rounded ${getTagColor('TypeScript')}`}>TypeScript</span>
              <span className={`px-3 py-1 text-xs rounded ${getTagColor('RAG')}`}>RAG</span>
              <span className={`px-3 py-1 text-xs rounded ${getTagColor('AI Integration')}`}>AI Integration</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}


