
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
      {segments.map((segment, index) => {
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
            key={`handle-${index}`}
            className={`absolute pointer-events-auto ${cursor}`}
            style={{
              transform: `translate(-50%, -50%) translate(${handleX}px, ${handleY}px)`,
              width: '12px',
              height: '12px',
            }}
            onMouseDown={(e) => onMouseDown(e, index)}
          >
            <div 
              className={`w-3 h-3 rounded-full border-2 border-white shadow-lg transition-colors ${
                segment.type === 'horizontal' 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`} 
            />
          </div>
        );
      })}
    </EdgeLabelRenderer>
  );
}
