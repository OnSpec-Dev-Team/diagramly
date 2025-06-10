
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export type EdgeType = 'default' | 'straight' | 'step';

interface EdgeTypeSelectorProps {
  value: EdgeType;
  onChange: (value: EdgeType) => void;
}

export function EdgeTypeSelector({ value, onChange }: EdgeTypeSelectorProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Edge Type
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select edge type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Bezier (Default)</SelectItem>
          <SelectItem value="straight">Straight</SelectItem>
          <SelectItem value="step">Draggable Step</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
