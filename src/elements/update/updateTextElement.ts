import type { TextElement, UpdateContext } from "../../types";

export function updateTextElement(element: TextElement, ctx: UpdateContext): TextElement {
  const newText = ctx.text ?? element.text;
  const newX = ctx.x1 ?? element.x1;
  const newY = ctx.y1 ?? element.y1;

  const context = ctx.canvas?.getContext("2d");
  const width = context ? context.measureText(newText).width : element.x2 - element.x1;
  const height = 25;

  return {
    ...element,
    text: newText,
    x1: newX,
    y1: newY,
    x2: newX + width,
    y2: newY + height,
  };
}
