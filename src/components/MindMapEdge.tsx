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
    data,
}: EdgeProps) {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        curvature: 0.5,
    });

    const edgeColor = (data?.color as string) || 'var(--text-muted)';

    return (
        <BaseEdge
            id={id}
            path={edgePath}
            markerEnd={markerEnd}
            style={{
                ...style,
                strokeWidth: selected ? 3 : 2,
                stroke: selected ? 'var(--accent-color)' : edgeColor,
                strokeLinecap: 'round',
                opacity: selected ? 1 : 0.6,
                transition: 'all 0.2s ease',
            }}
        />
    );
}
