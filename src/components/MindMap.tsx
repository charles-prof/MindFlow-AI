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
    ConnectionLineType,
    Position,
} from '@xyflow/react';
import type { Connection, Edge, Node, NodeChange, EdgeChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { yNodes, yEdges } from '../lib/yjs';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import { db } from '../db/client';
import { maps } from '../db/schema';
import { getOrCreateUser } from '../lib/db-utils';
import { toast } from 'sonner';
import dagre from 'dagre';

// Helper to convert YMap to Array
const getNodesFromY = () => Array.from(yNodes.values()) as Node[];
const getEdgesFromY = () => Array.from(yEdges.values()) as Edge[];

import { MindMapNode } from './MindMapNode';

const nodeTypes = {
    mindMap: MindMapNode,
    default: MindMapNode,
    input: MindMapNode,
    output: MindMapNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 180;
const nodeHeight = 50;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    return {
        nodes: nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            const newNode: Node = {
                ...node,
                targetPosition: isHorizontal ? Position.Left : Position.Top,
                sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                position: {
                    x: nodeWithPosition.x - nodeWidth / 2,
                    y: nodeWithPosition.y - nodeHeight / 2,
                },
            };

            return newNode;
        }),
        edges,
    };
};

function MindMapContent() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { screenToFlowPosition, fitView } = useReactFlow();

    const onLayout = useCallback(
        (direction: string) => {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                getNodesFromY(), // Use latest from Yjs
                getEdgesFromY(), // Use latest from Yjs
                direction
            );

            // Update Yjs (shared state) with new positions
            layoutedNodes.forEach((node) => {
                const existing = yNodes.get(node.id) as Node;
                if (existing) {
                    yNodes.set(node.id, { ...existing, position: node.position });
                }
            });

            // Local update (optional, but good for responsiveness)
            setNodes([...layoutedNodes]);
            setEdges([...layoutedEdges]);

            window.requestAnimationFrame(() => {
                fitView();
            });
        },
        [fitView, setNodes, setEdges]
    );

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
            const newEdge: Edge = {
                ...params,
                id: `e${params.source}-${params.target}`,
                type: 'bezier', // Smooth curves
                animated: true,
                style: { stroke: '#64748b', strokeWidth: 2 },
            };
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
            const shape = event.dataTransfer.getData('application/shape');

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
                data: { label: `New ${shape || 'Idea'}`, shape: shape || 'pill' },
            };

            yNodes.set(newNode.id, newNode);
        },
        [screenToFlowPosition],
    );

    // Sync local changes to Yjs
    const handleNodesChange = useCallback((changes: NodeChange[]) => {
        onNodesChange(changes); // Update local view immediately

        changes.forEach((change) => {
            if (change.type === 'position' && change.dragging && change.position) {
                const node = yNodes.get(change.id) as Node;
                if (node && node.position) {
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

    const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
        onEdgesChange(changes);
        changes.forEach((change) => {
            if (change.type === 'remove') {
                yEdges.delete(change.id);
            }
        });
    }, [onEdgesChange]);



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

            toast.success('Saved snapshot to local PGlite database!');
        } catch (e: unknown) {
            console.error(e);
            toast.error('Failed to save to database: ' + (e instanceof Error ? e.message : String(e)));
        }
    }, []);

    return (
        <div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
            <Sidebar />
            <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
                <Toolbar />
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={handleEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    fitView
                    connectionLineType={ConnectionLineType.Bezier}
                    connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
                    proOptions={{ hideAttribution: true }}
                    snapToGrid={true}
                    snapGrid={[20, 20]}
                >
                    <Controls className="bg-slate-800 border-slate-700 fill-slate-200" />
                    <MiniMap
                        className="!bg-slate-800 border-slate-700"
                        nodeColor='#64748b'
                        maskColor='rgba(15, 23, 42, 0.6)'
                    />
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1}
                        color="#334155"
                        className="bg-slate-950"
                    />
                    <Panel position="top-right" className="flex gap-3 p-4">
                        <button onClick={() => onLayout('LR')} className="bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium py-2 px-4 rounded-xl shadow-xl transition-all duration-200 text-sm">
                            Auto Layout
                        </button>
                        <button onClick={handleSaveDB} className="bg-emerald-500/10 backdrop-blur-md hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium py-2 px-4 rounded-xl shadow-xl transition-all duration-200 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Save Map
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
