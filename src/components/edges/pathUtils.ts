
import { PathPoint, PathSegment, PathCalculation } from './types';

export const calculateSmartPath = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  waypoints: { x: number; y: number }[] = []
): PathCalculation => {
  if (waypoints.length === 0) {
    // Calculate minimum bend path with orthogonal routing
    const deltaX = targetX - sourceX;
    const deltaY = targetY - sourceY;
    
    // For minimum bends, we need at most 3 segments (2 bends)
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      // Very close nodes - direct connection
      return {
        points: [
          { x: sourceX, y: sourceY },
          { x: targetX, y: targetY },
        ],
        segments: [],
      };
    }
    
    // Determine optimal routing direction for minimum bends
    const midX = sourceX + deltaX * 0.5;
    const midY = sourceY + deltaY * 0.5;
    
    // Choose routing based on which direction minimizes total distance
    const horizontalFirst = Math.abs(deltaX) >= Math.abs(deltaY);
    
    if (horizontalFirst) {
      return {
        points: [
          { x: sourceX, y: sourceY },
          { x: midX, y: sourceY },
          { x: midX, y: targetY },
          { x: targetX, y: targetY },
        ],
        segments: [
          { type: 'horizontal', startX: sourceX, endX: midX, y: sourceY, index: 0, isDraggable: false },
          { type: 'vertical', x: midX, startY: sourceY, endY: targetY, index: 1, isDraggable: true },
          { type: 'horizontal', startX: midX, endX: targetX, y: targetY, index: 2, isDraggable: false },
        ],
      };
    } else {
      return {
        points: [
          { x: sourceX, y: sourceY },
          { x: sourceX, y: midY },
          { x: targetX, y: midY },
          { x: targetX, y: targetY },
        ],
        segments: [
          { type: 'vertical', x: sourceX, startY: sourceY, endY: midY, index: 0, isDraggable: false },
          { type: 'horizontal', startX: sourceX, endX: targetX, y: midY, index: 1, isDraggable: true },
          { type: 'vertical', x: targetX, startY: midY, endY: targetY, index: 2, isDraggable: false },
        ],
      };
    }
  }

  // Use custom waypoints with minimum bends
  const allPoints = [
    { x: sourceX, y: sourceY },
    ...waypoints,
    { x: targetX, y: targetY },
  ];

  const points: PathPoint[] = [];
  const segments: PathSegment[] = [];

  for (let i = 0; i < allPoints.length - 1; i++) {
    const current = allPoints[i];
    const next = allPoints[i + 1];

    if (i === 0) {
      points.push(current);
    }

    // Ensure orthogonal connection with minimum bends
    if (current.x !== next.x && current.y !== next.y) {
      // Create intermediate point for orthogonal path
      const intermediatePoint = { x: next.x, y: current.y };
      points.push(intermediatePoint);
      
      // Add horizontal segment
      segments.push({
        type: 'horizontal',
        startX: Math.min(current.x, next.x),
        endX: Math.max(current.x, next.x),
        y: current.y,
        index: segments.length,
        isDraggable: segments.length > 0 && segments.length < allPoints.length - 2,
      });
      
      // Add vertical segment
      segments.push({
        type: 'vertical',
        x: next.x,
        startY: Math.min(current.y, next.y),
        endY: Math.max(current.y, next.y),
        index: segments.length,
        isDraggable: segments.length > 0 && segments.length < allPoints.length - 2,
      });
    } else if (current.x === next.x) {
      // Vertical segment
      segments.push({
        type: 'vertical',
        x: current.x,
        startY: Math.min(current.y, next.y),
        endY: Math.max(current.y, next.y),
        index: segments.length,
        isDraggable: segments.length > 0 && segments.length < allPoints.length - 2,
      });
    } else {
      // Horizontal segment
      segments.push({
        type: 'horizontal',
        startX: Math.min(current.x, next.x),
        endX: Math.max(current.x, next.x),
        y: current.y,
        index: segments.length,
        isDraggable: segments.length > 0 && segments.length < allPoints.length - 2,
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

export const updatePathWithDrag = (
  originalPath: PathCalculation,
  segmentIndex: number,
  deltaX: number,
  deltaY: number,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
): { x: number; y: number }[] => {
  const segment = originalPath.segments[segmentIndex];
  if (!segment || !segment.isDraggable) return [];

  const waypoints: { x: number; y: number }[] = [];

  if (segment.type === 'horizontal') {
    // Moving horizontal segment vertically
    const newY = (segment.y || 0) + deltaY;
    
    // Create waypoint that maintains orthogonal path
    if (segmentIndex === 1 && originalPath.segments.length === 3) {
      // Middle segment of 3-segment path
      const midX = (segment.startX || 0) + ((segment.endX || 0) - (segment.startX || 0)) * 0.5;
      waypoints.push({ x: midX, y: newY });
    }
  } else {
    // Moving vertical segment horizontally
    const newX = (segment.x || 0) + deltaX;
    
    // Create waypoint that maintains orthogonal path
    if (segmentIndex === 1 && originalPath.segments.length === 3) {
      // Middle segment of 3-segment path
      const midY = (segment.startY || 0) + ((segment.endY || 0) - (segment.startY || 0)) * 0.5;
      waypoints.push({ x: newX, y: midY });
    }
  }

  return waypoints;
};
