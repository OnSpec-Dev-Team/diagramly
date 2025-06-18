
import React, { useState, useCallback, useRef } from 'react';
import {
  BaseEdge,
  useReactFlow,
  useStore,
  Node,
  Edge,
} from '@xyflow/react';
import { SmartStepEdgeProps, DragStart, PathSegment } from './types';
import { calculateSmartPath, generateSVGPath, updatePathWithDrag } from './pathUtils';
import { DraggableHandles } from './DraggableHandles';
import { DeleteButton } from './DeleteButton';

export function SmartStepEdge({
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
}: SmartStepEdgeProps) {
  const { setEdges } = useReactFlow();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<DragStart | null>(null);
  const originalPathRef = useRef<any>(null);

  // Get node positions with proper typing
  const nodes = useStore((state) => state.nodes as Node[]);

  // Calculate smart orthogonal path with waypoints
  const pathCalculation = calculateSmartPath(
    sourceX,
    sourceY,
    targetX,
    targetY,
    data.waypoints || []
  );
  
  const points = pathCalculation?.points || [];
  const segments = pathCalculation?.segments || [];

  // Store original path for drag calculations
  if (!originalPathRef.current) {
    originalPathRef.current = pathCalculation;
  }

  // Generate SVG path
  const pathString = generateSVGPath(points);

  const onEdgeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEdges((edges: Edge[]) => edges.filter((edge) => edge.id !== id));
  };

  const handleMouseDown = useCallback((event: React.MouseEvent, segmentIndex: number) => {
    event.stopPropagation();
    const segment = segments[segmentIndex];
    
    // Only allow dragging of middle segments
    if (!segment?.isDraggable) return;
    
    setIsDragging(true);
    dragStartRef.current = { 
      x: event.clientX, 
      y: event.clientY, 
      segmentIndex 
    };

    // Store the original path calculation for this drag operation
    originalPathRef.current = pathCalculation;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dragStart = dragStartRef.current;
      if (!dragStart || !originalPathRef.current) return;

      const deltaX = moveEvent.clientX - dragStart.x;
      const deltaY = moveEvent.clientY - dragStart.y;
      
      // Scale delta for smoother movement
      const scaledDeltaX = deltaX * 0.5;
      const scaledDeltaY = deltaY * 0.5;

      // Calculate updated waypoints based on drag
      const newWaypoints = updatePathWithDrag(
        originalPathRef.current,
        dragStart.segmentIndex,
        scaledDeltaX,
        scaledDeltaY,
        sourceX,
        sourceY,
        targetX,
        targetY
      );

      setEdges((edges: Edge[]) =>
        edges.map((edge) => {
          if (edge.id !== id) return edge;

          return {
            ...edge,
            data: {
              ...edge.data,
              waypoints: newWaypoints.length > 0 ? newWaypoints : undefined,
            },
          };
        })
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
      originalPathRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [id, setEdges, segments, pathCalculation, sourceX, sourceY, targetX, targetY]);

  return (
    <>
      <BaseEdge
        path={pathString}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#ef4444' : style.stroke || '#b1b1b7',
          strokeWidth: selected ? 3 : (style.strokeWidth || 2),
          transition: isDragging ? 'none' : 'stroke 0.2s ease, stroke-width 0.2s ease',
        }}
      />
      
      {selected && (
        <>
          <DraggableHandles 
            segments={segments.filter(s => s.isDraggable)} 
            onMouseDown={handleMouseDown} 
          />
          <DeleteButton 
            sourceX={sourceX}
            sourceY={sourceY}
            targetX={targetX}
            targetY={targetY}
            onDelete={onEdgeClick}
          />
        </>
      )}
    </>
  );
}
