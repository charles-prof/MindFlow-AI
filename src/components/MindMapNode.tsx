import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import { yNodes, yEdges } from '../lib/yjs';
import { twMerge } from 'tailwind-merge';
import { Sparkles, Plus, MoreHorizontal, Trash2 } from 'lucide-react';

export function MindMapNode({ id, data, isConnectable, selected }: NodeProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        const node = yNodes.get(id) as Node;
        if (node) {
            yNodes.set(id, { ...node, data: { ...node.data, label: evt.target.value } });
        }
    }, [id]);

    const onDelete = useCallback(() => {
        yNodes.delete(id);
        // Find and delete associated edges
        const edgesToDelete = Array.from(yEdges.keys()).filter(edgeId => {
            const edge = yEdges.get(edgeId);
            return edge?.source === id || edge?.target === id;
        });
        edgesToDelete.forEach(edgeId => yEdges.delete(edgeId));
    }, [id]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [data.label]);

    const shape = (data.shape as string) || 'pill';

    const getShapeStyles = () => {
        switch (shape) {
            case 'circle':
                return "rounded-full w-28 h-28 aspect-square";
            case 'diamond':
                return "rotate-45 w-24 h-24 aspect-square";
            case 'rectangle':
                return "rounded-sm px-4 py-2 min-w-[120px] min-h-[60px]";
            case 'rounded-rectangle':
                return "rounded-xl px-5 py-3 min-w-[140px] min-h-[50px]";
            case 'pill':
            default:
                return "rounded-full px-6 py-2.5 min-w-[140px]";
        }
    };

    const innerContentStyles = shape === 'diamond'
        ? '-rotate-45 text-center flex items-center justify-center w-full h-full'
        : 'w-full h-full flex flex-col items-center justify-center py-1';

    const borderColors = {
        pill: '#3b82f6', // Blue
        circle: '#ef4444', // Red
        diamond: '#10b981', // Emerald
        rectangle: '#f59e0b', // Amber
        'rounded-rectangle': '#8b5cf6', // Violet
    };

    const accentColor = borderColors[shape as keyof typeof borderColors] || '#94a3b8';

    return (
        <div
            className="group relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setShowMenu(false);
            }}
        >
            {/* Contextual Action Bar */}
            <div className={twMerge(
                "absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl transition-all duration-200 z-50",
                isHovered || selected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            )}>
                <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-blue-500 font-bold text-[11px] uppercase tracking-wider rounded-md transition-colors">
                    <Sparkles size={14} className="fill-blue-500/20" />
                    Ask AI
                </button>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />
                <button className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 rounded-md transition-colors">
                    <Plus size={14} />
                </button>
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 rounded-md transition-colors"
                    >
                        <MoreHorizontal size={14} />
                    </button>

                    {/* Ellipsis Menu */}
                    <div className={twMerge(
                        "absolute top-full right-0 mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 overflow-hidden transition-all duration-200",
                        showMenu ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                    )}>
                        <button
                            onClick={onDelete}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                            <Trash2 size={12} />
                            Delete Node
                        </button>
                    </div>
                </div>
            </div>

            {/* Shape Container */}
            <div
                className={twMerge(
                    "relative z-10 bg-white dark:bg-slate-900 border-[2px] transition-all duration-300 flex items-center justify-center overflow-hidden",
                    getShapeStyles(),
                    selected
                        ? "shadow-[0_0_0_4px_rgba(59,130,246,0.15)] scale-[1.02]"
                        : "shadow-lg hover:shadow-xl shadow-slate-200/50 dark:shadow-black/50"
                )}
                style={{ borderColor: selected ? '#3b82f6' : accentColor }}
            >
                {shape === 'pill' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 opacity-80" />
                )}

                <div className={innerContentStyles}>
                    <textarea
                        ref={textareaRef}
                        value={data.label as string}
                        onChange={onChange}
                        rows={1}
                        className="nodrag bg-transparent border-none focus:ring-0 text-center text-slate-900 dark:text-slate-50 font-bold text-sm w-full outline-none resize-none overflow-hidden leading-tight placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-colors"
                        placeholder="Text"
                    />
                </div>

                {/* Left/Right + expansion anchors - now with improved theme visibility */}
                {(isHovered || selected) && (
                    <>
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100 transition-opacity p-1 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-100 dark:border-slate-800">
                            <Plus size={14} className="text-slate-500 dark:text-slate-400 cursor-pointer hover:text-blue-500 transition-colors" />
                        </div>
                        <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100 transition-opacity p-1 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-100 dark:border-slate-800">
                            <Plus size={14} className="text-slate-500 dark:text-slate-400 cursor-pointer hover:text-blue-500 transition-colors" />
                        </div>
                    </>
                )}
            </div>

            {/* Handles - Adjusted for Shape Types especially Diamond */}
            <Handle
                type="target"
                position={Position.Left}
                className="!opacity-0 !w-8 !h-8 !border-none !bg-transparent"
                style={shape === 'diamond' ? { left: '-15px', top: '50%' } : { left: '-10px' }}
            />
            <Handle
                type="source"
                position={Position.Right}
                className="!opacity-0 !w-8 !h-8 !border-none !bg-transparent"
                style={shape === 'diamond' ? { right: '-15px', top: '50%' } : { right: '-10px' }}
            />
            <Handle
                type="target"
                position={Position.Top}
                className="!opacity-0 !w-8 !h-8 !border-none !bg-transparent"
                style={shape === 'diamond' ? { top: '-15px', left: '50%' } : { top: '-10px' }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="!opacity-0 !w-8 !h-8 !border-none !bg-transparent"
                style={shape === 'diamond' ? { bottom: '-15px', left: '50%' } : { bottom: '-10px' }}
            />
        </div>
    );
}
