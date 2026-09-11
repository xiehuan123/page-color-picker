import { parseCanonicalColor, type RgbaColor } from '../domain/color';

export function parseCssColor(input: string): RgbaColor | null {
  const text = input.trim();
  if (!text) return null;
  const context = document.createElement('canvas').getContext('2d');
  if (!context) return null;

  context.fillStyle = '#010203';
  context.fillStyle = text;
  const againstDarkSentinel = context.fillStyle;
  context.fillStyle = '#FDFCFB';
  context.fillStyle = text;
  const againstLightSentinel = context.fillStyle;
  if (againstDarkSentinel !== againstLightSentinel) return null;
  return parseCanonicalColor(againstDarkSentinel);
}
