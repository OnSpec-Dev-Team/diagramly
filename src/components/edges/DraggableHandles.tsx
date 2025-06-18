
import React from 'react';
import { EdgeLabelRenderer } from '@xyflow/react';
import { PathSegment } from './types';

interface DraggableHandlesProps {
  segments: PathSegment[];
  onMouseDown: (event: React.MouseEvent, segmentIndex: number) => void;
}

export function DraggableHandles({ segments, onMouseDown }: DraggableHandlesProps) {
  return (
    <EdgeLabelRenderer>
      {segments.map((segment) => {
        if (!segment.isDraggable) return null;
        
        let handleX: number;
        let handleY: number;
        let cursor: string;

        if (segment.type === 'horizontal') {
          handleX = ((segment.startX || 0) + (segment.endX || 0)) / 2;
          handleY = segment.y || 0;
          cursor = 'cursor-ns-resize';
        } else {
          handleX = segment.x || 0;
          handleY = ((segment.startY || 0) + (segment.endY || 0)) / 2;
          cursor = 'cursor-ew-resize';
        }

        return (
          <div
            key={`handle-${segment.index}`}
            className={`absolute pointer-events-auto ${cursor} z-50`}
            style={{
              transform: `translate(-50%, -50%) translate(${handleX}px, ${handleY}px)`,
              width: '16px',
              height: '16px',
            }}
            onMouseDown={(e) => onMouseDown(e, segment.index)}
          >
            <div 
              className={`w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-200 ${
                segment.type === 'horizontal' 
                  ? 'bg-blue-500 hover:bg-blue-600 hover:scale-110' 
                  : 'bg-green-500 hover:bg-green-600 hover:scale-110'
              }`} 
              title={`Drag to move ${segment.type} segment ${segment.type === 'horizontal' ? 'vertically' : 'horizontally'}`}
            />
          </div>
        );
      })}
    </EdgeLabelRenderer>
  );
}
