import type { Response } from 'express';
import { describe, expect, it } from 'vitest';
import { fail, ok } from './respond';

/** Minimal stand-in for Express's Response that records what was sent. */
function fakeResponse() {
  const sent: { status?: number; body?: unknown } = {};
  const res = {
    status(code: number) {
      sent.status = code;
      return res;
    },
    json(body: unknown) {
      sent.body = body;
      return res;
    },
  };
  return { res: res as unknown as Response, sent };
}

describe('respond helpers', () => {
  it('ok() sends { success: true, data } with 200 by default', () => {
    const { res, sent } = fakeResponse();
    ok(res, { status: 'ok' });
    expect(sent.status).toBe(200);
    expect(sent.body).toEqual({ success: true, data: { status: 'ok' } });
  });

  it('ok() accepts an explicit status', () => {
    const { res, sent } = fakeResponse();
    ok(res, { id: 'abc' }, 201);
    expect(sent.status).toBe(201);
  });

  it('fail() sends { success: false, error: { code, message } } with the given status', () => {
    const { res, sent } = fakeResponse();
    fail(res, 404, 'not_found', 'No such cycle');
    expect(sent.status).toBe(404);
    expect(sent.body).toEqual({
      success: false,
      error: { code: 'not_found', message: 'No such cycle' },
    });
  });

  it('never leaks extra keys into the envelope', () => {
    const { res, sent } = fakeResponse();
    fail(res, 500, 'internal_error', 'Something went wrong');
    expect(Object.keys(sent.body as object).sort()).toEqual(['error', 'success']);
  });
});
