import { describe, expect, it } from 'vitest';
import {
  formatHex,
  formatHsl,
  formatRgb,
  hslToRgba,
  parseCanonicalColor,
  rgbaToHsl,
  type RgbaColor,
} from './color';

describe('颜色领域公开格式接口', () => {
  it('把已知网页像素同时格式化为 HEX、RGB 和 HSL', () => {
    const color: RgbaColor = { r: 79, g: 70, b: 229, a: 1 };

    expect(formatHex(color)).toBe('#4F46E5');
    expect(formatRgb(color)).toBe('rgb(79, 70, 229)');
    expect(formatHsl(color)).toBe('hsl(243, 75%, 59%)');
  });

  it('在 HSL 和 RGBA 之间保持标准色的数值', () => {
    expect(hslToRgba({ h: 210, s: 100, l: 50, a: 1 })).toEqual({
      r: 0,
      g: 128,
      b: 255,
      a: 1,
    });
    expect(rgbaToHsl({ r: 255, g: 0, b: 0, a: 1 })).toEqual({
      h: 0,
      s: 100,
      l: 50,
      a: 1,
    });
  });

  it('把浏览器规范化后的 HEX/RGBA 转为统一颜色，拒绝无效文本', () => {
    expect(parseCanonicalColor('#0ea5e9')).toEqual({ r: 14, g: 165, b: 233, a: 1 });
    expect(parseCanonicalColor('#0ea5e980')).toEqual({ r: 14, g: 165, b: 233, a: 128 / 255 });
    expect(parseCanonicalColor('rgba(102, 51, 153, 0.5)')).toEqual({ r: 102, g: 51, b: 153, a: 0.5 });
    expect(parseCanonicalColor('not-a-color')).toBeNull();
  });
});
