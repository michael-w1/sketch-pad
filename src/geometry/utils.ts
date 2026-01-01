
import type { Element, Point, Position, LineElement, RectangleElement, EllipseElement, Coordinate, Cursor } from "../types";

const nearPoint = (x: number, y: number, x1: number, y1: number, name: Position): Position | null => {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
};

const onLine = (x1: number, y1: number, x2: number, y2: number, x: number, y: number, maxDistance = 1) => {
  const a = { x: x1, y: y1 };
  const b = { x: x2, y: y2 };
  const c = { x, y };
  const offset = distance(a, b) - (distance(a, c) + distance(b, c));
  return Math.abs(offset) < maxDistance ? "inside" : null;
};


const distance = (a: Point, b: Point) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const getElementAtPosition = (x: number, y: number, elements: Element[]): (Element & { position: Position }) | undefined => {
  return elements
    .map(element => ({ ...element, position: positionWithinElement(x, y, element) }))
    .find(element => element.position !== null);
};



const positionWithinElement = (x: number, y: number, element: Element): Position => {
  switch (element.type) {
    case "line": {
      const { x1, x2, y1, y2 } = element;
      const on = onLine(x1, y1, x2, y2, x, y);
      const start = nearPoint(x, y, x1, y1, "start");
      const end = nearPoint(x, y, x2, y2, "end");
      return start || end || on;
    }
    case "rectangle": {
      const { x1, x2, y1, y2 } = element;
      const topLeft = nearPoint(x, y, x1, y1, "tl");
      const topRight = nearPoint(x, y, x2, y1, "tr");
      const bottomLeft = nearPoint(x, y, x1, y2, "bl");
      const bottomRight = nearPoint(x, y, x2, y2, "br");
      const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
      return topLeft || topRight || bottomLeft || bottomRight || inside;
    }
    case "pencil":
      const betweenAnyPoint = element.points.some((point, index) => {
        const nextPoint = element.points[index + 1];
        if (!nextPoint) return false;
        return onLine(point.x, point.y, nextPoint.x, nextPoint.y, x, y, 5) != null;
      });
      return betweenAnyPoint ? "inside" : null;
    case "text": {
      const { x1, x2, y1, y2 } = element;
      return x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
    }

    case "ellipse": {
      const { x1, x2, y1, y2 } = element;



      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;

      const width = Math.abs(x2 - x1);
      const height = Math.abs(y2 - y1);
      const a = width / 2;
      const b = height / 2;

      const topLeft = nearPoint(x, y, x1, cy, "tl");
      const topRight = nearPoint(x, y, x2, cy, "tr");
      const bottomLeft = nearPoint(x, y, cx, y1, "bl");
      const bottomRight = nearPoint(x, y, cx, y2, "br");
      // Apply the ellipse equation
      // (x - h)^2 / a^2 + (y - k)^2 / b^2 <= 1
      const result = Math.pow(x - cx, 2) / Math.pow(a, 2) +
        Math.pow(y - cy, 2) / Math.pow(b, 2);

      // console.log(topLeft, topRight, bottomLeft, bottomRight, inside); 
      const inside = result <= 1 ? "inside" : null;
      //  console.log(topLeft, topRight, bottomLeft, bottomRight, inside); 
      return topLeft || topRight || bottomLeft || bottomRight || inside;

    }

    default:
      throw new Error(`Type not recognized ${element}`);
  }
};


const adjustElementCoordinates = (element: LineElement | RectangleElement | EllipseElement): Coordinate => {
  const { type, x1, y1, x2, y2 } = element;
  if (type === "rectangle" || type === "ellipse") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      return { x1, y1, x2, y2 };
    } else {
      return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
  }
};

const cursorForPosition = (position: Position): Cursor => {
  switch (position) {
    case "tl":
    case "br":
    case "start":
    case "end":
      return "nwse-resize";
    case "tr":
    case "bl":
      return "nesw-resize";
    default:
      return "move";
  }
};

const resizedCoordinates = (clientX: number, clientY: number, position: Position, coordinates: Coordinate): Coordinate | null => {
  const { x1, y1, x2, y2 } = coordinates;
  switch (position) {
    case "tl":
    case "start":
      return { x1: clientX, y1: clientY, x2, y2 };
    case "tr":
      return { x1, y1: clientY, x2: clientX, y2 };
    case "bl":
      return { x1: clientX, y1, x2, y2: clientY };
    case "br":
    case "end":
      return { x1, y1, x2: clientX, y2: clientY };
    default:
      return null;
  }
};


export {
    nearPoint, 
    onLine, 
    getElementAtPosition, 
    resizedCoordinates, 
    cursorForPosition, 
    adjustElementCoordinates, 
    positionWithinElement
}