import React, { useCallback, useEffect, useRef } from 'react';
import {
    ReactFlow,
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
import Toolbar from './Toolbar';
import { db } from '../db/client';
import { maps } from '../db/schema';
import { getOrCreateUser } from '../lib/db-utils';
import { toast } from 'sonner';
import dagre from 'dagre';
import { MindMapNode } from './MindMapNode';
import MindMapEdge from './MindMapEdge';

const nodeTypes = {
    mindMap: MindMapNode,
};

const edgeTypes = {
    mindMap: MindMapEdge,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 180;
const nodeHeight = 60;

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

// Simple collision detection
const resolveCollisions = (nodes: Node[], draggedNodeId: string): Node[] => {
    const draggedNode = nodes.find(n => n.id === draggedNodeId);
    if (!draggedNode) return nodes;

    const COLLISION_BUFFER = 40;

    return nodes.map(node => {
        if (node.id === draggedNodeId) return node;

        const dx = node.position.x - draggedNode.position.x;
        const dy = node.position.y - draggedNode.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = 160 + COLLISION_BUFFER;

        if (distance < minDistance) {
            const angle = Math.atan2(dy, dx);
            const pushX = Math.cos(angle) * (minDistance - distance);
            const pushY = Math.sin(angle) * (minDistance - distance);

            return {
                ...node,
                position: {
                    x: node.position.x + pushX,
                    y: node.position.y + pushY,
                }
            };
        }
        return node;
    });
};

function MindMapContent() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { screenToFlowPosition, fitView } = useReactFlow();

    const getNodesFromY = useCallback(() => Array.from(yNodes.values()) as Node[], []);
    const getEdgesFromY = useCallback(() => Array.from(yEdges.values()) as Edge[], []);

    const onLayout = useCallback(
        (direction: string) => {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                getNodesFromY(),
                getEdgesFromY(),
                direction
            );

            layoutedNodes.forEach((node) => {
                const existing = yNodes.get(node.id) as Node;
                if (existing) {
                    yNodes.set(node.id, { ...existing, position: node.position });
                }
            });

            setNodes([...layoutedNodes]);
            setEdges([...layoutedEdges]);

            window.requestAnimationFrame(() => {
                fitView({ duration: 800 });
            });
        },
        [fitView, setNodes, setEdges, getNodesFromY, getEdgesFromY]
    );

    useEffect(() => {
        setNodes(getNodesFromY());
        setEdges(getEdgesFromY());

        const nodesObserver = () => setNodes(getNodesFromY());
        const edgesObserver = () => setEdges(getEdgesFromY());

        yNodes.observe(nodesObserver);
        yEdges.observe(edgesObserver);

        return () => {
            yNodes.unobserve(nodesObserver);
            yEdges.unobserve(edgesObserver);
        };
    }, [setNodes, setEdges, getNodesFromY, getEdgesFromY]);

    const onConnect = useCallback(
        (params: Connection) => {
            const newEdge: Edge = {
                ...params,
                id: `e${params.source}-${params.target}-${crypto.randomUUID().slice(0, 8)}`,
                type: 'mindMap',
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

            if (!type) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: crypto.randomUUID(),
                type: 'mindMap',
                position,
                data: { label: shape === 'note' ? '' : 'New Idea', shape: shape || 'pill' },
            };

            yNodes.set(newNode.id, newNode);
        },
        [screenToFlowPosition],
    );

    const handleNodesChange = useCallback((changes: NodeChange[]) => {
        onNodesChange(changes);
        changes.forEach((change) => {
            if (change.type === 'position' && change.dragging && change.position) {
                const node = yNodes.get(change.id) as Node;
                if (node) {
                    // Apply collision detection locally
                    const updatedNodes = resolveCollisions(getNodesFromY(), change.id);
                    updatedNodes.forEach(n => {
                        yNodes.set(n.id, n);
                    });
                }
            } else if (change.type === 'remove') {
                yNodes.delete(change.id);
                // Clean up edges
                const edgesToDelete = Array.from(yEdges.keys()).filter(id => {
                    const edge = yEdges.get(id);
                    return edge?.source === change.id || edge?.target === change.id;
                });
                edgesToDelete.forEach(id => yEdges.delete(id));
            }
        });
    }, [onNodesChange, getNodesFromY]);

    const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
        onEdgesChange(changes);
        changes.forEach((change) => {
            if (change.type === 'remove') {
                yEdges.delete(change.id);
            }
        });
    }, [onEdgesChange]);

    const handleClearCanvas = useCallback(() => {
        if (window.confirm('Are you sure you want to clear the entire canvas?')) {
            yNodes.clear();
            yEdges.clear();
            toast.success('Canvas cleared');
        }
    }, []);

    const handleSaveDB = useCallback(async () => {
        try {
            const user = await getOrCreateUser();
            const content = {
                nodes: getNodesFromY(),
                edges: getEdgesFromY(),
            };

            await db.insert(maps).values({
                title: `Map ${new Date().toLocaleDateString()}`,
                ownerId: user.id,
                content: content,
            });

            toast.success('Saved snapshot!');
        } catch (e: unknown) {
            console.error(e);
            toast.error('Failed to save');
        }
    }, [getNodesFromY, getEdgesFromY]);

    return (
        <div className="flex h-screen w-screen bg-[var(--bg-canvas)] text-[var(--text-main)] overflow-hidden font-sans transition-colors duration-300">
            <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
                <Toolbar onClear={handleClearCanvas} />

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={handleEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    fitView
                    connectionLineType={ConnectionLineType.Bezier}
                    connectionLineStyle={{ stroke: 'var(--accent-color)', strokeWidth: 2 }}
                    proOptions={{ hideAttribution: true }}
                    snapToGrid={true}
                    snapGrid={[20, 20]}
                    defaultEdgeOptions={{ type: 'mindMap' }}
                    minZoom={0.1}
                    maxZoom={2}
                >
                    <Controls className="!bg-[var(--bg-panel)] !border-[var(--border-color)] !fill-[var(--text-muted)] !shadow-xl !rounded-lg overflow-hidden transition-all" />

                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={24}
                        size={1.5}
                        color="var(--grid-color)"
                        className="transition-colors duration-300"
                    />

                    <Panel position="bottom-right" className="flex gap-2 p-4">
                        <button
                            onClick={() => onLayout('LR')}
                            className="bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] px-4 py-2 rounded-lg transition-all shadow-lg text-xs font-bold uppercase tracking-wider"
                        >
                            Auto Layout
                        </button>
                        <button
                            onClick={handleSaveDB}
                            className="bg-blue-600/10 backdrop-blur-xl hover:bg-blue-600/20 text-blue-500 border border-blue-500/20 px-4 py-2 rounded-lg transition-all shadow-lg text-xs font-bold uppercase tracking-wider"
                        >
                            Save
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
