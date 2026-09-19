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
