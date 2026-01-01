import rough from "roughjs";
import type { ShapeStyle, Tool } from "../types";
import type { Options } from "roughjs/bin/core";
const generator = rough.generator();

export const createRoughElement = (
    type: Tool,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    style: ShapeStyle
) => {

    const options: Options = {
        stroke: style.stroke,
        fill: style.fill || undefined
    }
    switch (type) {
        case "line":
            return generator.line(x1, y1, x2, y2);

        case "rectangle":
            return generator.rectangle(
                x1,
                y1,
                x2 - x1,
                y2 - y1,
                options
            );

        case "ellipse": {
            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2;
            return generator.ellipse(
                cx,
                cy,
                Math.abs(x2 - x1),
                Math.abs(y2 - y1),
                options
            );
        }

        default:
            throw new Error(`Invalid type ${type}`)
    }
};
