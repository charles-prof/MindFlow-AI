import React, { useCallback, useEffect, useRef } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
    Node,
    BackgroundVariant,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import * as Y from 'yjs';
import { yNodes, yEdges } from '../lib/yjs';
import Sidebar from './Sidebar';

// Helper to convert YMap to Array
const getNodesFromY = () => Array.from(yNodes.values()) as Node[];
const getEdgesFromY = () => Array.from(yEdges.values()) as Edge[];

function MindMapContent() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { screenToFlowPosition } = useReactFlow();

    // Sync initial state and revisions
    useEffect(() => {
        // Initial sync
        setNodes(getNodesFromY());
        setEdges(getEdgesFromY());

        // Listen for Yjs updates
        const nodesObserver = () => {
            setNodes(getNodesFromY());
        };
        const edgesObserver = () => {
            setEdges(getEdgesFromY());
        };

        yNodes.observe(nodesObserver);
        yEdges.observe(edgesObserver);

        return () => {
            yNodes.unobserve(nodesObserver);
            yEdges.unobserve(edgesObserver);
        };
    }, [setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => {
            const newEdge = { ...params, id: `e${params.source}-${params.target}` };
            yEdges.set(newEdge.id, newEdge);
        },
        []
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: crypto.randomUUID(),
                type,
                position,
                data: { label: `${type} node` },
            };

            yNodes.set(newNode.id, newNode);
        },
        [screenToFlowPosition],
    );

    // Sync local changes to Yjs
    const handleNodesChange = useCallback((changes: any) => {
        onNodesChange(changes); // Update local view immediately

        changes.forEach((change: any) => {
            if (change.type === 'position' && change.dragging) {
                const node = yNodes.get(change.id) as Node;
                if (node) {
                    const updated = { ...node, position: change.position };
                    if (node.position.x !== change.position.x || node.position.y !== change.position.y) {
                        yNodes.set(change.id, updated);
                    }
                }
            } else if (change.type === 'remove') {
                yNodes.delete(change.id);
            }
        });
    }, [onNodesChange]);

    const handleEdgesChange = useCallback((changes: any) => {
        onEdgesChange(changes);
        changes.forEach((change: any) => {
            if (change.type === 'remove') {
                yEdges.delete(change.id);
            }
        });
    }, [onEdgesChange]);


    return (
        <div className="flex h-screen w-screen">
            <Sidebar />
            <div className="flex-1 h-full" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={handleEdgesChange}
                    onConnect={onConnect}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    fitView
                >
                    <Controls />
                    <MiniMap />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
}

export default function MindMap() {
    return (
        <ReactFlowProvider>
            <MindMapContent />
        </ReactFlowProvider>
    );
}
