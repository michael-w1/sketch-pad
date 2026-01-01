import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import rough from 'roughjs';
import './App.css'

import type { Tool, Element, SelectedElement, Action, UpdateContext, ShapeStyle } from './types';

import { updateElementByType } from './elements/update/updateElementByType';
import { ShapeOptions } from './components/ShapeOptions';
import ToolBar from './components/ToolBar';
import ZoomUndoRedoBar from './components/ZoomUndoRedoBar';
import { drawElement } from './render/drawElement';
import { useCanvasMouse } from './interaction/useCanvasMouse';



function useStateLog<T>(initialState: T):
  [T, (v: T | ((p: T) => T), overwrite?: boolean) => void, () => void, () => void] {
  const [index, setIndex] = useState(0);
  const [stateLog, setStateLog] = useState<T[]>([initialState]);

  const setState = (action: T | ((p: T) => T), overwrite = false) => {

    let newState: T;
    if (typeof action === "function") {
      newState = (action as (p: T) => T)(stateLog[index])
    } else {
      newState = action;
    }


    if (overwrite) {
      const stateLogCopy = [...stateLog];
      stateLogCopy[index] = newState;
      setStateLog(stateLogCopy);
    } else {
      const updatedState = [...stateLog].slice(0, index + 1);
      setStateLog([...updatedState, newState]);
      setIndex(prevState => prevState + 1);
    }
  };

  const undo = () => index > 0 && setIndex(prevState => prevState - 1);
  const redo = () => index < stateLog.length - 1 && setIndex(prevState => prevState + 1);

  return [stateLog[index], setState, undo, redo];
};


const usePressedKeys = (): Set<string> => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setPressedKeys(prevKeys => new Set(prevKeys).add(event.key));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setPressedKeys(prevKeys => {
        const updatedKeys = new Set(prevKeys);
        updatedKeys.delete(event.key);
        return updatedKeys;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return pressedKeys;
};

const App = () => {
  const [elements, setElements, undo, redo] = useStateLog<Element[]>([]);
  const [action, setAction] = useState<Action>("none");
  const [tool, setTool] = useState<Tool>("rectangle");
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [startPanMousePosition, setStartPanMousePosition] = useState({ x: 0, y: 0 });
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const pressedKeys = usePressedKeys();
  const [scale, setScale] = useState(1);
  const [scaleOffset, setScaleOffset] = useState({ x: 0, y: 0 })
  const [shapeStyle, setShapeStyle] = useState<ShapeStyle>({
    fill: null,
    stroke: "#000000",
  });

//   useEffect(() => {
//   console.log("Selected Element:", selectedElement);
// }, [selectedElement]);

// useEffect(() => {
//   console.log("Current action:", action);
// }, [action]);


  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const roughCanvas = rough.canvas(canvas);

    context.clearRect(0, 0, canvas.width, canvas.height);

    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;


    const scaledOffsetX = (scaledWidth - canvas.width) / 2;
    const scaledOffsetY = (scaledHeight - canvas.height) / 2;

    setScaleOffset({ x: scaledOffsetX, y: scaledOffsetY });

    context.save();
    context.translate(panOffset.x * scale - scaledOffsetX, panOffset.y * scale - scaledOffsetY);
    context.scale(scale, scale);

    // console.log("Drawing text element:", element.text, element.x1, element.y1, element.x2, element.y2);

    elements.forEach(element => {
      // console.log("Drawing text element:", element.text, element.x1, element.y1, element.x2, element.y2);

      if (action === "writing" && selectedElement && selectedElement.id === element.id) return;
      drawElement(roughCanvas, context, element);
    });
    context.restore();
  }, [elements, action, selectedElement, panOffset, scale]);

  useEffect(() => {
    const undoRedoFunction = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    document.addEventListener("keydown", undoRedoFunction);
    return () => {
      document.removeEventListener("keydown", undoRedoFunction);
    };
  }, [undo, redo]);

  useEffect(() => {
    const panOrZoomFunction = (event: WheelEvent) => {
      if (pressedKeys.has("Meta") || pressedKeys.has("Control")) onZoom(event.deltaY * -0.01)
      else
        setPanOffset(prevState => ({
          x: prevState.x - event.deltaX,
          y: prevState.y - event.deltaY,
        }));
    };

    document.addEventListener("wheel", panOrZoomFunction);
    return () => {
      document.removeEventListener("wheel", panOrZoomFunction);
    };
  }, [pressedKeys]);

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (action === "writing" && textArea && selectedElement?.type === "text") {
      setTimeout(() => {
        textArea.focus();
        textArea.value = selectedElement.text || "";
      }, 0);
    }
  }, [action, selectedElement]);

  const updateElement = (
    id: number,
    x1: number,
    y1: number,
    x2: number | null,
    y2: number | null,
    _type: Tool,
    options?: { text: string }) => {


    const canvas = document.getElementById("canvas");
    const ctx: UpdateContext = {
      x1,
      y1,
      x2: x2 ?? undefined,
      y2: y2 ?? undefined,
      text: options?.text,
      canvas: canvas instanceof HTMLCanvasElement ? canvas : undefined
    };

    setElements(prev => {
      const next = [...prev]
      next[id] = updateElementByType(prev[id], ctx);
      return next;
    }, true);
  };


  const onZoom = (delta: number) => {
    setScale(prevState => Math.min(Math.max(prevState + delta, 0.1), 20));
  };

  const { handleMouseDown, handleMouseMove, handleMouseUp, handleBlur } = useCanvasMouse({
    elements,
    setElements,
    tool,
    action,
    setAction,
    selectedElement,
    setSelectedElement,
    updateElement,
    setPanOffset, 
    panOffset,
    scale,
    scaleOffset,
    pressedKeys,
    startPanMousePosition,
    shapeStyle,
    setStartPanMousePosition
  });

  const showShapeOptions =
    tool === "rectangle" || tool === "ellipse";
  return (
    <div>
      {showShapeOptions && (
        <ShapeOptions
          shapeStyle={shapeStyle}
          setShapeStyle={setShapeStyle}
        />
      )}
      <div>


        <ToolBar tool={tool} setTool={setTool} />
        {/* Text input */}
        {action === "writing" && selectedElement?.type === "text" ? (
          <textarea
            ref={textAreaRef}
            onBlur={handleBlur}
            className="fixed z-20 resize-none overflow-hidden whitespace-pre bg-transparent p-0 outline-none"
            style={{
              top: (selectedElement.y1 - 2) * scale + panOffset.y * scale - scaleOffset.y,
              left: selectedElement.x1 * scale + panOffset.x * scale - scaleOffset.x,
              font: `${25 * scale}px sans-serif`,
            }}
          />
        ) : null}
      </div>

      <ZoomUndoRedoBar onZoom={onZoom} scale={scale} setScale={setScale} undo={undo} redo={redo} />




      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ position: "absolute", zIndex: 1 }}
      >
        Canvas
      </canvas>
    </div>
  );
};





export default App;


