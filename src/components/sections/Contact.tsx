'use client';

import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <section id="contact" className="min-h-screen flex items-center px-8">
      <motion.div
        className="max-w-6xl mx-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="border-t border-gray-600 pt-8 mb-12">
          <h2 className="text-sm font-medium text-gray-400 tracking-widest uppercase">CONTACT</h2>
        </div>

        <div className="mb-16">
          <h3 className="text-6xl font-light text-white mb-8 leading-tight">HAVE AN<br />OPPORTUNITY?</h3>
          <p className="text-xl text-gray-300 max-w-4xl leading-relaxed">
            I'm open to new roles, freelance projects, and creative collaborations! If you have an idea you'd like to discuss, let's get in touch.
          </p>
        </div>

        <div className="mb-12">
          <a href="mailto:inquiries@tonytle.dev" className="text-3xl text-white hover:text-gray-300 transition-colors duration-200">
            inquiries@tonytle.dev
          </a>
        </div>
        <div className="flex space-x-8">
          <a 
            href="https://github.com/Tole-Git" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2"
          >
            <span>GitHub</span>
          </a>
          <a 
            href="https://www.linkedin.com/in/letan87262910/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2"
          >
            <span>LinkedIn</span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}


