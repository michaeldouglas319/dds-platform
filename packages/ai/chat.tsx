'use client';

import { useChat } from 'ai/react';
import { useAI } from './provider';

interface ChatProps {
  endpoint?: string;
  placeholder?: string;
  className?: string;
}

export function Chat({
  endpoint,
  placeholder = 'Type a message...',
  className = '',
}: ChatProps) {
  const { apiEndpoint } = useAI();
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: endpoint ?? apiEndpoint,
    });

  return (
    <div
      className={`flex flex-col h-full bg-neutral-900 text-neutral-100 rounded-lg border border-neutral-800 ${className}`}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-neutral-500 text-sm text-center mt-8">
            No messages yet. Start a conversation.
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 text-neutral-100'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-neutral-800 rounded-lg px-4 py-2 text-sm text-neutral-400">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-neutral-800 p-4 flex gap-2"
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="flex-1 bg-neutral-800 text-neutral-100 placeholder-neutral-500 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
