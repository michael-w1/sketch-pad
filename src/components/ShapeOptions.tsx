import type { ShapeStyle } from "../types";

const COLORS = [
    "Black",
    "Crimson",
    "Green",
    "SteelBlue",
    "Orange",
    "Grey",
    null, // no fill
];



export const ShapeOptions = ({
    shapeStyle,
    setShapeStyle,
}: {
    shapeStyle: ShapeStyle;
    setShapeStyle: (s: ShapeStyle) => void;
}) => {
    return (
        <div className="absolute top-14 left-4 z-30 rounded-lg bg-white p-3 shadow-lg">
            <div className="mb-2 text-xs font-semibold text-gray-500">
                Fill
            </div>
            <ColourPalette
                value={shapeStyle?.fill || null}
                allowNone
                onChange={(fill) => setShapeStyle({ ...shapeStyle, fill })}
            />

            <div className="mt-3 mb-2 text-xs font-semibold text-gray-500">
                Stroke
            </div>
            <ColourPalette
                value={shapeStyle?.stroke || null}
                onChange={(stroke) => {
                    if (!stroke) return
                    setShapeStyle({ ...shapeStyle, stroke });

                }
                }
            />

        </div>
    );
};

const ColourPalette = ({
    value,
    onChange,
    allowNone = false,
}: {
    value: string | null;
    onChange: (c: string | null) => void;
    allowNone?: boolean;
}) => (
    <div className="flex flex-wrap gap-2">
        {COLORS.map((color) =>
            color === null && !allowNone ? null : (
                <button
                    key={color ?? "none"}
                    onClick={() => onChange(color)}
                    className={`
                        h-6 w-6 rounded border border-gray-300 transition-all
                        hover:scale-110 active:scale-95
                        ${value === color ? "ring-1 ring-black ring-offset-1" : "ring-0"}
                    `}
                    // Checkboard pattern with css 
                    // https://stackoverflow.com/questions/35361986/css-gradient-checkerboard-pattern
                    style={{
                        backgroundColor: color ?? "#ffffff",
                        backgroundImage: color === null
                            ? `repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%)`
                            : "none",
                        backgroundSize: "8px 8px",
                        backgroundPosition: "0 0"
                    }}
                >

                </button>
            )
        )}
    </div>
);

