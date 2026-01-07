import React from 'react';
import { MousePointer2, Square, Circle, Diamond, Type, Eraser } from 'lucide-react';

export default function Toolbar() {
    const onDragStart = (event: React.DragEvent, nodeType: string, shape: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/shape', shape);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 p-3 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-50">
            <button className="p-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-110 transition-transform">
                <MousePointer2 className="w-5 h-5" />
            </button>
            <div className="w-full h-px bg-slate-800" />

            <div
                className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={(e) => onDragStart(e, 'mindMap', 'square')}
                title="Rectangle"
            >
                <Square className="w-5 h-5" />
            </div>

            <div
                className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={(e) => onDragStart(e, 'mindMap', 'pill')}
                title="Idea (Pill)"
            >
                <div className="w-5 h-3 border-2 border-current rounded-full" />
            </div>

            <div
                className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={(e) => onDragStart(e, 'mindMap', 'circle')}
                title="Circle"
            >
                <Circle className="w-5 h-5" />
            </div>

            <div
                className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={(e) => onDragStart(e, 'mindMap', 'diamond')}
                title="Decision (Diamond)"
            >
                <Diamond className="w-5 h-5" />
            </div>

            <div
                className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={(e) => onDragStart(e, 'mindMap', 'note')}
                title="Note"
            >
                <Type className="w-5 h-5" />
            </div>

            <div className="w-full h-px bg-slate-800" />

            <button className="p-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all" title="Clear Canvas">
                <Eraser className="w-5 h-5" />
            </button>
        </div>
    );
}
