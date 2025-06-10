
import { PathPoint, PathSegment, PathCalculation } from './types';

export const calculateSmartPath = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  waypoints: { x: number; y: number }[] = []
): PathCalculation => {
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

  const segments: PathSegment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    
    if (start.x === end.x) {
      // Vertical segment
      segments.push({
        type: 'vertical',
        x: start.x,
        startY: Math.min(start.y, end.y),
        endY: Math.max(start.y, end.y),
        index: i,
      });
    } else {
      // Horizontal segment
      segments.push({
        type: 'horizontal',
        startX: Math.min(start.x, end.x),
        endX: Math.max(start.x, end.x),
        y: start.y,
        index: i,
      });
    }
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
