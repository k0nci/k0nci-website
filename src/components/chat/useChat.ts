import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../../types';
import { createTokenParser } from './sse';

export const MAX_HISTORY = 20;
export const MAX_CONTENT_LENGTH = 1000;
export type ChatStatus = 'idle' | 'streaming';

export interface UseChatOptions {
  initialMessages?: ChatMessage[];
}

export interface UseChatResult {
  messages: ChatMessage[];
  status: ChatStatus;
  error: string | null;
  send: (text: string) => Promise<void>;
}

const RATE_LIMIT_ERROR = 'Too many messages, please try again in a minute.';
const GENERIC_ERROR = 'Something went wrong, please try again.';

class HttpError extends Error {
  constructor(public readonly status: number) {
    super(`HTTP ${status}`);
  }
}

function appendToLastAssistant(messages: ChatMessage[], token: string): ChatMessage[] {
  const last = messages[messages.length - 1];
  if (last?.role !== 'assistant') return messages;
  return [...messages.slice(0, -1), { ...last, content: last.content + token }];
}

function dropTrailingEmptyAssistant(messages: ChatMessage[]): ChatMessage[] {
  const last = messages[messages.length - 1];
  return last?.role === 'assistant' && last.content === '' ? messages.slice(0, -1) : messages;
}

async function streamInto(
  body: ReadableStream<Uint8Array>,
  onToken: (token: string) => void
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let finished = false;
  const parser = createTokenParser({
    onToken,
    onDone: () => {
      finished = true;
    },
  });
  try {
    while (!finished) {
      const { value, done } = await reader.read();
      if (done) return;
      parser.feed(decoder.decode(value, { stream: true }));
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
}

export function useChat(options: UseChatOptions = {}): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>(options.initialMessages ?? []);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || status === 'streaming') return;

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      const history = [...messages, { role: 'user', content } satisfies ChatMessage];
      setMessages([...history, { role: 'assistant', content: '' }]);
      setStatus('streaming');
      setError(null);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history
              .filter((message) => message.content.trim() !== '')
              .slice(-MAX_HISTORY)
              .map((message) => ({
                ...message,
                content: message.content.slice(0, MAX_CONTENT_LENGTH),
              })),
          }),
          signal: controller.signal,
        });
        if (!response.ok) throw new HttpError(response.status);
        if (!response.body) throw new Error('empty body');
        await streamInto(response.body, (token) =>
          setMessages((prev) => appendToLastAssistant(prev, token))
        );
        setMessages((prev) => dropTrailingEmptyAssistant(prev));
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof HttpError && err.status === 429 ? RATE_LIMIT_ERROR : GENERIC_ERROR);
        setMessages((prev) => dropTrailingEmptyAssistant(prev));
      } finally {
        if (controllerRef.current === controller) setStatus('idle');
      }
    },
    [messages, status]
  );

  return { messages, status, error, send };
}
