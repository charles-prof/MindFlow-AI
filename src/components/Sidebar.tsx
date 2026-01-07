import React from 'react';
import { yNodes, yEdges } from '../lib/yjs';
import { toMermaid } from '../lib/mermaid';
import type { Node, Edge } from '@xyflow/react';
import { Share2, Box, Circle, Square, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Sidebar() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const handleExport = () => {
        const nodes = Array.from(yNodes.values()) as Node[];
        const edges = Array.from(yEdges.values()) as Edge[];
        const mermaid = toMermaid(nodes, edges);
        navigator.clipboard.writeText(mermaid).then(() => {
            toast.success('Diagram Exported', {
                description: 'Mermaid syntax copied to clipboard.'
            });
        });
    };

    return (
        <aside className="w-72 h-full bg-slate-950 border-r border-slate-800 p-6 flex flex-col gap-8 shadow-2xl z-20">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Box className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">MindFlow AI</h1>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Workspace</p>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Library</p>
                <div className="grid gap-3">
                    <div
                        className="group flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-grab active:cursor-grabbing shadow-sm"
                        onDragStart={(event) => onDragStart(event, 'input')}
                        draggable
                    >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <Circle className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-300 group-hover:text-white">Input Node</span>
                    </div>

                    <div
                        className="group flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-all cursor-grab active:cursor-grabbing shadow-sm"
                        onDragStart={(event) => onDragStart(event, 'default')}
                        draggable
                    >
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                            <Square className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-300 group-hover:text-white">Brainstorm Node</span>
                    </div>

                    <div
                        className="group flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 transition-all cursor-grab active:cursor-grabbing shadow-sm"
                        onDragStart={(event) => onDragStart(event, 'output')}
                        draggable
                    >
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <CheckCircle className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-300 group-hover:text-white">Result Node</span>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-800/50">
                <button
                    onClick={handleExport}
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-all border border-slate-700 hover:border-slate-600 shadow-lg active:scale-95"
                >
                    <Share2 className="w-4 h-4 text-blue-400" />
                    <span>Export Mermaid</span>
                </button>
            </div>
        </aside>
    );
}
