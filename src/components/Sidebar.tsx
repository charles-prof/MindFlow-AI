import React from 'react';
import { yNodes, yEdges } from '../lib/yjs';
import { toMermaid } from '../lib/mermaid';
import type { Node, Edge } from '@xyflow/react';
import { Share2, Box, LayoutGrid, Clock, Settings, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Sidebar() {
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
        <aside className="w-72 h-full bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-8 shadow-2xl z-20 overflow-y-auto">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Box className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">MindFlow AI</h1>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Creative Cloud</p>
                </div>
            </div>

            <nav className="flex flex-col gap-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Workspace</p>
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm transition-all hover:bg-indigo-600/20">
                    <LayoutGrid className="w-4 h-4" />
                    <span className="text-sm font-semibold">Active Board</span>
                </button>
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
                    <Clock className="w-4 h-4 group-hover:text-indigo-400" />
                    <span className="text-sm font-medium">History</span>
                </button>
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
                    <Settings className="w-4 h-4 group-hover:text-indigo-400" />
                    <span className="text-sm font-medium">Board Settings</span>
                </button>
            </nav>

            <div className="mt-auto flex flex-col gap-6">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                        <HelpCircle className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-white">Need help?</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        Drag shapes from the left toolbar to start building your mind flow.
                    </p>
                </div>

                <div className="pt-6 border-t border-slate-800/50">
                    <button
                        onClick={handleExport}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-500/10 active:scale-95 border border-indigo-500/50"
                    >
                        <Share2 className="w-4 h-4" />
                        <span>Export Map</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
