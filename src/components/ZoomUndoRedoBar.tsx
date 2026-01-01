import {
    ZoomOut,
    ZoomIn,
    Undo2,
    Redo2,
} from 'lucide-react';

type ZoomUndoRedoBarProps = {
    onZoom: (x: number) => void,
    scale: number,
    setScale: (scale: number) => void,
    undo: () => void,
    redo: () => void
}

export const ZoomUndoRedoBar = ({ onZoom, scale, setScale, undo, redo }: ZoomUndoRedoBarProps) => {
    return (
        <div className="fixed bottom-4 left-4 z-20 flex items-center gap-1 rounded-lg bg-white p-1.5 shadow-xl border border-gray-100">
            <button
                title='Zoom Out'
                onClick={() => onZoom(-0.1)}
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 text-gray-600"
            >
                <ZoomOut size={16} />
            </button>

            <span
                onClick={() => setScale(1)}
                className="min-w-12.5 text-center cursor-pointer select-none rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
                {Math.round(scale * 100)}%
            </span>

            <button
                title='Zoom In'
                onClick={() => onZoom(+0.1)}
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 text-gray-600"
            >
                <ZoomIn size={16} />
            </button>

            <div className="mx-2 h-4 w-px bg-gray-200" />

            <button
                onClick={undo}
                title="Undo"
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-30"
            >
                <Undo2 size={16} />
            </button>

            <button
                onClick={redo}
                title="Redo"
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-30"
            >
                <Redo2 size={16} />
            </button>
        </div>

    )

}

export default ZoomUndoRedoBar;