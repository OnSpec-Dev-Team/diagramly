
import React, { useState, useCallback, useRef } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  useReactFlow,
  EdgeProps,
} from '@xyflow/react';
import { X } from 'lucide-react';

interface DraggableStepEdgeProps extends EdgeProps {
  selected?: boolean;
  data?: {
    horizontalOffset?: number;
    verticalOffset?: number;
  };
}

export function DraggableStepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data = {},
}: DraggableStepEdgeProps) {
  const { setEdges } = useReactFlow();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Get offsets from edge data or use defaults
  const horizontalOffset = data.horizontalOffset || 0;
  const verticalOffset = data.verticalOffset || 0;

  // Calculate step path with minimum bends
  const calculateStepPath = () => {
    const midX = (sourceX + targetX) / 2 + horizontalOffset;
    const midY = (sourceY + targetY) / 2 + verticalOffset;

    // Create orthogonal path with minimum bends
    const path = `
      M ${sourceX},${sourceY}
      L ${midX},${sourceY}
      L ${midX},${targetY}
      L ${targetX},${targetY}
    `;

    return {
      path: path.trim(),
      segments: [
        { type: 'horizontal', startX: sourceX, endX: midX, y: sourceY },
        { type: 'vertical', x: midX, startY: sourceY, endY: targetY },
        { type: 'horizontal', startX: midX, endX: targetX, y: targetY },
      ],
      midX,
      midY,
    };
  };

  const { path, segments, midX, midY } = calculateStepPath();

  const onEdgeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const handleMouseDown = useCallback((event: React.MouseEvent, segmentType: 'horizontal' | 'vertical') => {
    event.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = { x: event.clientX, y: event.clientY };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;

      const deltaX = moveEvent.clientX - dragStartRef.current.x;
      const deltaY = moveEvent.clientY - dragStartRef.current.y;

      setEdges((edges) =>
        edges.map((edge) =>
          edge.id === id
            ? {
                ...edge,
                data: {
                  ...edge.data,
                  horizontalOffset: segmentType === 'horizontal' 
                    ? (data.horizontalOffset || 0) + deltaX * 0.5
                    : (data.horizontalOffset || 0),
                  verticalOffset: segmentType === 'vertical' 
                    ? (data.verticalOffset || 0) + deltaY * 0.5
                    : (data.verticalOffset || 0),
                },
              }
            : edge
        )
      );

      dragStartRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [id, setEdges, data]);

  return (
    <>
      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#ef4444' : style.stroke || '#b1b1b7',
          strokeWidth: selected ? 3 : (style.strokeWidth || 2),
        }}
      />
      
      {selected && (
        <EdgeLabelRenderer>
          {/* Horizontal segment handle */}
          <div
            className="absolute pointer-events-auto cursor-ew-resize"
            style={{
              transform: `translate(-50%, -50%) translate(${(sourceX + midX) / 2}px, ${sourceY}px)`,
              width: '12px',
              height: '12px',
            }}
            onMouseDown={(e) => handleMouseDown(e, 'horizontal')}
          >
            <div className="w-3 h-3 bg-blue-500 hover:bg-blue-600 rounded-full border-2 border-white shadow-lg transition-colors" />
          </div>

          {/* Vertical segment handle */}
          <div
            className="absolute pointer-events-auto cursor-ns-resize"
            style={{
              transform: `translate(-50%, -50%) translate(${midX}px, ${(sourceY + targetY) / 2}px)`,
              width: '12px',
              height: '12px',
            }}
            onMouseDown={(e) => handleMouseDown(e, 'vertical')}
          >
            <div className="w-3 h-3 bg-green-500 hover:bg-green-600 rounded-full border-2 border-white shadow-lg transition-colors" />
          </div>

          {/* Final horizontal segment handle */}
          <div
            className="absolute pointer-events-auto cursor-ew-resize"
            style={{
              transform: `translate(-50%, -50%) translate(${(midX + targetX) / 2}px, ${targetY}px)`,
              width: '12px',
              height: '12px',
            }}
            onMouseDown={(e) => handleMouseDown(e, 'horizontal')}
          >
            <div className="w-3 h-3 bg-blue-500 hover:bg-blue-600 rounded-full border-2 border-white shadow-lg transition-colors" />
          </div>

          {/* Delete button */}
          <div
            className="absolute pointer-events-auto"
            style={{
              transform: `translate(-50%, -50%) translate(${midX}px, ${sourceY + (targetY - sourceY) * 0.3}px)`,
            }}
          >
            <button
              className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-colors duration-200"
              onClick={onEdgeClick}
              title="Delete edge"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
