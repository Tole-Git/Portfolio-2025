'use client';

import { motion } from 'framer-motion';

export default function Summary() {
  return (
    <section id="summary" className="min-h-screen flex items-center px-8">
      <motion.div
        className="max-w-6xl mx-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="border-t border-gray-600 pt-8 mb-8">
          <h2 className="text-sm font-medium text-gray-400 tracking-widest uppercase mb-8">SUMMARY</h2>
        </div>
        <p className="text-2xl leading-relaxed text-gray-300 max-w-4xl">
          AI Engineer with 3+ years of production AI development experience, serving 4,000+ monthly active users. 
          Early enterprise OpenAI API adopter (August 2023) with expertise in agent-to-agent communication, 
          MCP protocol implementation, and full-stack AI applications. Specialized in building scalable AI copilots, 
          real-time voice systems, and custom agent architectures for enterprise environments.
        </p>
      </motion.div>
    </section>
  );
}



