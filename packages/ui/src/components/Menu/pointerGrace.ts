import type { Side } from "../../primitives/position";

export interface Point {
  x: number;
  y: number;
}

export type Polygon = readonly Point[];

/**
 * The area the pointer can cross from `point`, where it left a submenu's trigger, to the submenu
 * open at `rect` on `side` of it, without the submenu closing.
 */
export function getSubmenuGracePolygon(point: Point, rect: DOMRect, side: Side): Polygon {
  const topLeft = { x: rect.left, y: rect.top };
  const topRight = { x: rect.right, y: rect.top };
  const bottomRight = { x: rect.right, y: rect.bottom };
  const bottomLeft = { x: rect.left, y: rect.bottom };
  const corners = {
    top: [bottomLeft, topLeft, topRight, bottomRight],
    right: [topLeft, topRight, bottomRight, bottomLeft],
    bottom: [topLeft, bottomLeft, bottomRight, topRight],
    left: [topRight, topLeft, bottomLeft, bottomRight],
  }[side];
  const bleed = side === "right" ? -5 : 5;
  return [{ x: point.x + bleed, y: point.y }, ...corners];
}

export function isPointInPolygon(polygon: Polygon, { x, y }: Point): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
