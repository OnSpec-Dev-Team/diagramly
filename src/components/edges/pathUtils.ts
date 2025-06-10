
import { PathPoint, PathSegment, PathCalculation } from './types';

export const calculateSmartPath = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  waypoints: { x: number; y: number }[] = []
): PathCalculation => {
  if (waypoints.length === 0) {
    // Default routing: ensure strictly orthogonal paths
    const deltaX = targetX - sourceX;
    const deltaY = targetY - sourceY;
    
    // Use a more intelligent routing algorithm
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal priority - go right/left first, then up/down
      const midX = sourceX + deltaX * 0.5;
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
      // Vertical priority - go up/down first, then right/left
      const midY = sourceY + deltaY * 0.5;
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

  // Use custom waypoints - ensure orthogonal connections
  const allPoints = [
    { x: sourceX, y: sourceY },
    ...waypoints,
    { x: targetX, y: targetY },
  ];

  // Create orthogonal path through waypoints
  const points: PathPoint[] = [];
  const segments: PathSegment[] = [];

  for (let i = 0; i < allPoints.length - 1; i++) {
    const current = allPoints[i];
    const next = allPoints[i + 1];

    if (i === 0) {
      points.push(current);
    }

    // Ensure orthogonal connection between current and next point
    if (current.x !== next.x && current.y !== next.y) {
      // Need intermediate point to maintain orthogonal path
      // Decide whether to go horizontal first or vertical first
      const deltaX = Math.abs(next.x - current.x);
      const deltaY = Math.abs(next.y - current.y);
      
      if (deltaX >= deltaY) {
        // Go horizontal first
        const intermediatePoint = { x: next.x, y: current.y };
        points.push(intermediatePoint);
        
        // Add horizontal segment
        segments.push({
          type: 'horizontal',
          startX: Math.min(current.x, next.x),
          endX: Math.max(current.x, next.x),
          y: current.y,
          index: segments.length,
        });
        
        // Add vertical segment
        segments.push({
          type: 'vertical',
          x: next.x,
          startY: Math.min(current.y, next.y),
          endY: Math.max(current.y, next.y),
          index: segments.length,
        });
      } else {
        // Go vertical first
        const intermediatePoint = { x: current.x, y: next.y };
        points.push(intermediatePoint);
        
        // Add vertical segment
        segments.push({
          type: 'vertical',
          x: current.x,
          startY: Math.min(current.y, next.y),
          endY: Math.max(current.y, next.y),
          index: segments.length,
        });
        
        // Add horizontal segment
        segments.push({
          type: 'horizontal',
          startX: Math.min(current.x, next.x),
          endX: Math.max(current.x, next.x),
          y: next.y,
          index: segments.length,
        });
      }
    } else if (current.x === next.x) {
      // Vertical segment
      segments.push({
        type: 'vertical',
        x: current.x,
        startY: Math.min(current.y, next.y),
        endY: Math.max(current.y, next.y),
        index: segments.length,
      });
    } else {
      // Horizontal segment
      segments.push({
        type: 'horizontal',
        startX: Math.min(current.x, next.x),
        endX: Math.max(current.x, next.x),
        y: current.y,
        index: segments.length,
      });
    }

    points.push(next);
  }

  return { points, segments };
};

export const generateSVGPath = (points: PathPoint[]): string => {
  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x},${point.y}`;
    }
    return `${path} L ${point.x},${point.y}`;
  }, '');
};
