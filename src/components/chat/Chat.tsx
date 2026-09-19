import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import type { ChatMessage } from '../../types';
import { useChat } from './useChat';

const INTRO =
  "Hi! I'm Matej's AI agent. Ask me about his work, skills, education or what he does in the mountains.";
const SUGGESTIONS = [
  'What does Matej do?',
  'Which technologies does he use?',
  'Where did he study?',
];

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap md:text-base ${
          isUser
            ? 'rounded-br-sm bg-white/20 text-white'
            : 'rounded-bl-sm border border-white/15 bg-white/8 text-white/90 backdrop-blur-xl'
        }`}
      >
        {message.content || <span className="animate-pulse">…</span>}
      </div>
    </div>
  );
}

export default function Chat() {
  const { messages, status, error, send } = useChat();
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const streaming = status === 'streaming';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = (text: string) => {
    if (streaming || !text.trim()) return;
    setDraft('');
    void send(text);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit(draft);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit(draft);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-1 py-4">
        <Bubble message={{ role: 'assistant', content: INTRO }} />
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => submit(suggestion)}
                className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs text-white/80 backdrop-blur-xl transition hover:bg-white/15 hover:text-white md:text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        {messages.map((message, index) => (
          <Bubble key={index} message={message} />
        ))}
        {error && (
          <p role="alert" className="text-sm text-red-200">
            {error}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="flex items-end gap-2 pt-2">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={1000}
          placeholder="Ask something about Matej…"
          aria-label="Your message"
          className="flex-1 resize-none rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white placeholder-white/40 backdrop-blur-xl outline-none focus:border-white/40 md:text-base"
        />
        <button
          type="submit"
          disabled={streaming || !draft.trim()}
          className="rounded-2xl border border-white/15 bg-white/15 px-5 py-3 text-sm font-light text-white backdrop-blur-xl transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40 md:text-base"
        >
          Send
        </button>
      </form>
    </div>
  );
}
