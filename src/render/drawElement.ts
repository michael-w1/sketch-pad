import type { RoughCanvas } from "roughjs/bin/canvas";
import getStroke from 'perfect-freehand';
import type { Element } from "../types";

// Not using pressure from freehand draw lib. 
const getSvgPathFromStroke = (stroke: [x: number, y: number][]): string => {
  if (!stroke.length) return "";

  const d = stroke.reduce<(string | number)[]>(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
};

export function drawElement(
  roughCanvas: RoughCanvas,
  context: CanvasRenderingContext2D,
  element: Element
) {
  switch (element.type) {
    case "line":
    case "rectangle":
    case "ellipse":
      roughCanvas.draw(element.roughElement);
      break;
    case "pencil":
      const stroke = getSvgPathFromStroke(getStroke(element.points) as [number, number][]);
      context.fill(new Path2D(stroke));
      break;
    case "text":
      context.textBaseline = "top";
      context.font = "25px sans-serif";
      context.fillText(element.text, element.x1, element.y1);
      break;
    default:
      throw new Error(`Type not recognised: ${element}`);
  }
};