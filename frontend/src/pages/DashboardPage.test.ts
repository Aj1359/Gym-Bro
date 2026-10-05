import { describe, it, expect } from 'vitest';

export function calculatePercentage(current: number, target: number | null): number | null {
  if (!target || target <= 0) return null;
  return Math.min(100, Math.round((current / target) * 100));
}

describe('dashboard percentage calculation', () => {
  it('caps at 100% when current exceeds target', () => {
    expect(calculatePercentage(3000, 2200)).toBe(100);
  });

  it('calculates correct percentage when under target', () => {
    expect(calculatePercentage(1100, 2200)).toBe(50);
  });

  it('returns null when no target exists', () => {
    expect(calculatePercentage(1420, null)).toBeNull();
  });

  it('rounds to the nearest whole percent', () => {
    expect(calculatePercentage(1000, 3000)).toBe(33);
  });
});
