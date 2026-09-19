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
