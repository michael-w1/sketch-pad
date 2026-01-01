import { type FocusEvent, type MouseEvent } from 'react'
import { getElementAtPosition, cursorForPosition, resizedCoordinates, adjustElementCoordinates } from '../geometry/utils';
import { createElement } from '../elements/createElement';
import type { Element, Action, PencilElement, Point, SelectedElement, ShapeStyle, Tool } from '../types';


type useCanvasMouseProps = {
    elements: Element[];
    setElements: (elements: Element[] | ((prev: Element[]) => Element[]), overwrite?: boolean) => void;
    tool: Tool;
    action: Action;
    setAction: React.Dispatch<React.SetStateAction<Action>>;
    selectedElement: SelectedElement | null;
    setSelectedElement: React.Dispatch<React.SetStateAction<SelectedElement | null>>;
updateElement: (id: number, x1: number, y1: number, x2: number | null, y2: number | null, _type: Tool, options?: {text: string; }) => void
    panOffset: Point;
    setPanOffset: React.Dispatch<React.SetStateAction<Point>>;
    scale: number;
    scaleOffset: Point;
    pressedKeys: Set<string>; 
    startPanMousePosition: Point;
    setStartPanMousePosition: React.Dispatch<React.SetStateAction<Point>>;
    shapeStyle: ShapeStyle;
}

export function useCanvasMouse({
    elements,
    setElements,
    tool,
    action,
    setAction,
    selectedElement,
    setSelectedElement,
    updateElement,
    panOffset,
    scale,
    scaleOffset,
    pressedKeys,
    startPanMousePosition,
    setPanOffset,
    setStartPanMousePosition, 
    shapeStyle, 
}: useCanvasMouseProps) {
    const getMouseCoordinates = (event: MouseEvent<HTMLCanvasElement>) => {
        const clientX = (event.clientX - panOffset.x * scale + scaleOffset.x) / scale;
        const clientY = (event.clientY - panOffset.y * scale + scaleOffset.y) / scale;
        return { clientX, clientY };
    };

    const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
        if (action === "writing") return;

        const { clientX, clientY } = getMouseCoordinates(event);

        if (event.button === 1 || pressedKeys.has(" ")) {
            setAction("panning");
            setStartPanMousePosition({ x: clientX, y: clientY });
            return;
        }

        if (tool === "selection") {
            const element = getElementAtPosition(clientX, clientY, elements);
            if (element) {
                if (element.type === "pencil") {
                    const xOffsets = element.points.map(point => clientX - point.x);
                    const yOffsets = element.points.map(point => clientY - point.y);
                    setSelectedElement({ ...element, xOffsets, yOffsets });
                } else {
                    const offsetX = clientX - element.x1;
                    const offsetY = clientY - element.y1;
                    setSelectedElement({ ...element, offsetX, offsetY });
                }
                setElements(prevState => prevState);

                if (element.position === "inside") {
                    setAction("moving");
                } else {
                    setAction("resizing");
                }
            }
        } else {
            const id = elements.length;
            const element = createElement(id, clientX, clientY, clientX, clientY, tool, shapeStyle);
            setElements(prevState => [...prevState, element]);
            setSelectedElement(element);

            setAction(tool === "text" ? "writing" : "drawing");
        }
    };

    const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
        const { clientX, clientY } = getMouseCoordinates(event);

        if (action === "panning") {
            const deltaX = clientX - startPanMousePosition.x;
            const deltaY = clientY - startPanMousePosition.y;
            setPanOffset({
                x: panOffset.x + deltaX,
                y: panOffset.y + deltaY,
            });
            return;
        }

        if (tool === "selection") {
            const element = getElementAtPosition(clientX, clientY, elements);
            const target = event.target as HTMLCanvasElement;
            target.style.cursor = element ? cursorForPosition(element.position) : "default";
        }

        if (action === "drawing") {
            const index = elements.length - 1;
            const element = elements[index];
            if (element.type === "pencil") {
                const lastPoint = element.points[element.points.length - 1];
                updateElement(index, lastPoint.x, lastPoint.y, clientX, clientY, tool);
            } else if (
                element.type === "line" ||
                element.type === "rectangle" ||
                element.type === "text" || element.type === "ellipse"
            ) {
                const { x1, y1 } = element;
                updateElement(index, x1, y1, clientX, clientY, tool);
            }
            //     const { x1, y1 } = elements[index];
            //     updateElement(index, x1, y1, clientX, clientY, tool);
        } else if (action === "moving") {
            if (!selectedElement) return;
            if (selectedElement.type === "pencil" && "xOffsets" in selectedElement && "yOffsets" in selectedElement) {
                const newPoints = selectedElement.points.map((_, index) => ({
                    x: clientX - selectedElement.xOffsets[index],
                    y: clientY - selectedElement.yOffsets[index],
                }));
                const elementsCopy = [...elements];


                const pencilElement = elementsCopy[selectedElement.id] as PencilElement;
                elementsCopy[selectedElement.id] = {
                    ...pencilElement,
                    points: newPoints,
                };
                setElements(elementsCopy, true);
            } else {
                if (!('x1' in selectedElement && 'x2' in selectedElement && 'y1' in selectedElement && 'y2' in selectedElement)) return
                const { id, x1, x2, y1, y2, type, offsetX = 0, offsetY = 0 } = selectedElement;
                const width = x2 - x1;
                const height = y2 - y1;
                const newX1 = clientX - offsetX;
                const newY1 = clientY - offsetY;
               
                const options = type === "text" && 'text' in selectedElement ? { text: selectedElement.text } : undefined;

                updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type, options);

            }
        } else if (action === "resizing") {


            if (selectedElement && 'x1' in selectedElement && 'x2' in selectedElement && 'y1' in selectedElement && 'y2' in selectedElement && selectedElement.position) {
                const { id, type, position, ...coordinates } = selectedElement;
                const coord = resizedCoordinates(clientX, clientY, position, coordinates);

                if (!coord) return;
                const { x1, y1, x2, y2 } = coord;
                updateElement(id, x1, y1, x2, y2, type);
            }
        }
    };

    const handleMouseUp = (event: MouseEvent<HTMLCanvasElement>) => {
        const { clientX, clientY } = getMouseCoordinates(event);
        if (selectedElement) {
            if (
                selectedElement.type === "text" && selectedElement.offsetX
                && selectedElement.offsetY &&
                clientX - selectedElement.offsetX === selectedElement.x1 &&
                clientY - selectedElement.offsetY === selectedElement.y1
            ) {
                setAction("writing");
                return;
            }

            const index = selectedElement.id;
            const { id, type } = elements[index];
            if ((action === "drawing" || action === "resizing") && (type === "rectangle" || type === "line" || type === "ellipse")) {
                const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
                updateElement(id, x1, y1, x2, y2, type);
            }
        }

        if (action === "writing") return;

        setAction("none");
        setSelectedElement(null);
    };

    const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
        if (!selectedElement || selectedElement.type !== "text") return
        const { id, x1, y1, type } = selectedElement;
        setAction("none");
        setSelectedElement(null);
        updateElement(id, x1, y1, null, null, type, { text: event.target.value });
    };

    return { handleMouseUp, handleMouseMove, handleMouseDown, handleBlur };
}