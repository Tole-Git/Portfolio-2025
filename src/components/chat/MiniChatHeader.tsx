'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '@/components/shared/types';
import { MutableRefObject } from 'react';

type MiniChatHeaderProps = {
  visible: boolean;
  isMiniHeaderExpanded: boolean;
  setIsMiniHeaderExpanded: (v: boolean) => void;
  messages: Message[];
  isLoading: boolean;
  miniMessagesEndRef: MutableRefObject<HTMLDivElement | null>;
};

export default function MiniChatHeader({
  visible,
  isMiniHeaderExpanded,
  setIsMiniHeaderExpanded,
  messages,
  isLoading,
  miniMessagesEndRef,
}: MiniChatHeaderProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-14 left-0 right-0 z-40 bg-white/5 backdrop-blur-md border-b border-white/5"
          data-element="mini-chat-header"
          title="Mini Chat Messages"
        >
          <div className={`transition-all duration-300 ease-in-out ${
            isMiniHeaderExpanded ? 'h-[20vh]' : 'h-12'
          }`}>
            <div className="flex items-center justify-between px-4 py-2 border-white/10">
              <div className="flex items-center space-x-2">
                <MessageSquare size={16} className="text-gray-300" />
                <span className="text-sm text-gray-300">Chat Messages</span>
                <span className="text-xs text-gray-400">({messages.length})</span>
              </div>
              <button
                onClick={() => setIsMiniHeaderExpanded(!isMiniHeaderExpanded)}
                className="p-1 hover:bg-white/10 rounded transition-colors duration-200"
                data-element="mini-chat-toggle"
                title={`${isMiniHeaderExpanded ? 'Collapse' : 'Expand'} mini chat`}
              >
                {isMiniHeaderExpanded ? (
                  <ChevronUp size={16} className="text-gray-300" />
                ) : (
                  <ChevronDown size={16} className="text-gray-300" />
                )}
              </button>
            </div>
            {isMiniHeaderExpanded && (
              <div className="h-[calc(20vh-3rem)] overflow-y-auto px-4 py-2 space-y-2" data-element="mini-chat-messages" title="Mini Chat Messages Container">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`text-xs ${
                      message.role === 'user'
                        ? 'p-2 rounded-lg bg-gray-700/50 border border-white/30 ml-auto max-w-[60%] min-w-[20%] w-fit shadow-md shadow-white/10'
                        : 'p-2 rounded-lg mr-auto max-w-screen bg-black'
                    }`}
                    data-element={`mini-message-${message.role}`}
                    data-message-id={message.id}
                    title={`${message.role === 'user' ? 'User' : 'AI'} message in mini chat`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-white whitespace-pre-wrap break-words">{message.content}</p>
                    ) : (
                      <div className="text-gray-100 prose prose-xs prose-invert max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="bg-gray-700/80 p-2 rounded-lg mr-auto w-fit">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
                <div ref={miniMessagesEndRef} />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



