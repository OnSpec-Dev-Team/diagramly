import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TankNode } from './nodes/TankNode';
import { ValveNode } from './nodes/ValveNode';
import { PumpNode } from './nodes/PumpNode';
import { DeletableEdge } from './edges/DeletableEdge';
import { DraggableStepEdge } from './edges/DraggableStepEdge';
import { Sidebar } from './Sidebar';
import { EdgeType } from './EdgeTypeSelector';

const nodeTypes = {
  tank: TankNode,
  valve: ValveNode,
  pump: PumpNode,
};

const edgeTypes = {
  default: DeletableEdge,
  straight: DeletableEdge,
  step: DraggableStepEdge,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

let nodeId = 0;
const getNodeId = () => `node_${nodeId++}`;

let edgeId = 0;
const getEdgeId = () => `edge_${edgeId++}`;

export function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [edgeType, setEdgeType] = useState<EdgeType>('default');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge: Edge = {
        ...params,
        id: getEdgeId(),
        type: edgeType,
        label: edgeType.charAt(0).toUpperCase() + edgeType.slice(1),
        labelStyle: {
          fontSize: 12,
          fontWeight: 500,
          fill: '#374151',
          backgroundColor: 'white',
          padding: '2px 4px',
          borderRadius: '4px',
          border: '1px solid #e5e7eb',
        },
        labelBgStyle: {
          fill: 'white',
          fillOpacity: 0.8,
        },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges, edgeType]
  );

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdgeId(edge.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedEdgeId(null);
  }, []);

  // Handle keyboard deletion
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' && selectedEdgeId) {
        setEdges((edges) => edges.filter((edge) => edge.id !== selectedEdgeId));
        setSelectedEdgeId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedEdgeId, setEdges]);

  // Update edges to include selection state
  const edgesWithSelection = edges.map((edge) => ({
    ...edge,
    selected: edge.id === selectedEdgeId,
  }));

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: getNodeId(),
        type,
        position,
        data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodeId}` },
        draggable: true,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar edgeType={edgeType} onEdgeTypeChange={setEdgeType} />
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edgesWithSelection}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          className="bg-gray-100"
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
        >
          <Controls className="bg-white shadow-lg border border-gray-200" />
          <Background color="#e5e7eb" gap={20} />
        </ReactFlow>
      </div>
    </div>
  );
}
