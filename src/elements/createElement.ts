import type { Tool, Element, ShapeStyle } from "../types";
import { createRoughElement } from "./roughFactory";



const normalizeStyle = (style: ShapeStyle) => ({
    fill: style.fill ?? null,
    stroke: style.stroke ?? "#000",
});


export const createElement = (
    id: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: Tool,
    style: ShapeStyle = {}
): Element => {
    const normalizedStyle = normalizeStyle(style);

    switch (type) {
        case "line":
        case "rectangle":
        case "ellipse":
            const roughElement = createRoughElement(
                type,
                x1,
                y1,
                x2,
                y2,
                normalizedStyle
            )

            return {
                id,
                type,
                x1,
                y1,
                x2,
                y2,
                ...normalizedStyle,
                roughElement
            };

        case "pencil":
            return {
                id,
                type,
                points: [{ x: x1, y: y1 }],
            };

        case "text":
            return {
                id,
                type,
                x1,
                y1,
                x2,
                y2,
                text: "",
            };

        default:
            throw new Error(`Type not recognised: ${type}`);
    }
};
