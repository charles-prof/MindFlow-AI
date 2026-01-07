import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';

export const doc = new Y.Doc();
// Create a shared map for nodes and edges
export const yNodes = doc.getMap('nodes');
export const yEdges = doc.getMap('edges');

// Connect to peers (webrtc)
// In a real app, the room name would be dynamic (e.g. map ID)
export const provider = new WebrtcProvider('mindflow-demo-room', doc);

// Persist to indexeddb (offline first)
export const persistence = new IndexeddbPersistence('mindflow-persistence', doc);

export const useYjs = () => {
    const [synced, setSynced] = useState(false);

    useEffect(() => {
        persistence.on('synced', () => {
            setSynced(true);
        });
    }, []);

    return { doc, provider, persistence, synced };
};
