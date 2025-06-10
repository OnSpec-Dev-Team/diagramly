
import React, { useState, useCallback, useRef } from 'react';
import {
  BaseEdge,
  useReactFlow,
  useStore,
} from '@xyflow/react';
import { SmartStepEdgeProps, DragStart, PathSegment } from './types';
import { calculateSmartPath, generateSVGPath } from './pathUtils';
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

  // Get node positions for overlap detection
  const nodes = useStore((state) => state.nodes);

  // Calculate smart orthogonal path with waypoints
  const pathCalculation = calculateSmartPath(
    sourceX,
    sourceY,
    targetX,
    targetY,
    data.waypoints || []
  );
  
  const { points, segments }: { points: any[], segments: PathSegment[] } = pathCalculation;

  // Generate SVG path
  const pathString = generateSVGPath(points);

  const onEdgeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const handleMouseDown = useCallback((event: React.MouseEvent, segmentIndex: number) => {
    event.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = { 
      x: event.clientX, 
      y: event.clientY, 
      segmentIndex 
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dragStart = dragStartRef.current;
      if (!dragStart) return;

      const deltaX = moveEvent.clientX - dragStart.x;
      const deltaY = moveEvent.clientY - dragStart.y;
      const segIdx = dragStart.segmentIndex;
      const segment = segments[segIdx];

      if (!segment) return;

      setEdges((edges) =>
        edges.map((edge) => {
          if (edge.id !== id) return edge;

          const currentWaypoints = edge.data?.waypoints || [];
          const newWaypoints = [...currentWaypoints];

          if (segment.type === 'horizontal') {
            // Moving horizontal segment vertically
            const newY = (segment.y || 0) + deltaY * 0.5;
            
            // Update or create waypoint
            if (segIdx === 0) {
              // First segment
              newWaypoints[0] = { x: segment.endX || segment.startX || 0, y: newY };
            } else if (segIdx === segments.length - 1) {
              // Last segment
              newWaypoints[newWaypoints.length - 1] = { x: segment.startX || 0, y: newY };
            } else {
              // Middle segment
              if (newWaypoints[segIdx - 1]) {
                newWaypoints[segIdx - 1] = { ...newWaypoints[segIdx - 1], y: newY };
              }
              if (newWaypoints[segIdx]) {
                newWaypoints[segIdx] = { ...newWaypoints[segIdx], y: newY };
              }
            }
          } else {
            // Moving vertical segment horizontally
            const newX = (segment.x || 0) + deltaX * 0.5;
            
            // Update or create waypoint
            if (segIdx === 0) {
              // First segment
              newWaypoints[0] = { x: newX, y: segment.endY || segment.startY || 0 };
            } else if (segIdx === segments.length - 1) {
              // Last segment
              newWaypoints[newWaypoints.length - 1] = { x: newX, y: segment.startY || 0 };
            } else {
              // Middle segment
              if (newWaypoints[segIdx - 1]) {
                newWaypoints[segIdx - 1] = { ...newWaypoints[segIdx - 1], x: newX };
              }
              if (newWaypoints[segIdx]) {
                newWaypoints[segIdx] = { ...newWaypoints[segIdx], x: newX };
              }
            }
          }

          return {
            ...edge,
            data: {
              ...edge.data,
              waypoints: newWaypoints.length > 0 ? newWaypoints : undefined,
            },
          };
        })
      );

      // Update dragStart with new position
      dragStartRef.current = { 
        x: moveEvent.clientX, 
        y: moveEvent.clientY,
        segmentIndex: dragStart.segmentIndex
      };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [id, setEdges, segments]);

  return (
    <>
      <BaseEdge
        path={pathString}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#ef4444' : style.stroke || '#b1b1b7',
          strokeWidth: selected ? 3 : (style.strokeWidth || 2),
        }}
      />
      
      {selected && (
        <>
          <DraggableHandles segments={segments} onMouseDown={handleMouseDown} />
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
