import React, { useCallback } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { yNodes } from '../lib/yjs';

export function MindMapNode({ id, data, isConnectable }: NodeProps) {
    const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        const node = yNodes.get(id) as Node;
        if (node) {
            yNodes.set(id, { ...node, data: { ...node.data, label: evt.target.value } });
        }
    }, [id]);

    return (
        <div className="group relative">
            <div className="relative z-10 px-6 py-3 rounded-full bg-slate-800/90 backdrop-blur-md border border-slate-700/50 shadow-xl hover:border-blue-500/50 hover:shadow-blue-500/20 transition-all duration-300 min-w-[150px]">
                <div className="flex flex-col items-center">
                    <input
                        value={data.label as string}
                        onChange={onChange}
                        className="nodrag bg-transparent border-none focus:ring-0 text-center text-slate-200 placeholder-slate-500 font-medium text-sm w-full outline-none"
                        placeholder="New Idea..."
                    />
                </div>
            </div>

            {/* Hidden handles that appear on group hover, styled as small dots */}
            <Handle
                type="target"
                position={Position.Left}
                isConnectable={isConnectable}
                className="w-2 h-2 !bg-blue-500/80 !border-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-1"
            />
            <Handle
                type="source"
                position={Position.Right}
                isConnectable={isConnectable}
                className="w-2 h-2 !bg-blue-500/80 !border-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mr-1"
            />
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="w-2 h-2 !bg-blue-500/80 !border-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mt-1"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="w-2 h-2 !bg-blue-500/80 !border-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mb-1"
            />
        </div>
    );
}
