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
