import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';
import { Send, X, Loader2 } from 'lucide-react';
import type { Meeting } from '@/lib/supabase/types';

interface AIChatProps {
  meeting: Meeting;
  decisions?: string[];
  risks?: string[];
  opportunities?: string[];
  onClose: () => void;
}

export function AIChat({
  meeting,
  decisions = [],
  risks = [],
  opportunities = [],
  onClose,
}: AIChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Build transcript string from meeting
  const transcript = meeting.transcript?.map((t: any) => `${t.speaker}: ${t.text}`).join('\n') || '';

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      meetingId: meeting.id,
      meetingTranscript: transcript,
      decisions,
      risks,
      opportunities,
    },
    onError: (error) => {
      console.error('[v0] Chat error:', error);
    },
  });

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border flex flex-col z-50 shadow-2xl">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="size-2 bg-brand-accent rounded-full animate-pulse" />
          <p className="text-sm font-medium">Ask about this meeting</p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-4" strokeWidth={1.75} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
            <p className="text-sm font-medium text-foreground">Ask questions about this meeting</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Try asking about deadlines, decisions, risks, action items, or any discussion topics.
            </p>
            <div className="space-y-2 pt-4">
              <p className="text-xs text-muted-foreground font-medium">Example questions:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• What deadlines were agreed?</li>
                <li>• Who owns the proposal?</li>
                <li>• What risks were mentioned?</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((message, i) => (
          <div key={i} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs px-4 py-2.5 rounded-lg text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface border border-border text-foreground'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3">
            <div className="bg-surface border border-border px-4 py-2.5 rounded-lg">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
        className="border-t border-border p-4 shrink-0 space-y-3"
      >
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question..."
          disabled={isLoading}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-foreground/30 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="size-3.5" strokeWidth={2} />
          Send
        </button>
      </form>
    </div>
  );
}
