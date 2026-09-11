import { describe, expect, it } from 'vitest';
import type { RgbaColor } from './color';
import { addRecentColor, clearRecentColors, removeRecentColor, sanitizeRecentColors } from './history';

const color = (r: number, g = 0, b = 0, a = 1): RgbaColor => ({ r, g, b, a });

describe('本机近期颜色领域状态', () => {
  it('把最新颜色置顶，并按完整 RGBA 去重', () => {
    const red = color(239, 68, 68);
    const translucentRed = color(239, 68, 68, 0.5);
    const blue = color(14, 165, 233);

    const history = addRecentColor(addRecentColor(addRecentColor([red], blue), translucentRed), red);

    expect(history).toEqual([red, translucentRed, blue]);
  });

  it('只保留最近 12 条', () => {
    const history = Array.from({ length: 14 }, (_, index) => color(index))
      .reduce((current, next) => addRecentColor(current, next), [] as RgbaColor[]);

    expect(history).toHaveLength(12);
    expect(history[0]).toEqual(color(13));
    expect(history.at(-1)).toEqual(color(2));
  });

  it('支持单删、清空，并清洗损坏的持久化值', () => {
    const red = color(255);
    const blue = color(0, 0, 255);
    expect(removeRecentColor([red, blue], red)).toEqual([blue]);
    expect(clearRecentColors()).toEqual([]);
    expect(sanitizeRecentColors([red, null, { r: 999, g: 0, b: 0, a: 1 }, blue, blue])).toEqual([red, blue]);
    expect(sanitizeRecentColors('not-an-array')).toEqual([]);
  });
});
