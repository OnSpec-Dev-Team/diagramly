
import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { FlowCanvas } from '../components/FlowCanvas';

const Index = () => {
  return (
    <div className="h-screen w-full bg-gray-50">
      <ReactFlowProvider>
        <FlowCanvas />
      </ReactFlowProvider>
    </div>
  );
};

export default Index;
