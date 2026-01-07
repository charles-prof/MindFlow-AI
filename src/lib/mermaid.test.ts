import { describe, it, expect } from 'vitest';
import { toMermaid } from './mermaid';
import type { Node, Edge } from '@xyflow/react';

describe('mermaid export', () => {
    it('should convert nodes and edges to mermaid syntax', () => {
        const nodes: Node[] = [
            { id: '1', position: { x: 0, y: 0 }, data: { label: 'Start' } },
            { id: '2', position: { x: 100, y: 0 }, data: { label: 'End' } },
        ];
        const edges: Edge[] = [
            { id: 'e1-2', source: '1', target: '2' },
        ];

        const mermaid = toMermaid(nodes, edges);

        expect(mermaid).toContain('graph TD');
        expect(mermaid).toContain('1["Start"]');
        expect(mermaid).toContain('2["End"]');
        expect(mermaid).toContain('1 --> 2');
    });

    it('should sanitize labels', () => {
        const nodes: Node[] = [
            { id: '1', position: { x: 0, y: 0 }, data: { label: 'Line\nBreak' } },
            { id: '2', position: { x: 100, y: 0 }, data: { label: 'Quote"' } },
        ];
        const edges: Edge[] = [];

        const mermaid = toMermaid(nodes, edges);

        expect(mermaid).toContain('1["Line Break"]');
        expect(mermaid).toContain('2["Quote "]');
    });
});
