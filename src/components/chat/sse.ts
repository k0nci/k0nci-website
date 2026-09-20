import { createParser } from 'eventsource-parser';

const DONE = '[DONE]';

export interface TokenParser {
  /** Feed a decoded chunk of the event stream. */
  feed(chunk: string): void;
}

export interface TokenParserHandlers {
  onToken: (token: string) => void;
  onDone: () => void;
}

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

/**
 * Wraps eventsource-parser for the Workers AI stream: each `data:` event carries JSON with a
 * `response` token, and `data: [DONE]` ends the stream. Events after [DONE] are ignored.
 */
export function createTokenParser(handlers: TokenParserHandlers): TokenParser {
  let done = false;
  return createParser({
    onEvent(event) {
      if (done) return;
      if (event.data === DONE) {
        done = true;
        handlers.onDone();
        return;
      }
      const token = tokenFromPayload(event.data);
      if (token !== null) handlers.onToken(token);
    },
  });
}
