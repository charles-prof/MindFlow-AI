# MindFlow AI

MindFlow AI is a smart, drag-and-drop mind mapping tool built with React Flow, Local-First PGlite database, and Yjs for real-time state management.

## Features

- **Drag-and-Drop Interface**: Easy to use mind map canvas with React Flow.
- **Node Editing**: Double-click nodes to edit labels (custom implementation).
- **Local-First Persistence**: Saves snapshots of your mind map to a local PGlite (PostgreSQL in WASM) database.
- **Mermaid.js Export**: Export your mind map to Mermaid.js syntax for easy sharing and documentation.
- **Real-time State**: Built on Yjs (CRDTs) to ensure data consistency and enable future real-time collaboration.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, TailwindCSS
- **State Management**: Yjs (y-webrtc, y-indexeddb)
- **Database**: PGlite, Drizzle ORM
- **Visualization**: React Flow
- **Testing**: Vitest

## Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Run Development Server**

   ```bash
   npm run dev
   ```

3. **Build for Production**

   ```bash
   npm run build
   ```

4. **Run Tests**

   ```bash
   npx vitest run
   ```

## Development

- **Database Schema**: Located in `src/db/schema.ts`.
- **Migrations**: Run `npx drizzle-kit generate` to generate migrations after schema changes.

## License

MIT
