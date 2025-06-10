
export interface SmartStepEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition?: string;
  targetPosition?: string;
  style?: React.CSSProperties;
  markerEnd?: string;
  selected?: boolean;
  data?: {
    waypoints?: { x: number; y: number }[];
  };
}

export interface DragStart {
  x: number;
  y: number;
  segmentIndex: number;
}

export interface PathPoint {
  x: number;
  y: number;
}

export interface PathSegment {
  type: 'horizontal' | 'vertical';
  index: number;
  x?: number;
  y?: number;
  startX?: number;
  endX?: number;
  startY?: number;
  endY?: number;
}

export interface PathCalculation {
  points: PathPoint[];
  segments: PathSegment[];
}
