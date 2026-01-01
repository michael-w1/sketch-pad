import type { PencilElement, UpdateContext } from "../../types";

export function updatePencilElement(
  element: PencilElement,
  ctx: UpdateContext
): PencilElement {
  if (ctx.x2 == null || ctx.y2 == null) return element;

  return {
    ...element,
    points: [...element.points, { x: ctx.x2, y: ctx.y2 }],
  };
}
