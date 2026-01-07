// import React from 'react';
import MindMap from './components/MindMap';
import './index.css';
import { Toaster } from 'sonner';

function App() {
  return (
    <div className="App">
      <Toaster position="top-center" richColors />
      <MindMap />
    </div>
  );
}

export default App;
