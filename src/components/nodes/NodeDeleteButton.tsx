
import React from 'react';
import { X } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

interface NodeDeleteButtonProps {
  nodeId: string;
}

export function NodeDeleteButton({ nodeId }: NodeDeleteButtonProps) {
  const { setNodes } = useReactFlow();

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
  };

  return (
    <button
      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-colors duration-200 opacity-0 group-hover:opacity-100 z-10"
      onClick={handleDelete}
      title="Delete node"
    >
      <X className="w-3 h-3" />
    </button>
  );
}
