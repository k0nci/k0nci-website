import { describe, expect, it } from 'vitest';
import { createTokenParser } from './sse';

function collect(chunks: string[]): { tokens: string[]; done: boolean } {
  const tokens: string[] = [];
  let done = false;
  const parser = createTokenParser({
    onToken: (token) => tokens.push(token),
    onDone: () => {
      done = true;
    },
  });
  for (const chunk of chunks) parser.feed(chunk);
  return { tokens, done };
}

describe('createTokenParser', () => {
  it('extracts response tokens from complete events', () => {
    expect(collect(['data: {"response":"Hel"}\n\ndata: {"response":"lo"}\n\n'])).toEqual({
      tokens: ['Hel', 'lo'],
      done: false,
    });
  });

  it('buffers an event split across chunks', () => {
    expect(collect(['data: {"response":"a"}\n\ndata: {"resp', 'onse":"b"}\n\n'])).toEqual({
      tokens: ['a', 'b'],
      done: false,
    });
  });

  it('reports done on the [DONE] sentinel and ignores events after it', () => {
    expect(
      collect(['data: {"response":"x"}\n\ndata: [DONE]\n\ndata: {"response":"y"}\n\n'])
    ).toEqual({ tokens: ['x'], done: true });
  });

  it('skips events without a response string and comment lines', () => {
    expect(collect([': ping\n\ndata: {"usage":{"total":3}}\n\ndata: not json\n\n'])).toEqual({
      tokens: [],
      done: false,
    });
  });
});
