
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Square } from 'lucide-react';

export const ValveNode = memo(({ data }: { data: { label: string } }) => {
  return (
    <div className="bg-white border-2 border-green-300 rounded-lg shadow-lg min-w-[120px] hover:shadow-xl transition-shadow duration-200">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
      
      <div className="p-4 text-center">
        <div className="flex justify-center mb-2">
          <div className="p-2 bg-green-100 rounded-full">
            <Square className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="text-sm font-medium text-gray-700">{data.label}</div>
        <div className="text-xs text-gray-500 mt-1">Control Valve</div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </div>
  );
});

ValveNode.displayName = 'ValveNode';
