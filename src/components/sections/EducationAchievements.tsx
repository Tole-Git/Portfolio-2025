'use client';

import { motion } from 'framer-motion';
import uwLogo from '@/app/assets/uw-logo.png';

export default function EducationAchievements() {
  return (
    <section id="education-achievements" className="min-h-screen flex items-center px-8">
      <motion.div
        className="max-w-6xl mx-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="border-t border-gray-600 pt-8 mb-12">
          <h2 className="text-sm font-medium text-gray-400 tracking-widest uppercase">EDUCATION & ACHIEVEMENTS</h2>
        </div>

        <div className="mb-20 border-b border-gray-700 pb-16">
          <div className="flex items-center text-sm text-gray-400 mb-4">
            <span>GRADUATED JUNE 2022</span>
            <span className="mx-4"></span>
            <span>TACOMA, WA</span>
          </div>
          <h3 className="text-4xl font-light text-white mb-2">
            <span className="glow-purple-subtle inline-block">
              <span className="align-middle inline-block mr-2" style={{ width: '1.14em', height: '1.14em', transform: 'translateY(-4px)' }}>
                <img src={uwLogo.src ?? (uwLogo as any)} alt="UW Logo" className="w-full h-full object-contain" />
              </span>
              <span className="text-white font-semibold">University of Washington</span>
            </span>
          </h3>
          <h4 className="text-xl text-gray-300 mb-8">Bachelor of Science in Computer Science & Systems</h4>
          <p className="text-lg text-gray-300 leading-relaxed max-w-4xl">
            Relevant Coursework: Algorithms, Artificial Intelligence, Advanced Software Engineering, 
            Matrix Algebra, Data Structures, Computer Architecture, Probability & Statistics, Machine Learning Fundamentals
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-light text-white mb-8">Key Achievements</h3>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Production Scale</h4>
                <p className="text-gray-300">4,000+ monthly active users on AI systems</p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Innovation Leadership</h4>
                <p className="text-gray-300">First in organization to implement MCP protocol</p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Early Adoption</h4>
                <p className="text-gray-300">Enterprise AI developer since August 2023</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Career Acceleration</h4>
                <p className="text-gray-300">Promoted 1 year early due to AI copilot success</p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Cross-Functional Impact</h4>
                <p className="text-gray-300">Delivered AI solutions across multiple divisions</p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Technical Innovation</h4>
                <p className="text-gray-300">Pioneered agent-to-agent communication and dynamic UI generation</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}


