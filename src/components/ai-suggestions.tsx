import { Mail, MessageCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { PremiumCard, SectionHeader } from './premium-card';

interface SuggestedEmail {
  id: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  sentAt?: string;
}

interface SuggestedMessage {
  id: string;
  channel: 'whatsapp' | 'slack' | 'email';
  body: string;
  sentAt?: string;
}

export function AISuggestions({
  emails = [],
  messages = [],
}: {
  emails?: SuggestedEmail[];
  messages?: SuggestedMessage[];
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (emails.length === 0 && messages.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <SectionHeader icon={Mail} title="AI-Generated Suggestions" />

      <div className="space-y-6">
        {/* Suggested Emails */}
        {emails.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
              <Mail className="size-4" />
              Suggested Emails
            </h3>
            <div className="space-y-3">
              {emails.map((email) => (
                <PremiumCard key={email.id}>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">TO</p>
                      <p className="text-sm font-medium">{email.recipientName}</p>
                      <p className="text-xs text-muted-foreground">{email.recipientEmail}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">SUBJECT</p>
                      <p className="text-sm">{email.subject}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">MESSAGE</p>
                      <div className="p-3 rounded-lg bg-background text-sm leading-relaxed whitespace-pre-wrap">
                        {email.body}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleCopy(`${email.subject}\n\n${email.body}`, email.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                      >
                        {copiedId === email.id ? (
                          <>
                            <Check className="size-3.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                      <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-background border border-border rounded-lg hover:bg-surface transition-colors">
                        <Mail className="size-3.5" />
                        Send
                      </button>
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Messages */}
        {messages.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
              <MessageCircle className="size-4" />
              Suggested Messages
            </h3>
            <div className="space-y-3">
              {messages.map((message) => (
                <PremiumCard key={message.id}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        {message.channel}
                      </p>
                      {message.sentAt && <p className="text-xs text-green-500">Sent</p>}
                    </div>

                    <div className="p-3 rounded-lg bg-background text-sm leading-relaxed">
                      {message.body}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleCopy(message.body, message.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-background border border-border rounded-lg hover:bg-surface transition-colors"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="size-3.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                      <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                        <MessageCircle className="size-3.5" />
                        Send
                      </button>
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
