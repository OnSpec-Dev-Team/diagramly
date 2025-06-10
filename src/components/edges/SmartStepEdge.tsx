
import React, { useState, useCallback, useRef } from 'react';
import {
  BaseEdge,
  useReactFlow,
  useStore,
  Node,
  Edge,
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

  // Generate SVG path
  const pathString = generateSVGPath(points);

  const onEdgeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEdges((edges: Edge[]) => edges.filter((edge) => edge.id !== id));
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

      setEdges((edges: Edge[]) =>
        edges.map((edge) => {
          if (edge.id !== id) return edge;

          const currentWaypoints = Array.isArray(edge.data?.waypoints) ? [...edge.data.waypoints] : [];
          
          if (segment.type === 'horizontal') {
            // Moving horizontal segment vertically - adjust Y coordinate
            const newY = (segment.y || 0) + deltaY * 0.3; // Reduced sensitivity for smoother movement
            
            // Update waypoints to maintain orthogonal path
            const waypointIndex = Math.floor(segIdx / 2);
            
            if (currentWaypoints.length === 0) {
              // Create initial waypoints based on segment position
              if (segIdx === 0) {
                currentWaypoints.push({ x: (segment.endX || segment.startX || 0), y: newY });
              } else if (segIdx === 2) {
                currentWaypoints.push({ x: (segment.startX || 0), y: newY });
              } else {
                currentWaypoints.push({ x: (segment.startX || 0) + ((segment.endX || 0) - (segment.startX || 0)) * 0.5, y: newY });
              }
            } else {
              // Update existing waypoint
              if (waypointIndex < currentWaypoints.length) {
                currentWaypoints[waypointIndex] = { ...currentWaypoints[waypointIndex], y: newY };
              }
            }
          } else {
            // Moving vertical segment horizontally - adjust X coordinate
            const newX = (segment.x || 0) + deltaX * 0.3; // Reduced sensitivity for smoother movement
            
            // Update waypoints to maintain orthogonal path
            const waypointIndex = Math.floor(segIdx / 2);
            
            if (currentWaypoints.length === 0) {
              // Create initial waypoints based on segment position
              if (segIdx === 0) {
                currentWaypoints.push({ x: newX, y: (segment.endY || segment.startY || 0) });
              } else if (segIdx === 2) {
                currentWaypoints.push({ x: newX, y: (segment.startY || 0) });
              } else {
                currentWaypoints.push({ x: newX, y: (segment.startY || 0) + ((segment.endY || 0) - (segment.startY || 0)) * 0.5 });
              }
            } else {
              // Update existing waypoint
              if (waypointIndex < currentWaypoints.length) {
                currentWaypoints[waypointIndex] = { ...currentWaypoints[waypointIndex], x: newX };
              }
            }
          }

          return {
            ...edge,
            data: {
              ...edge.data,
              waypoints: currentWaypoints.length > 0 ? currentWaypoints : undefined,
            },
          };
        })
      );

      // Update dragStart with current position for smooth movement
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
          <DraggableHandles 
            segments={segments} 
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
