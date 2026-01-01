import { createElement } from "../createElement";
import type { LineElement, RectangleElement, EllipseElement, UpdateContext } from "../../types";

export function updateShapeElement(
  element: LineElement | RectangleElement | EllipseElement,
  ctx: UpdateContext, 
  
) {
  if (ctx.x2 == null || ctx.y2 == null) return element;

  return createElement(
    element.id,
    ctx.x1,
    ctx.y1,
    ctx.x2,
    ctx.y2,
    element.type,
    {
      fill: element.fill ?? null,
      stroke: element.stroke ?? "#000",
    }
  );
}
