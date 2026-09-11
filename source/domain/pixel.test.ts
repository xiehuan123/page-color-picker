import { describe, expect, it } from 'vitest';
import { mapViewportPoint } from './pixel';

describe('视口坐标到页面快照像素的公开映射', () => {
  it('按实际位图与视口比例映射 DPR/缩放，并把边界夹在快照内', () => {
    expect(mapViewportPoint({ x: 365, y: 298 }, { width: 1200, height: 800 }, { width: 2400, height: 1600 }))
      .toEqual({ x: 730, y: 596, scaleX: 2, scaleY: 2 });
    expect(mapViewportPoint({ x: 1000, y: -4 }, { width: 1000, height: 700 }, { width: 1250, height: 875 }))
      .toEqual({ x: 1249, y: 0, scaleX: 1.25, scaleY: 1.25 });
  });
});
