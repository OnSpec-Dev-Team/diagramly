
import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
  useReactFlow,
  EdgeProps,
} from '@xyflow/react';
import { X } from 'lucide-react';

export function DeletableEdge({
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
  ...rest
}: EdgeProps & { selected?: boolean }) {
  const { setEdges, getEdges } = useReactFlow();

  // Get the edge type from the edges state
  const edges = getEdges();
  const currentEdge = edges.find(edge => edge.id === id);
  const edgeType = currentEdge?.type || 'default';

  // Get the appropriate path based on edge type
  const getEdgePath = () => {
    const pathParams = {
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    };

    switch (edgeType) {
      case 'straight':
        return getStraightPath(pathParams);
      case 'step':
        return getSmoothStepPath(pathParams);
      case 'default':
      default:
        return getBezierPath(pathParams);
    }
  };

  const [edgePath, labelX, labelY] = getEdgePath();

  const onEdgeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#ef4444' : style.stroke,
          strokeWidth: selected ? 3 : (style.strokeWidth || 2),
        }}
      />
      {selected && (
        <EdgeLabelRenderer>
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
