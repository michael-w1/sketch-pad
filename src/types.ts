import type { Drawable } from "roughjs/bin/core";

type Tool = "selection" | "line" | "rectangle" | "pencil" | "text" | "ellipse";
type Action = "none" | "drawing" | "moving" | "resizing" | "writing" | "panning";
type Position =
    | "inside"
    | "start"
    | "end"
    | "tl"
    | "tr"
    | "bl"
    | "br"
    | null;

type Point = {
    x: number;
    y: number;
};

type Cursor = "nesw-resize" | "nwse-resize" | "move"




interface BaseElement {
    id: number;
    type: Tool;
}

interface LineElement extends BaseElement {
    type: "line";
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    fill?: string | null;
    stroke?: string;
    roughElement: Drawable;
}

interface RectangleElement extends BaseElement {
    type: "rectangle";
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    fill?: string | null;
    stroke?: string;
    roughElement: Drawable;
}

interface EllipseElement extends BaseElement {
    type: "ellipse";
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    fill?: string | null;
    stroke?: string;
    roughElement: Drawable;
}

interface PencilElement extends BaseElement {
    type: "pencil";
    points: Point[];
}

interface TextElement extends BaseElement {
    type: "text";
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    text: string;
}

type Element =
    | LineElement
    | RectangleElement
    | PencilElement
    | EllipseElement
    | TextElement;


type Coordinate = {
    x1: number,
    y1: number,
    x2: number,
    y2: number
}

type SelectedElement =
    | (Element & {
        position?: Position;
        offsetX?: number;
        offsetY?: number;
    })
    | (PencilElement & {
        xOffsets: number[];
        yOffsets: number[];
    });


type UpdateContext = {
    x1: number;
    y1: number;
    x2?: number;
    y2?: number;
    text?: string;
    canvas?: HTMLCanvasElement;
};

type ShapeStyle = {
    fill?: string | null;
    stroke?: string;
};

export type {
    ShapeStyle,
    UpdateContext,
    Coordinate,
    Cursor,
    TextElement,
    Element,
    SelectedElement,
    Tool,
    PencilElement,
    BaseElement,
    LineElement,
    RectangleElement,
    Action,
    Point,
    Position,
    EllipseElement
};
