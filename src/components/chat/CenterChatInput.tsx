'use client';

import { ArrowUp } from 'lucide-react';
import { FormEvent } from 'react';

type CenterChatInputProps = {
  input: string;
  setInput: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
  isAnimating: boolean;
};

export default function CenterChatInput({ input, setInput, onSubmit, isLoading, isAnimating }: CenterChatInputProps) {
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (!input.trim() || isLoading || isAnimating) return;
      onSubmit(e);
    }} className="relative">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (isLoading || isAnimating)) {
            e.preventDefault();
          }
        }}
        placeholder="Ask me anything..."
        className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-300 focus:outline-none focus:border-white/40"
        data-element="chat-input-center"
        title="Chat input - center of page"
      />
      <button
        type="submit"
        disabled={!input.trim() || isLoading || isAnimating}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors duration-200"
        data-element="chat-submit-center"
        title="Send message - center chat"
      >
        <ArrowUp size={20} />
      </button>
    </form>
  );
}



