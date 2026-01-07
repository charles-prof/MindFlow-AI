import React, { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { yNodes } from '../lib/yjs';

export function MindMapNode({ id, data }: NodeProps) {
    const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        // Update local immediately if handled by React Flow's internal state via some mechanism?
        // Actually, for Yjs we want to update the shared state.
        // We do it directly here.
        const node = yNodes.get(id) as Node;
        if (node) {
            // We spread node content to ensure we keep position etc
            // NOTE: This might cause re-renders for everyone.
            yNodes.set(id, { ...node, data: { ...node.data, label: evt.target.value } });
        }
    }, [id]);

    return (
        <div className="group px-4 py-3 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] rounded-2xl bg-white border border-gray-100 hover:border-indigo-300 transition-all duration-300 min-w-[200px]">
            <div className="flex flex-col items-center">
                <div className="text-sm font-semibold w-full">
                    <input
                        value={data.label as string}
                        onChange={onChange}
                        className="nodrag bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none w-full text-center text-gray-700 placeholder-gray-400 transition-colors duration-200 py-1"
                        placeholder="Enter label..."
                    />
                </div>
            </div>

            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !-top-1.5 !bg-indigo-500 !border-2 !border-white transition-transform duration-200 group-hover:scale-110" />
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !-bottom-1.5 !bg-indigo-500 !border-2 !border-white transition-transform duration-200 group-hover:scale-110" />
        </div>
    );
}
