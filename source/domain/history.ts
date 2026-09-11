import type { RgbaColor } from './color';

export const RECENT_COLOR_LIMIT = 12;

function isChannel(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 255;
}

function isRgbaColor(value: unknown): value is RgbaColor {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<RgbaColor>;
  return isChannel(candidate.r)
    && isChannel(candidate.g)
    && isChannel(candidate.b)
    && typeof candidate.a === 'number'
    && Number.isFinite(candidate.a)
    && candidate.a >= 0
    && candidate.a <= 1;
}

export function recentColorKey(color: RgbaColor): string {
  return `${color.r}:${color.g}:${color.b}:${color.a.toFixed(6)}`;
}

export function addRecentColor(history: readonly RgbaColor[], color: RgbaColor): RgbaColor[] {
  const key = recentColorKey(color);
  return [color, ...history.filter((item) => recentColorKey(item) !== key)].slice(0, RECENT_COLOR_LIMIT);
}

export function removeRecentColor(history: readonly RgbaColor[], color: RgbaColor): RgbaColor[] {
  const key = recentColorKey(color);
  return history.filter((item) => recentColorKey(item) !== key);
}

export function clearRecentColors(): RgbaColor[] {
  return [];
}

export function sanitizeRecentColors(value: unknown): RgbaColor[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: RgbaColor[] = [];
  for (const item of value) {
    if (!isRgbaColor(item)) continue;
    const key = recentColorKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ r: item.r, g: item.g, b: item.b, a: item.a });
    if (result.length === RECENT_COLOR_LIMIT) break;
  }
  return result;
}
