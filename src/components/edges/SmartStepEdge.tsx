
import React, { useState, useCallback, useRef } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  useReactFlow,
  EdgeProps,
  useStore,
} from '@xyflow/react';
import { X } from 'lucide-react';

interface SmartStepEdgeProps extends EdgeProps {
  selected?: boolean;
  data?: {
    waypoints?: { x: number; y: number }[];
  };
}

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
  const dragStartRef = useRef<{ x: number; y: number; segmentIndex: number } | null>(null);

  // Get node positions for overlap detection
  const nodes = useStore((state) => state.nodes);

  // Calculate smart orthogonal path with waypoints
  const calculateSmartPath = () => {
    const waypoints = data.waypoints || [];
    
    if (waypoints.length === 0) {
      // Default routing: simple L-shape or Z-shape
      const midX = (sourceX + targetX) / 2;
      const midY = (sourceY + targetY) / 2;
      
      // Determine best routing based on node positions
      const deltaX = Math.abs(targetX - sourceX);
      const deltaY = Math.abs(targetY - sourceY);
      
      if (deltaX > deltaY) {
        // Horizontal priority
        return {
          points: [
            { x: sourceX, y: sourceY },
            { x: midX, y: sourceY },
            { x: midX, y: targetY },
            { x: targetX, y: targetY },
          ],
          segments: [
            { type: 'horizontal', startX: sourceX, endX: midX, y: sourceY, index: 0 },
            { type: 'vertical', x: midX, startY: sourceY, endY: targetY, index: 1 },
            { type: 'horizontal', startX: midX, endX: targetX, y: targetY, index: 2 },
          ],
        };
      } else {
        // Vertical priority
        return {
          points: [
            { x: sourceX, y: sourceY },
            { x: sourceX, y: midY },
            { x: targetX, y: midY },
            { x: targetX, y: targetY },
          ],
          segments: [
            { type: 'vertical', x: sourceX, startY: sourceY, endY: midY, index: 0 },
            { type: 'horizontal', startX: sourceX, endX: targetX, y: midY, index: 1 },
            { type: 'vertical', x: targetX, startY: midY, endY: targetY, index: 2 },
          ],
        };
      }
    }

    // Use custom waypoints
    const points = [
      { x: sourceX, y: sourceY },
      ...waypoints,
      { x: targetX, y: targetY },
    ];

    const segments = [];
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      
      if (start.x === end.x) {
        // Vertical segment
        segments.push({
          type: 'vertical' as const,
          x: start.x,
          startY: Math.min(start.y, end.y),
          endY: Math.max(start.y, end.y),
          index: i,
        });
      } else {
        // Horizontal segment
        segments.push({
          type: 'horizontal' as const,
          startX: Math.min(start.x, end.x),
          endX: Math.max(start.x, end.x),
          y: start.y,
          index: i,
        });
      }
    }

    return { points, segments };
  };

  const { points, segments } = calculateSmartPath();

  // Generate SVG path
  const pathString = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x},${point.y}`;
    }
    return `${path} L ${point.x},${point.y}`;
  }, '');

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
      if (!dragStartRef.current) return;

      const deltaX = moveEvent.clientX - dragStartRef.current.x;
      const deltaY = moveEvent.clientY - dragStartRef.current.y;
      const segIdx = dragStartRef.current.segmentIndex;
      const segment = segments[segIdx];

      if (!segment) return;

      setEdges((edges) =>
        edges.map((edge) => {
          if (edge.id !== id) return edge;

          const currentWaypoints = edge.data?.waypoints || [];
          const newWaypoints = [...currentWaypoints];

          if (segment.type === 'horizontal') {
            // Moving horizontal segment vertically
            const newY = segment.y + deltaY * 0.5;
            
            // Update or create waypoint
            if (segIdx === 0) {
              // First segment
              newWaypoints[0] = { x: segment.endX || segment.startX, y: newY };
            } else if (segIdx === segments.length - 1) {
              // Last segment
              newWaypoints[newWaypoints.length - 1] = { x: segment.startX, y: newY };
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
            const newX = segment.x + deltaX * 0.5;
            
            // Update or create waypoint
            if (segIdx === 0) {
              // First segment
              newWaypoints[0] = { x: newX, y: segment.endY || segment.startY };
            } else if (segIdx === segments.length - 1) {
              // Last segment
              newWaypoints[newWaypoints.length - 1] = { x: newX, y: segment.startY };
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

      dragStartRef.current = { 
        ...dragStartRef.current, 
        x: moveEvent.clientX, 
        y: moveEvent.clientY 
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
        <EdgeLabelRenderer>
          {/* Render draggable handles for each segment */}
          {segments.map((segment, index) => {
            let handleX: number;
            let handleY: number;
            let cursor: string;

            if (segment.type === 'horizontal') {
              handleX = (segment.startX + segment.endX) / 2;
              handleY = segment.y;
              cursor = 'cursor-ns-resize';
            } else {
              handleX = segment.x;
              handleY = (segment.startY + segment.endY) / 2;
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
                onMouseDown={(e) => handleMouseDown(e, index)}
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

          {/* Delete button */}
          <div
            className="absolute pointer-events-auto"
            style={{
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px, ${(sourceY + targetY) / 2}px)`,
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
