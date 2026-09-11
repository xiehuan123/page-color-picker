export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface MappedPoint extends Point {
  scaleX: number;
  scaleY: number;
}

export function mapViewportPoint(point: Point, viewport: Size, bitmap: Size): MappedPoint {
  const scaleX = bitmap.width / viewport.width;
  const scaleY = bitmap.height / viewport.height;
  return {
    x: Math.max(0, Math.min(bitmap.width - 1, Math.floor(point.x * scaleX))),
    y: Math.max(0, Math.min(bitmap.height - 1, Math.floor(point.y * scaleY))),
    scaleX,
    scaleY,
  };
}
