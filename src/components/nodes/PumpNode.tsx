
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layers } from 'lucide-react';

export const PumpNode = memo(({ data }: { data: { label: string } }) => {
  return (
    <div className="bg-white border-2 border-purple-300 rounded-lg shadow-lg min-w-[120px] hover:shadow-xl transition-shadow duration-200">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
        isConnectable={true}
      />
      
      <div className="p-4 text-center">
        <div className="flex justify-center mb-2">
          <div className="p-2 bg-purple-100 rounded-full">
            <Layers className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <div className="text-sm font-medium text-gray-700">{data.label}</div>
        <div className="text-xs text-gray-500 mt-1">Pump Unit</div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
        isConnectable={true}
      />
    </div>
  );
});

PumpNode.displayName = 'PumpNode';
