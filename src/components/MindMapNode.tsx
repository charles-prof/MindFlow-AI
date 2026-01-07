import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';

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
        <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 min-w-[150px]">
            <div className="flex flex-col">
                <div className="text-lg font-bold">
                    <input
                        value={data.label as string}
                        onChange={onChange}
                        className="nodrag bg-transparent border-none focus:outline-none w-full text-center"
                    />
                </div>
            </div>

            <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
            <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
        </div>
    );
}
