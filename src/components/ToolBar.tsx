import {
    MousePointer2,
    Square,
    Minus,
    Type,
    Pencil,
    Circle,
} from 'lucide-react';
import type { Tool } from '../types';

const tools: [Tool, string][] = [
    ["selection", "Selection"],
    ["line", "Line"],
    ["rectangle", "Rectangle"],
        ["ellipse", "Ellipse"],
    ["pencil", "Pencil"],
    ["text", "Text"],

];


const TOOL_ICONS: Record<string, React.ElementType> = {
    selection: MousePointer2,
    rectangle: Square,
    line: Minus,
    text: Type,
    pencil: Pencil,
    ellipse: Circle,
};

type ToolBarProps = {
    tool: Tool,
    setTool: (e: Tool) => void
}
const ToolBar = ({ tool, setTool }: ToolBarProps) => {
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 items-center z-20 flex gap-1 rounded-lg bg-white p-1.5 shadow-xl border border-gray-100">
            {tools.map(([value, label]) => {
                const Icon = TOOL_ICONS[value] || MousePointer2;
                return (
                    <div key={value}>
                        <input
                            type="radio"
                            id={value}
                            checked={tool === value}
                            onChange={() => setTool(value)}
                            className="peer hidden"
                        />
                        <label
                            htmlFor={value}
                            title={label} // Shows name on hover
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md 
                       text-gray-600 transition-colors hover:bg-gray-100
                       peer-checked:bg-blue-50 peer-checked:text-blue-600"
                        >
                            <Icon size={18} strokeWidth={2.5} />
                        </label>
                    </div>
                );
            })}
        </div>


    )
}

export default ToolBar;