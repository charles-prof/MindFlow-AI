import React from 'react';

export default function Sidebar() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 h-full bg-white border-r border-gray-200 p-4 flex flex-col gap-4">
            <h1 className="text-xl font-bold text-gray-800">MindFlow</h1>
            <div className="text-sm text-gray-500 mb-4">Drag nodes to the canvas.</div>

            <div
                className="dndnode input p-2 border border-blue-500 rounded cursor-grab bg-blue-50 hover:bg-blue-100 text-blue-900"
                onDragStart={(event) => onDragStart(event, 'input')}
                draggable
            >
                Input Node
            </div>
            <div
                className="dndnode default p-2 border border-gray-500 rounded cursor-grab bg-gray-50 hover:bg-gray-100 text-gray-900"
                onDragStart={(event) => onDragStart(event, 'default')}
                draggable
            >
                Default Node
            </div>
            <div
                className="dndnode output p-2 border border-green-500 rounded cursor-grab bg-green-50 hover:bg-green-100 text-green-900"
                onDragStart={(event) => onDragStart(event, 'output')}
                draggable
            >
                Output Node
            </div>
        </aside>
    );
}
