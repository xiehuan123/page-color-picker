import type { RgbaColor } from '../domain/color';
import { sanitizeRecentColors } from '../domain/history';

const STORAGE_KEY = 'recentColors';

export async function loadRecentColors(): Promise<RgbaColor[]> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  return sanitizeRecentColors(stored[STORAGE_KEY]);
}

export async function saveRecentColors(colors: readonly RgbaColor[]): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: sanitizeRecentColors(colors) });
}
