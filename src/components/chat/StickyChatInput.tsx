'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { FormEvent, MutableRefObject } from 'react';

type StickyChatInputProps = {
  visible: boolean;
  input: string;
  setInput: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
  isAnimating: boolean;
  chatInputRef: MutableRefObject<HTMLInputElement | null>;
  isKeyboardOpen: boolean;
};

export default function StickyChatInput({
  visible,
  input,
  setInput,
  onSubmit,
  isLoading,
  isAnimating,
  chatInputRef,
  isKeyboardOpen,
}: StickyChatInputProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed left-0 right-0 z-50 p-4 ${
            isKeyboardOpen ? 'bottom-0' : 'bottom-0'
          }`}
          data-element="sticky-chat-footer"
          title="Sticky Chat Input Footer"
          style={{
            bottom: isKeyboardOpen ? '0px' : '0px',
            transform: isKeyboardOpen ? 'translateY(0)' : 'translateY(0)'
          }}
        >
          <div className="max-w-4xl mx-auto">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim() || isLoading || isAnimating) return;
              onSubmit(e);
            }} className="relative">
              <input
                ref={chatInputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (isLoading || isAnimating)) {
                    e.preventDefault();
                  }
                }}
                onFocus={() => {
                  if (window.innerWidth <= 768) {
                    setTimeout(() => {
                      if (chatInputRef.current) {
                        chatInputRef.current.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'center' 
                        });
                      }
                    }, 300);
                  }
                }}
                placeholder="Ask me anything..."
                className="w-full px-6 py-4 bg-gray-800 border border-white/20 rounded-full text-white placeholder-gray-300 focus:outline-none focus:border-white/40"
                data-element="chat-input-sticky"
                title="Chat input - sticky footer"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || isAnimating}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors duration-200"
                data-element="chat-submit-sticky"
                title="Send message - sticky footer"
              >
                <ArrowUp size={20} />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



