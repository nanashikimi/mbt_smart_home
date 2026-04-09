import { describe, expect, it } from 'vitest';
import { mulberry32 } from './mulberry32';

describe('mulberry32', () => {
  it('returns values in [0, 1)', () => {
    const rnd = mulberry32(99);
    for (let i = 0; i < 500; i++) {
      const x = rnd();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
  it('same seed produces the same sequence (reproducible)', () => {
    const take = (seed: number, n: number) => {
      const rnd = mulberry32(seed >>> 0);
      return Array.from({ length: n }, () => rnd());
    };
    expect(take(42_001, 10)).toEqual(take(42_001, 10));
    expect(take(42_001, 10)).not.toEqual(take(42_002, 10));
  });
  it('golden sequence for seed 12345 (guards against accidental algorithm drift)', () => {
    const rnd = mulberry32(12345 >>> 0);
    const firstFive = [rnd(), rnd(), rnd(), rnd(), rnd()];
    expect(firstFive).toEqual([
      0.9797282677609473,
      0.3067522644996643,
      0.484205421525985,
      0.817934412509203,
      0.5094283693470061,
    ]);
  });
  it('advances internal state on each call (not stuck on one value)', () => {
    const rnd = mulberry32(7);
    const a = rnd();
    const b = rnd();
    const c = rnd();
    expect(new Set([a, b, c]).size).toBe(3);
  });
});
