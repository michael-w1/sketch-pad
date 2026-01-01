import type { UpdateContext, Element } from "../../types";
import { updatePencilElement } from "./updatePencilElement";

import { updateShapeElement } from "./updateShapeElement";
import { updateTextElement } from "./updateTextElement";

export function updateElementByType(element: Element, ctx: UpdateContext): Element {
  switch (element.type) {
    case "line":
    case "rectangle":
    case "ellipse":
      return updateShapeElement(element, ctx);

    case "pencil":
      return updatePencilElement(element, ctx);

    case "text":
      return updateTextElement(element, ctx);

    default:
      return element;
  }
}
