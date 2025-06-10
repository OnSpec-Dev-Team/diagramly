
import React, { useCallback, useRef, useState } from 'react';
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
import { Sidebar } from './Sidebar';
import { EdgeType } from './EdgeTypeSelector';

const nodeTypes = {
  tank: TankNode,
  valve: ValveNode,
  pump: PumpNode,
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
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
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
