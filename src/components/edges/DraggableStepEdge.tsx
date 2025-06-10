
import React, { useState, useCallback } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  EdgeProps,
} from '@xyflow/react';
import { X } from 'lucide-react';

interface DraggableStepEdgeProps extends EdgeProps {
  selected?: boolean;
  data?: {
    offsetX?: number;
    offsetY?: number;
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

  // Get offsets from edge data or use defaults
  const offsetX = data.offsetX || 0;
  const offsetY = data.offsetY || 0;

  // Calculate path with offsets
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    offset: 50,
  });

  // Calculate midpoints for draggable handles
  const midX = (sourceX + targetX) / 2 + offsetX;
  const midY = (sourceY + targetY) / 2 + offsetY;

  const onEdgeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const handleHorizontalDrag = useCallback((event: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newOffsetY = event.clientY - (sourceY + targetY) / 2;
    
    setEdges((edges) =>
      edges.map((edge) =>
        edge.id === id
          ? {
              ...edge,
              data: {
                ...edge.data,
                offsetY: newOffsetY,
              },
            }
          : edge
      )
    );
  }, [id, isDragging, setEdges, sourceY, targetY]);

  const handleVerticalDrag = useCallback((event: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newOffsetX = event.clientX - (sourceX + targetX) / 2;
    
    setEdges((edges) =>
      edges.map((edge) =>
        edge.id === id
          ? {
              ...edge,
              data: {
                ...edge.data,
                offsetX: newOffsetX,
              },
            }
          : edge
      )
    );
  }, [id, isDragging, setEdges, sourceX, targetX]);

  const startDrag = useCallback(() => {
    setIsDragging(true);
  }, []);

  const stopDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Custom step path with offsets
  const customStepPath = `
    M ${sourceX},${sourceY}
    L ${sourceX},${midY}
    L ${midX},${midY}
    L ${midX},${targetY}
    L ${targetX},${targetY}
  `;

  return (
    <>
      <BaseEdge
        path={customStepPath}
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
            className="absolute pointer-events-auto cursor-ns-resize"
            style={{
              transform: `translate(-50%, -50%) translate(${midX}px, ${midY}px)`,
              width: '12px',
              height: '12px',
            }}
            onMouseDown={startDrag}
            onMouseMove={handleHorizontalDrag}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
          >
            <div className="w-3 h-3 bg-blue-500 hover:bg-blue-600 rounded-full border-2 border-white shadow-lg" />
          </div>

          {/* Vertical segment handle (left side) */}
          <div
            className="absolute pointer-events-auto cursor-ew-resize"
            style={{
              transform: `translate(-50%, -50%) translate(${sourceX}px, ${(sourceY + midY) / 2}px)`,
              width: '12px',
              height: '12px',
            }}
            onMouseDown={startDrag}
            onMouseMove={handleVerticalDrag}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
          >
            <div className="w-3 h-3 bg-green-500 hover:bg-green-600 rounded-full border-2 border-white shadow-lg" />
          </div>

          {/* Vertical segment handle (right side) */}
          <div
            className="absolute pointer-events-auto cursor-ew-resize"
            style={{
              transform: `translate(-50%, -50%) translate(${midX}px, ${(midY + targetY) / 2}px)`,
              width: '12px',
              height: '12px',
            }}
            onMouseDown={startDrag}
            onMouseMove={handleVerticalDrag}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
          >
            <div className="w-3 h-3 bg-green-500 hover:bg-green-600 rounded-full border-2 border-white shadow-lg" />
          </div>

          {/* Delete button */}
          <div
            className="absolute pointer-events-auto"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
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
