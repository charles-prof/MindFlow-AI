import React, { useCallback, useEffect, useRef } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
    Panel,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import type { Connection, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { yNodes, yEdges } from '../lib/yjs';
import Sidebar from './Sidebar';
import { db } from '../db/client';
import { maps } from '../db/schema';
import { getOrCreateUser } from '../lib/db-utils';

// Helper to convert YMap to Array
const getNodesFromY = () => Array.from(yNodes.values()) as Node[];
const getEdgesFromY = () => Array.from(yEdges.values()) as Edge[];

function MindMapContent() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
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
            const newEdge: Edge = { ...params, id: `e${params.source}-${params.target}` };
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

    const onAddNode = useCallback(() => {
        const id = crypto.randomUUID();
        const newNode: Node = {
            id,
            position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
            data: { label: `Node ${yNodes.size + 1}` },
            type: 'default',
        };
        yNodes.set(id, newNode);
    }, []);

    const handleSaveDB = useCallback(async () => {
        try {
            const user = await getOrCreateUser();
            const content = {
                nodes: getNodesFromY(),
                edges: getEdgesFromY(),
            };

            await db.insert(maps).values({
                title: `Map ${new Date().toISOString()}`,
                ownerId: user.id,
                content: content,
            }).returning();

            alert('Saved snapshot to local PGlite database!');
        } catch (e) {
            console.error(e);
            alert('Failed to save to database: ' + (e as any).message);
        }
    }, []);

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
                    <Panel position="top-right" className="flex gap-2">
                        <button onClick={handleSaveDB} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                            Save to DB
                        </button>
                        <button onClick={onAddNode} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Add Node
                        </button>
                    </Panel>
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
