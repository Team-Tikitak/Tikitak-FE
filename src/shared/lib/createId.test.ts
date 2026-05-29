import { afterEach, describe, expect, it, vi } from 'vitest';
import { createId } from './createId';

describe('createId', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a non-empty string', () => {
    const id = createId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('uses crypto.randomUUID when available', () => {
    const spy = vi
      .spyOn(crypto, 'randomUUID')
      .mockReturnValue('00000000-0000-0000-0000-000000000000');
    const id = createId();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(id).toBe('00000000-0000-0000-0000-000000000000');
  });

  it('falls back when crypto.randomUUID is unavailable', () => {
    vi.spyOn(crypto, 'randomUUID').mockImplementation(
      undefined as unknown as () => `${string}-${string}-${string}-${string}-${string}`,
    );
    const id = createId();
    expect(typeof id).toBe('string');
    expect(id).toMatch(/-/);
  });

  it('generates unique ids on consecutive calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => createId()));
    expect(ids.size).toBe(100);
  });
});
