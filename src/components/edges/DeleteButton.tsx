
import React from 'react';
import { EdgeLabelRenderer } from '@xyflow/react';
import { X } from 'lucide-react';

interface DeleteButtonProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  onDelete: (event: React.MouseEvent) => void;
}

export function DeleteButton({ sourceX, sourceY, targetX, targetY, onDelete }: DeleteButtonProps) {
  return (
    <EdgeLabelRenderer>
      <div
        className="absolute pointer-events-auto"
        style={{
          transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px, ${(sourceY + targetY) / 2}px)`,
        }}
      >
        <button
          className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-colors duration-200"
          onClick={onDelete}
          title="Delete edge"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </EdgeLabelRenderer>
  );
}
