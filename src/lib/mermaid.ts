import type { Edge, Node } from '@xyflow/react';

const sanitizeLabel = (label: string) => {
    return label.replace(/["\n\r]/g, ' ');
};

const sanitizeId = (id: string) => {
    return id.replace(/[^a-zA-Z0-9]/g, '_');
};

export const toMermaid = (nodes: Node[], edges: Edge[]) => {
    let mermaid = 'graph TD\n';

    // Add nodes
    nodes.forEach((node) => {
        const id = sanitizeId(node.id);
        const label = node.data.label ? sanitizeLabel(node.data.label as string) : 'Empty';
        // Use different brackets based on type if desired, e.g. [] for rect, () for round
        mermaid += `    ${id}["${label}"]\n`;
    });

    // Add edges
    edges.forEach((edge) => {
        const source = sanitizeId(edge.source);
        const target = sanitizeId(edge.target);
        mermaid += `    ${source} --> ${target}\n`;
    });

    return mermaid;
};
