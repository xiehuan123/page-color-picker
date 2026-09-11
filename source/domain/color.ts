export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
  a: number;
}

function byteToHex(value: number): string {
  return Math.round(value).toString(16).padStart(2, '0').toUpperCase();
}

function normalizeHue(value: number): number {
  return ((value % 360) + 360) % 360;
}

function parseHexByte(value: string): number {
  return Number.parseInt(value, 16);
}

export function parseCanonicalColor(value: string): RgbaColor | null {
  const text = value.trim();
  const hex = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.exec(text);
  if (hex?.[1]) {
    const digits = hex[1].length <= 4
      ? [...hex[1]].map((digit) => `${digit}${digit}`).join('')
      : hex[1];
    return {
      r: parseHexByte(digits.slice(0, 2)),
      g: parseHexByte(digits.slice(2, 4)),
      b: parseHexByte(digits.slice(4, 6)),
      a: digits.length === 8 ? parseHexByte(digits.slice(6, 8)) / 255 : 1,
    };
  }

  const rgb = /^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*(\d*(?:\.\d+)?))?\s*\)$/i.exec(text);
  if (!rgb) return null;
  const r = Number(rgb[1]);
  const g = Number(rgb[2]);
  const b = Number(rgb[3]);
  const a = rgb[4] === undefined ? 1 : Number(rgb[4]);
  if (![r, g, b, a].every(Number.isFinite) || [r, g, b].some((channel) => channel < 0 || channel > 255) || a < 0 || a > 1) return null;
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a };
}

export function rgbaToHsl(color: RgbaColor): HslColor {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }

  return {
    h: Math.round(normalizeHue(h)),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: color.a,
  };
}

export function hslToRgba(color: HslColor): RgbaColor {
  const h = normalizeHue(color.h);
  const s = Math.max(0, Math.min(100, color.s)) / 100;
  const l = Math.max(0, Math.min(100, color.l)) / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const section = h / 60;
  const x = chroma * (1 - Math.abs((section % 2) - 1));
  const [r1, g1, b1] = section < 1 ? [chroma, x, 0]
    : section < 2 ? [x, chroma, 0]
      : section < 3 ? [0, chroma, x]
        : section < 4 ? [0, x, chroma]
          : section < 5 ? [x, 0, chroma]
            : [chroma, 0, x];
  const m = l - chroma / 2;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
    a: color.a,
  };
}

export function formatHex(color: RgbaColor): string {
  const base = `#${byteToHex(color.r)}${byteToHex(color.g)}${byteToHex(color.b)}`;
  return color.a < 1 ? `${base}${byteToHex(color.a * 255)}` : base;
}

export function formatRgb(color: RgbaColor): string {
  return color.a < 1
    ? `rgba(${color.r}, ${color.g}, ${color.b}, ${Number(color.a.toFixed(2))})`
    : `rgb(${color.r}, ${color.g}, ${color.b})`;
}

export function formatHsl(color: RgbaColor): string {
  const hsl = rgbaToHsl(color);
  return color.a < 1
    ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${Number(hsl.a.toFixed(2))})`
    : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}
