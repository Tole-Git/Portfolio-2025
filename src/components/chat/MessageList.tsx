'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Message } from '@/components/shared/types';
import { MutableRefObject } from 'react';

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
  chatAtBottom: boolean;
  isKeyboardOpen: boolean;
  viewportHeight: number;
  messagesEndRef: MutableRefObject<HTMLDivElement | null>;
};

export default function MessageList({
  messages,
  isLoading,
  chatAtBottom,
  isKeyboardOpen,
  viewportHeight,
  messagesEndRef,
}: MessageListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`overflow-y-auto space-y-4 ${
        chatAtBottom 
          ? `flex-1 h-full px-8 pt-20 ${
              isKeyboardOpen 
                ? 'pb-24' 
                : 'pb-4' 
            }` 
          : 'max-h-96 mb-6 px-4'
      }`}
      style={{
        maxHeight: isKeyboardOpen && chatAtBottom 
          ? `${viewportHeight - 200}px`
          : undefined
      }}
      data-chat-container
    >
      {messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl ${
            message.role === 'user'
              ? 'bg-gray-700/50 border border-white/30 ml-auto max-w-xs w-fit min-w-[20%]'
              : 'mr-auto max-w-screen'
          }`}
          data-element={`main-message-${message.role}`}
          data-message-id={message.id}
          title={`${message.role === 'user' ? 'User' : 'AI'} message in main chat`}
        >
          {message.role === 'user' ? (
            <p className="text-white whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </motion.div>
      ))}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-700 p-4 rounded-2xl mr-auto w-fit"
        >
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </motion.div>
      )}
      <div ref={messagesEndRef} />
    </motion.div>
  );
}



