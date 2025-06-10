
import React from 'react';
import { Layers, Circle, Square } from 'lucide-react';
import { EdgeTypeSelector, EdgeType } from './EdgeTypeSelector';

const components = [
  {
    type: 'tank',
    label: 'Tank',
    icon: Circle,
    description: 'Storage tank component',
    color: 'bg-blue-500',
  },
  {
    type: 'valve',
    label: 'Valve',
    icon: Square,
    description: 'Control valve component',
    color: 'bg-green-500',
  },
  {
    type: 'pump',
    label: 'Pump',
    icon: Layers,
    description: 'Pump component',
    color: 'bg-purple-500',
  },
];

interface SidebarProps {
  edgeType: EdgeType;
  onEdgeTypeChange: (type: EdgeType) => void;
}

export function Sidebar({ edgeType, onEdgeTypeChange }: SidebarProps) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Component Palette</h2>
        <p className="text-sm text-gray-600 mt-1">Drag components to the canvas</p>
      </div>
      
      <div className="p-4">
        <EdgeTypeSelector value={edgeType} onChange={onEdgeTypeChange} />
        
        <div className="space-y-3">
          {components.map((component) => {
            const IconComponent = component.icon;
            return (
              <div
                key={component.type}
                className="group cursor-grab active:cursor-grabbing bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md"
                onDragStart={(event) => onDragStart(event, component.type)}
                draggable
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${component.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{component.label}</h3>
                    <p className="text-xs text-gray-500">{component.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            💡 Tip: Select an edge type, then drag between node handles to connect them. Nodes are draggable on the canvas.
          </p>
        </div>
      </div>
    </div>
  );
}
