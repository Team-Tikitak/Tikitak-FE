import { describe, expect, it } from 'vitest';
import { computeCaptureRect } from './computeCaptureRect';

describe('computeCaptureRect', () => {
  it('returns null when any dimension is zero', () => {
    expect(computeCaptureRect(0, 480, 393, 800)).toBeNull();
    expect(computeCaptureRect(640, 0, 393, 800)).toBeNull();
    expect(computeCaptureRect(640, 480, 0, 800)).toBeNull();
    expect(computeCaptureRect(640, 480, 393, 0)).toBeNull();
  });

  it('returns full frame when aspect ratios match', () => {
    const rect = computeCaptureRect(800, 600, 400, 300);
    expect(rect).toEqual({ sourceX: 0, sourceY: 0, sourceWidth: 800, sourceHeight: 600 });
  });

  it('crops horizontally when video is wider than display', () => {
    // 16:9 video into 1:1 display → crop width to match height
    const rect = computeCaptureRect(1600, 900, 100, 100);
    expect(rect?.sourceHeight).toBe(900);
    expect(rect?.sourceWidth).toBe(900);
    expect(rect?.sourceX).toBe((1600 - 900) / 2);
    expect(rect?.sourceY).toBe(0);
  });

  it('crops vertically when video is taller than display', () => {
    // 1:2 video into 1:1 display → crop height to match width
    const rect = computeCaptureRect(500, 1000, 100, 100);
    expect(rect?.sourceWidth).toBe(500);
    expect(rect?.sourceHeight).toBe(500);
    expect(rect?.sourceX).toBe(0);
    expect(rect?.sourceY).toBe((1000 - 500) / 2);
  });

  it('centers the crop region', () => {
    const horizontal = computeCaptureRect(2000, 1000, 200, 200);
    expect(horizontal?.sourceX).toBe(500);

    const vertical = computeCaptureRect(1000, 2000, 200, 200);
    expect(vertical?.sourceY).toBe(500);
  });
});
