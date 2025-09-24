'use client';

import { motion } from 'framer-motion';
import { getTagClass } from '@/components/shared/tags';

export default function ProjectsSkills() {
  return (
    <section id="projects-skills" className="min-h-screen flex items-center px-8">
      <motion.div
        className="max-w-6xl mx-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="border-t border-gray-600 pt-8 mb-12">
          <h2 className="text-sm font-medium text-gray-400 tracking-widest uppercase">PROJECTS & SKILLS</h2>
        </div>

        <div className="mb-20">
          <div className="space-y-12">
            <div className="border-b border-gray-700 pb-12">
              <div className="flex items-center text-sm text-gray-400 mb-4">
                <span>June 2025 - PRESENT</span>
                <div className="w-2 h-2 bg-green-500 rounded-full mx-4"></div>
              </div>
              <h3 className="text-3xl font-light text-white mb-4">AI Receptionist System</h3>
              <p className="text-lg text-gray-300 leading-relaxed mb-6 max-w-4xl">
                Developed intelligent voice-activated receptionist with real-time speech processing and 
                natural language understanding using Node.js, Twilio, Google Cloud Speech, and Gemini API.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('Node.js')}`}>Node.js</span>
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('Twilio')}`}>Twilio</span>
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('Google Cloud Speech')}`}>Google Cloud Speech</span>
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('Gemini API')}`}>Gemini API</span>
              </div>
            </div>

            <div className="border-b border-gray-700 pb-12">
              <div className="flex items-center text-sm text-gray-400 mb-4">
                <span>April 2025 - PRESENT</span>
                <div className="w-2 h-2 bg-green-500 rounded-full mx-4"></div>
              </div>
              <h3 className="text-3xl font-light text-white mb-4">Medical AI Analysis Platform</h3>
              <p className="text-lg text-gray-300 leading-relaxed mb-6 max-w-4xl">
                Created AI system for automated bloodwork analysis, parsing medical documents and 
                generating structured health insights with Python and AI/ML APIs.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('Python')}`}>Python</span>
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('AI/ML APIs')}`}>AI/ML APIs</span>
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('Document Processing')}`}>Document Processing</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-light text-white mb-8">Technical Skills</h3>
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h4 className="font-medium mb-4 text-white">AI/ML Technologies</h4>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('OpenAI API')}`}>OpenAI API</span>
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('Azure OpenAI')}`}>Azure OpenAI</span>
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('Google Gemini')}`}>Google Gemini</span>
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('RAG')}`}>RAG</span>
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('Vector Search')}`}>Vector Search</span>
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('MCP Protocol')}`}>MCP Protocol</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-white">Programming Languages</h4>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('Python')}`}>Python</span>
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('JavaScript')}`}>JavaScript</span>
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('Node.js')}`}>Node.js</span>
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('Java')}`}>Java</span>
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('SQL')}`}>SQL</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-white">Frameworks & Libraries</h4>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('React')}`}>React</span>
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('Streamlit')}`}>Streamlit</span>
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('Express')}`}>Express</span>
                <span className={`px-3 py-1 text-xs rounded ${getTagClass('jQuery')}`}>jQuery</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}


