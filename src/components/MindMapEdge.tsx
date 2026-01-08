import { BaseEdge, type EdgeProps, getBezierPath } from '@xyflow/react';

export default function MindMapEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    selected,
}: EdgeProps) {
    // Use a balanced curvature for all shape connections
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        curvature: 0.5, // Slightly less curved for better clarity between different shapes
    });

    return (
        <BaseEdge
            id={id}
            path={edgePath}
            markerEnd={markerEnd}
            style={{
                ...style,
                strokeWidth: selected ? 3 : 2,
                stroke: selected ? 'var(--accent-color)' : 'var(--text-muted)',
                strokeLinecap: 'round',
                opacity: selected ? 1 : 0.4,
                transition: 'all 0.2s ease',
            }}
        />
    );
}
