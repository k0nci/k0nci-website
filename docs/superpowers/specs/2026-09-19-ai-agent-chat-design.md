# AI Agent Chat — Design

Date: 2026-09-19

## Goal

Add a "Chat about me with my AI agent" button under the social links on the
homepage. It leads to `/chat`, a page with a React chat island. The island
calls `POST /api/chat`, served by a separate Cloudflare Worker (repo
`k0nci-agent`) that holds markdown facts about Matej and answers with
Workers AI.

## Decisions

- Two repos: this site and a new sibling repo `k0nci-agent`.
- Same origin. A Cloudflare route on exactly `k0nci.me/api/chat` points to the
  agent worker. Routes run before the site's custom-domain worker, so the
  site worker is untouched and no CORS is needed.
- Streaming replies as server-sent events.
- Stateless worker. The client sends the whole transcript every request.
- Abuse protection: origin check plus per-IP rate limit in the worker.
- Content strategy: markdown files compiled into the system prompt at build
  time. No retrieval, no vector store.
- Client: React island via `@astrojs/react`, rendered with `client:only`.

## API contract

`POST /api/chat`, JSON body:

```json
{ "messages": [{ "role": "user", "content": "..." }] }
```

Validation, applied before any model call:

- `messages` is a non-empty array of `{ role, content }`.
- `role` is `user` or `assistant` only. The system prompt is never
  client-supplied.
- Last message has role `user`.
- At most 20 messages; each `content` is a non-empty string of at most 1,000
  characters. The worker rejects oversized input rather than trimming; the
  client trims to the last 20 messages before sending.
- `Origin` header must equal the configured site origin, otherwise 403.
- Rate limit 10 requests per 60 seconds per client IP (Workers rate limiting
  binding, key = `CF-Connecting-IP`), otherwise 429.
- Method other than POST gets 405.

Success: `200`, `Content-Type: text/event-stream`, the Workers AI stream passed
through unchanged. Events are `data: {"response": "<token>"}` and the stream
ends with `data: [DONE]`. The client concatenates `response` fields.

Errors: JSON `{ "error": "<message>" }` with status 400 (bad input), 403, 405,
429, or 502 (model call failed). No CORS headers.

## Worker repo: `k0nci-agent`

TypeScript, Wrangler, Vitest.

```
content/            profile.md, career.md, education.md, interests.md
src/index.ts        fetch handler
src/prompt.ts       builds the system prompt from content modules
src/validate.ts     pure request-body validation
src/types.ts        Env, ChatMessage
test/               vitest tests
wrangler.jsonc
```

- `wrangler.jsonc`: `ai` binding `AI`; `ratelimits` binding `RATE_LIMITER`
  with `simple: { limit: 10, period: 60 }`; `rules` entry importing
  `**/*.md` as `Text`; `routes: [{ pattern: "k0nci.me/api/chat", zone_name: "k0nci.me" }]`;
  var `ALLOWED_ORIGIN` = `https://k0nci.me`, overridden to
  `http://localhost:4321` for local dev via `--env dev` or `.dev.vars`.
- `src/prompt.ts` imports each markdown file and returns one system prompt:
  a persona preamble followed by the content joined with headings. Persona:
  assistant on Matej's personal site, answers only from the facts provided,
  third person, brief, friendly; if the facts do not cover a question, say so
  and point to LinkedIn.
- `src/index.ts` order: method check, path check, origin check, rate limit,
  parse and validate JSON, `env.AI.run(MODEL, { messages: [system, ...client], stream: true })`,
  return the stream with `text/event-stream` and `Cache-Control: no-store`.
- Model constant: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`. Single constant
  so it can be swapped.
- Content bootstrap: first draft of the markdown files written from Matej's
  CV PDF, then hand-edited.
- Tooling mirrors the website: ESLint flat config with typescript-eslint,
  Prettier, GitHub Actions CI running typecheck, lint, format check, tests.
  Deploy is manual `wrangler deploy`.

## Website changes

- Dependencies: `@astrojs/react`, `react`, `react-dom`, `@types/react`,
  `@types/react-dom`; dev: `vitest`, `@testing-library/react`, `jsdom`,
  `eslint-plugin-react-hooks`.
- `astro.config.ts`: add `react()` integration; add Vite `server.proxy`
  mapping `/api` to `http://localhost:8787` for local dev.
- `src/types/index.ts`: add `ChatMessage { role: 'user' | 'assistant'; content: string }`.
- `src/components/content/ChatCta.astro`: pill-styled link to `/chat` with a
  Phosphor chat icon and the text "Chat about me with my AI agent". Rendered
  in `index.astro` under `SocialLinks`.
- `src/pages/chat.astro`: `BaseLayout` with the homepage gradient and
  `TwinklingStars`, a back link to `/`, and `<Chat client:only="react" />`.
  Title "Chat with Matej's AI agent", matching description.
- `src/components/chat/useChat.ts`: state `{ messages, status: 'idle' | 'streaming', error }`;
  `send(text)` appends the user message, trims to the last 20, POSTs to
  `/api/chat`, reads the body with `TextDecoder`, parses `data:` lines,
  appends tokens to the trailing assistant message, stops on `[DONE]`.
  Uses an `AbortController`; a new send or unmount aborts the previous
  request. Maps 429 to "Too many messages, try again in a minute" and other
  failures to a generic error.
- `src/components/chat/Chat.tsx`: message list (user right, assistant left),
  intro assistant message with example questions, textarea (Enter sends,
  Shift+Enter newline), send button disabled while streaming, inline error
  text. Plain text with preserved line breaks; no markdown rendering.
  Tailwind glassmorphism consistent with the homepage.
- ESLint: enable `eslint-plugin-react-hooks` rules for `.tsx`.
- `package.json`: add `test` script (`vitest run`); CI runs it.

## Testing

Worker:

- `validate.ts`: empty list, wrong role, system role rejected, oversized
  content, too many messages, last message not user, valid input.
- `prompt.ts`: system prompt contains every content file's text.
- Handler (Workers Vitest pool with stubbed `AI` and `RATE_LIMITER`): 405 on
  GET, 403 on foreign or missing origin, 429 when the limiter denies, 400 on
  invalid body, 200 event stream on a valid request, 502 when `AI.run` throws.

Website:

- `useChat` hook tests with a mocked `fetch`: sends the trimmed transcript,
  appends streamed tokens in order, sets error on 429 and on network failure,
  aborts a previous in-flight request on a new send.
- Manual end-to-end: `wrangler dev` in the agent repo plus `npm run dev` here.

## Rollout

1. Build and test `k0nci-agent`, deploy, verify with curl against the route.
2. Build the website side on a feature branch, verify locally through the
   proxy and against production.
3. Open a pull request in this repo.

## Out of scope

Server-side sessions, retrieval, Turnstile, markdown rendering of replies,
automated deploys.
