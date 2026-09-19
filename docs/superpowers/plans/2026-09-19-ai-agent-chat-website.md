# AI Agent Chat (website) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Chat about me with my AI agent" button under the social links that opens `/chat`, a page with a React chat island streaming answers from `POST /api/chat`.

**Architecture:** Astro gains the React integration. A pure SSE parser and a `useChat` hook own all fetch and state logic and are unit tested with Vitest and Testing Library. A `Chat` component renders the transcript and input and is mounted with `client:only="react"` on a new `chat.astro` page styled like the homepage. In dev, Vite proxies `/api` to the agent worker on port 8787.

**Tech Stack:** Astro 7, `@astrojs/react` 6, React 19, Tailwind v4, Vitest 5 with jsdom and `@testing-library/react`, `eslint-plugin-react-hooks` 7.

**Spec:** `docs/superpowers/specs/2026-09-19-ai-agent-chat-design.md`

## Global Constraints

- Work on branch `feat/ai-agent-chat` from `main` in `/Users/konci/Documents/work/k0nci-website`.
- The agent worker plan (`docs/superpowers/plans/2026-09-19-ai-agent-worker.md`) must be deployed before the end-to-end check in Task 5; Tasks 1–4 do not depend on it.
- API contract: `POST /api/chat`, body `{ messages: { role: 'user' | 'assistant'; content: string }[] }`, at most 20 messages; response `text/event-stream` with `data: {"response":"<token>"}` events ending in `data: [DONE]`; errors JSON `{ error }` with 400/403/429/502.
- Button copy, exactly: `Chat about me with my AI agent`.
- Page title: `Chat with Matej's AI agent`.
- Keep the existing design language: white text on the homepage gradient, glass pills (`border border-white/15 bg-white/8 backdrop-blur-xl`).
- Every task ends with `npm run typecheck && npm run lint && npm run format:check` passing (and `npm test` from Task 1 on).
- Commit messages: conventional commits ending with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

### Task 1: React integration, Vitest, dev proxy

**Files:**

- Modify: `package.json`, `astro.config.ts`, `tsconfig.json`, `eslint.config.ts`, `.github/workflows/ci.yml`
- Create: `vitest.config.ts`, `src/types/index.ts` (add `ChatMessage`)

**Interfaces:**

- Produces: `ChatMessage` type in `src/types/index.ts`; `npm test` script; `/api` proxied to `http://localhost:8787` in dev.

- [ ] **Step 1: Branch**

```bash
git checkout -b feat/ai-agent-chat
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @astrojs/react@^6.0.6 react@^19.3.0 react-dom@^19.3.0
npm install -D @types/react@^19.3.0 @types/react-dom@^19.3.0 vitest@^5.0.1 jsdom@^30.1.0 @testing-library/react@^16.3.3 eslint-plugin-react-hooks@^7.1.1
```

- [ ] **Step 3: Update astro.config.ts**

```ts
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://k0nci.me',
  integrations: [react(), sitemap(), icon()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Local agent worker (`npm run dev` in k0nci-agent). Production routes /api/chat at the edge.
      proxy: { '/api': 'http://localhost:8787' },
    },
  },
});
```

- [ ] **Step 4: Update tsconfig.json compilerOptions**

Add JSX settings; keep everything else:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "plugins": [{ "name": "@astrojs/ts-plugin" }],
    "paths": {
      "@components/*": ["./src/components/*"],
      "@layouts/*": ["./src/layouts/*"]
    }
  }
}
```

- [ ] **Step 5: Add ChatMessage type**

Append to `src/types/index.ts`:

```ts
export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}
```

- [ ] **Step 6: Write vitest.config.ts**

```ts
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

- [ ] **Step 7: Update eslint.config.ts**

Replace the base TS block's `files` and add the hooks plugin:

```ts
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig(
  // Ignore auto-generated files
  { ignores: ['.astro/**', 'dist/**', 'node_modules/**'] },

  // Base JavaScript and TypeScript configs
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    files: ['**/*.{ts,mts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // React hooks rules for islands
  {
    files: ['**/*.tsx'],
    extends: [reactHooks.configs.flat.recommended],
  },

  // Astro-specific configs
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.astro'],
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);
```

If `reactHooks.configs.flat.recommended` is undefined in the installed version, use `reactHooks.configs['recommended-latest']` instead.

- [ ] **Step 8: Add the test script and CI step**

In `package.json` scripts add `"test": "vitest run"`. In `.github/workflows/ci.yml` append after the format check:

```yaml
- name: Tests
  run: npm test
```

- [ ] **Step 9: Verify**

```bash
npm run typecheck && npm run lint && npm run format:check && npx vitest run --passWithNoTests && npm run build
```

Expected: all exit 0; build output unchanged apart from React not yet being used.

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "chore: add React integration, Vitest and dev API proxy

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Homepage button

**Files:**

- Create: `src/components/content/ChatCta.astro`
- Modify: `src/pages/index.astro` (render under `SocialLinks`)

**Interfaces:**

- Produces: `<ChatCta href="/chat" class?="" />`.

- [ ] **Step 1: Write ChatCta.astro**

```astro
---
import { Icon } from 'astro-icon/components';

interface Props {
  href: string;
  class?: string;
}

const { href, class: className = '' } = Astro.props;
---

<div class={`${className} flex justify-center`}>
  <a
    href={href}
    class="group inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/8 px-6 py-3 text-sm font-light tracking-wide text-white/90 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-white/30 hover:bg-white/15 hover:text-white md:text-base"
  >
    <Icon name="ph:chat-circle-dots" size={20} class="transition-transform group-hover:rotate-12" />
    <span>Chat about me with my AI agent</span>
  </a>
</div>
```

- [ ] **Step 2: Render it on the homepage**

In `src/pages/index.astro` add the import next to the other content imports:

```ts
import ChatCta from '@components/content/ChatCta.astro';
```

and change the content block so the social links keep spacing above the new button:

```astro
<ActivityIcons activities={activities} class="mb-12" />
<SocialLinks links={socialLinks} class="mb-10" />
<ChatCta href="/chat" />
```

- [ ] **Step 3: Verify visually**

```bash
npm run dev
```

Open http://localhost:4321. Expected: pill button under the GitHub and LinkedIn icons, same glass style as the tech tags, hover scales it slightly. Clicking gives a 404 until Task 4.

- [ ] **Step 4: Checks and commit**

```bash
npm run typecheck && npm run lint && npm run format:check
git add src/components/content/ChatCta.astro src/pages/index.astro && git commit -m "feat: add chat call-to-action under social links

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: SSE parser and useChat hook

**Files:**

- Create: `src/components/chat/sse.ts`, `src/components/chat/useChat.ts`
- Test: `src/components/chat/sse.test.ts`, `src/components/chat/useChat.test.ts`

**Interfaces:**

- Consumes: `ChatMessage` from `src/types/index.ts`.
- Produces:
  - `parseSse(buffer: string): { tokens: string[]; rest: string; done: boolean }`
  - `MAX_HISTORY = 20`
  - `useChat(options?: { initialMessages?: ChatMessage[] }): { messages: ChatMessage[]; status: 'idle' | 'streaming'; error: string | null; send: (text: string) => Promise<void> }`

- [ ] **Step 1: Write the failing parser tests**

`src/components/chat/sse.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseSse } from './sse';

describe('parseSse', () => {
  it('extracts response tokens from complete data lines', () => {
    const result = parseSse('data: {"response":"Hel"}\n\ndata: {"response":"lo"}\n\n');
    expect(result).toEqual({ tokens: ['Hel', 'lo'], rest: '', done: false });
  });

  it('keeps an incomplete trailing line as rest', () => {
    const result = parseSse('data: {"response":"a"}\n\ndata: {"resp');
    expect(result).toEqual({ tokens: ['a'], rest: 'data: {"resp', done: false });
  });

  it('reports done on the [DONE] sentinel and ignores lines after it', () => {
    const result = parseSse('data: {"response":"x"}\n\ndata: [DONE]\n\ndata: {"response":"y"}\n\n');
    expect(result).toEqual({ tokens: ['x'], rest: '', done: true });
  });

  it('skips events without a response string and non-data lines', () => {
    const result = parseSse(': ping\n\ndata: {"usage":{"total":3}}\n\ndata: not json\n\n');
    expect(result).toEqual({ tokens: [], rest: '', done: false });
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/components/chat/sse.test.ts`
Expected: FAIL, cannot resolve `./sse`.

- [ ] **Step 3: Implement the parser**

`src/components/chat/sse.ts`:

```ts
export interface SseParseResult {
  tokens: string[];
  rest: string;
  done: boolean;
}

const DATA_PREFIX = 'data:';
const DONE = '[DONE]';

function tokenFromPayload(payload: string): string | null {
  try {
    const parsed: unknown = JSON.parse(payload);
    if (typeof parsed === 'object' && parsed !== null && 'response' in parsed) {
      const { response } = parsed as { response?: unknown };
      if (typeof response === 'string') return response;
    }
  } catch {
    // ignore malformed events
  }
  return null;
}

/** Parses buffered server-sent events from Workers AI. Returns tokens, the unparsed remainder and whether [DONE] was seen. */
export function parseSse(buffer: string): SseParseResult {
  const lines = buffer.split('\n');
  const rest = lines.pop() ?? '';
  const tokens: string[] = [];

  for (const line of lines) {
    if (!line.startsWith(DATA_PREFIX)) continue;
    const payload = line.slice(DATA_PREFIX.length).trim();
    if (payload === DONE) return { tokens, rest: '', done: true };
    const token = tokenFromPayload(payload);
    if (token !== null) tokens.push(token);
  }

  return { tokens, rest, done: false };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/components/chat/sse.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit the parser**

```bash
npm run lint && npm run format:check
git add src/components/chat/sse.ts src/components/chat/sse.test.ts && git commit -m "feat: parse Workers AI server-sent events

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

- [ ] **Step 6: Write the failing hook tests**

`src/components/chat/useChat.test.ts`:

```ts
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ChatMessage } from '../../types';
import { MAX_HISTORY, useChat } from './useChat';

function sseResponse(events: string[], init: ResponseInit = {}): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const event of events) controller.enqueue(encoder.encode(event));
      controller.close();
    },
  });
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
    ...init,
  });
}

function requestBody(call: unknown[]): { messages: ChatMessage[] } {
  const init = call[1] as RequestInit;
  return JSON.parse(init.body as string) as { messages: ChatMessage[] };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useChat', () => {
  it('appends the user message and streams the assistant reply', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        sseResponse(['data: {"response":"Hel"}\n\n', 'data: {"response":"lo"}\n\ndata: [DONE]\n\n'])
      );
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useChat());
    await act(() => result.current.send('  Hi  '));

    await waitFor(() => expect(result.current.status).toBe('idle'));
    expect(result.current.messages).toEqual([
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello' },
    ]);
    expect(result.current.error).toBeNull();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/chat');
    expect(init.method).toBe('POST');
    expect(requestBody(fetchMock.mock.calls[0] as unknown[])).toEqual({
      messages: [{ role: 'user', content: 'Hi' }],
    });
  });

  it('ignores empty input', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useChat());
    await act(() => result.current.send('   '));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.messages).toEqual([]);
  });

  it('sends only the last MAX_HISTORY messages', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse(['data: [DONE]\n\n']));
    vi.stubGlobal('fetch', fetchMock);
    const initialMessages: ChatMessage[] = Array.from({ length: MAX_HISTORY + 1 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `m${i}`,
    }));

    const { result } = renderHook(() => useChat({ initialMessages }));
    await act(() => result.current.send('latest'));

    const { messages } = requestBody(fetchMock.mock.calls[0] as unknown[]);
    expect(messages).toHaveLength(MAX_HISTORY);
    expect(messages[messages.length - 1]).toEqual({ role: 'user', content: 'latest' });
    expect(messages[0]).toEqual({ role: 'user', content: 'm2' });
  });

  it('reports a rate limit error and drops the empty assistant message', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ error: 'too many requests' }), { status: 429 })
        )
    );
    const { result } = renderHook(() => useChat());
    await act(() => result.current.send('Hi'));

    await waitFor(() => expect(result.current.status).toBe('idle'));
    expect(result.current.error).toBe('Too many messages, please try again in a minute.');
    expect(result.current.messages).toEqual([{ role: 'user', content: 'Hi' }]);
  });

  it('reports a generic error on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const { result } = renderHook(() => useChat());
    await act(() => result.current.send('Hi'));

    await waitFor(() => expect(result.current.status).toBe('idle'));
    expect(result.current.error).toBe('Something went wrong, please try again.');
  });

  it('passes an abort signal and aborts on unmount', async () => {
    let capturedSignal: AbortSignal | undefined;
    const fetchMock = vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      capturedSignal = init.signal ?? undefined;
      return new Promise<Response>(() => {
        /* never resolves */
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const { result, unmount } = renderHook(() => useChat());
    act(() => {
      void result.current.send('Hi');
    });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(capturedSignal?.aborted).toBe(false);

    unmount();
    expect(capturedSignal?.aborted).toBe(true);
  });
});
```

- [ ] **Step 7: Run to verify failure**

Run: `npx vitest run src/components/chat/useChat.test.ts`
Expected: FAIL, cannot resolve `./useChat`.

- [ ] **Step 8: Implement the hook**

`src/components/chat/useChat.ts`:

```ts
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../../types';
import { parseSse } from './sse';

export const MAX_HISTORY = 20;
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
  if (!last || last.role !== 'assistant') return messages;
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
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });
    const parsed = parseSse(buffer);
    buffer = parsed.rest;
    for (const token of parsed.tokens) onToken(token);
    if (parsed.done) return;
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
          body: JSON.stringify({ messages: history.slice(-MAX_HISTORY) }),
          signal: controller.signal,
        });
        if (!response.ok) throw new HttpError(response.status);
        if (!response.body) throw new Error('empty body');
        await streamInto(response.body, (token) =>
          setMessages((prev) => appendToLastAssistant(prev, token))
        );
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
```

- [ ] **Step 9: Run to verify pass**

Run: `npm test`
Expected: PASS, 10 tests across two files. If React logs "not wrapped in act" warnings, they are noise from streaming state updates; the assertions use `waitFor`, so no change is needed.

- [ ] **Step 10: Checks and commit**

```bash
npm run typecheck && npm run lint && npm run format:check
git add src/components/chat && git commit -m "feat: add useChat hook streaming replies from the agent API

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Chat component and page

**Files:**

- Create: `src/components/chat/Chat.tsx`, `src/pages/chat.astro`

**Interfaces:**

- Consumes: `useChat` from Task 3.
- Produces: route `/chat`.

- [ ] **Step 1: Write Chat.tsx**

```tsx
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
```

- [ ] **Step 2: Write chat.astro**

```astro
---
import BaseLayout from '@layouts/BaseLayout.astro';
import TwinklingStars from '@components/background/TwinklingStars.astro';
import { Icon } from 'astro-icon/components';
import Chat from '@components/chat/Chat';
---

<BaseLayout
  title="Chat with Matej's AI agent"
  description="Ask an AI agent about Matej Koncal: his work, skills, education and interests."
>
  <div
    class="relative flex min-h-dvh flex-col overflow-hidden font-sans text-white"
    style="background: linear-gradient(135deg, #2c3e50 0%, #4a69bd 20%, #3c6382 40%, #40739e 60%, #487eb0 80%, #5b73e8 100%);"
  >
    <TwinklingStars />
    <div class="relative z-20 mx-auto flex h-dvh w-full max-w-2xl flex-col px-4 py-6">
      <header class="mb-2 flex items-center justify-between">
        <a
          href="/"
          class="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
        >
          <Icon name="ph:arrow-left" size={18} />
          Back
        </a>
        <h1 class="text-lg font-light tracking-wide md:text-xl">Chat with Matej's AI agent</h1>
      </header>
      <main class="min-h-0 flex-1">
        <Chat client:only="react" />
      </main>
      <p class="mt-3 text-center text-[0.65rem] text-white/50">
        Answers come from an AI model and may be inaccurate. Nothing you type is stored.
      </p>
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 3: Verify locally**

```bash
npm run dev
```

Open http://localhost:4321/chat. Expected: intro bubble, three suggestion chips, textarea and Send. Without the agent worker running, sending shows the generic error under the transcript and the page stays usable. With `npm run dev` also running in `k0nci-agent`, sending streams a real answer token by token, Enter sends, Shift+Enter inserts a newline, Send is disabled while streaming, and the list scrolls to the newest message.

- [ ] **Step 4: Checks, build, commit**

```bash
npm run typecheck && npm run lint && npm run format:check && npm test && npm run build
git add src/components/chat/Chat.tsx src/pages/chat.astro && git commit -m "feat: add /chat page with React chat island

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

Expected build output includes `dist/chat/index.html` and a React client bundle.

---

### Task 5: Docs, end-to-end check, pull request

**Files:**

- Modify: `CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md**

Under "Architecture" add:

```markdown
- **React islands** via `@astrojs/react`; only `src/components/chat/` uses React, mounted with `client:only`
- **AI chat** — `/chat` page calls `POST /api/chat`, served by the separate `k0nci-agent` worker (repo `k0nci/k0nci-agent`) on a Cloudflare route; in dev Vite proxies `/api` to `http://localhost:8787`
```

Under "Commands" add `npm run test       # vitest (hook and parser unit tests)`. Under "Project Structure" add `src/components/chat/` — `Chat.tsx`, `useChat.ts`, `sse.ts` and `src/pages/chat.astro`. Under "CI" add tests to the check list.

- [ ] **Step 2: Production end-to-end check**

Requires the worker deployed (worker plan Task 7). Build and preview the site, then verify the deployed API directly from a browser origin:

```bash
npm run build && npm run preview
```

Open http://localhost:4321/chat and confirm the dev proxy is not involved in preview (it is not, so sending returns an error there, which is expected). The real check happens after merge and deploy: open https://k0nci.me/chat, send "Where does Matej work?", expect a streamed answer naming BiteBerry.

- [ ] **Step 3: Commit and open the PR**

```bash
npm run typecheck && npm run lint && npm run format:check && npm test
git add CLAUDE.md && git commit -m "docs: document chat page and agent API

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push -u origin feat/ai-agent-chat
gh pr create --title "feat: chat about me with my AI agent" --body "$(cat <<'EOF'
## Summary
- Adds a "Chat about me with my AI agent" button under the social links
- New `/chat` page with a React island that streams answers from `POST /api/chat`
- The API is served by the separate `k0nci/k0nci-agent` worker on a Cloudflare route
- Adds Vitest with tests for the SSE parser and `useChat` hook; CI runs them

## Test plan
- [x] `npm run typecheck && npm run lint && npm run format:check && npm test`
- [x] Local: `wrangler dev` in k0nci-agent + `npm run dev` here, streamed answers on /chat
- [ ] After deploy: https://k0nci.me/chat answers "Where does Matej work?"

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: CI green on the PR.
