"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, RefreshCw, ArrowRight } from 'lucide-react';

// BST Node class and helper functions
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

const sortedArrayToBST = (nums) => {
  if (!nums.length) return null;
  const mid = Math.floor(nums.length / 2);
  const root = new TreeNode(nums[mid]);
  root.left = sortedArrayToBST(nums.slice(0, mid));
  root.right = sortedArrayToBST(nums.slice(mid + 1));
  return root;
};

// Utility function to parse and sort values based on structure type
const parseValues = (type, defaultValues) => {
  switch (type) {
    case 'bst':
      return defaultValues.split(',')
        .map(v => parseInt(v.trim()))
        .filter(v => !isNaN(v))
        .sort((a, b) => a - b); // Always sort BST values
    case 'array':
      return defaultValues.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    case 'linkedList':
      return defaultValues.split(',').map(v => v.trim());
    case 'hashMap':
      return new Map(
        defaultValues.split(',')
          .map(pair => pair.split(':'))
          .map(([key, value]) => [key.trim(), value.trim()])
      );
    default:
      return [];
  }
};

// Ensure BST values are always sorted
const sortBSTValues = (values) => [...values].sort((a, b) => a - b);

const DataStructureVisualizer = ({ 
  type = 'array',
  defaultValues = '',
  name = 'Data Structure',
  className = ''
}) => {
  const [values, setValues] = useState(() => parseValues(type, defaultValues));
  const [newValue, setNewValue] = useState('');
  const [newKey, setNewKey] = useState('');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  // Effect to handle initial load and type/defaultValues changes
  useEffect(() => {
    setValues(parseValues(type, defaultValues));
    setNewValue('');
    setNewKey('');
    setSelected(null);
    setError('');
  }, [type, defaultValues]);

  // Effect to ensure BST values are always sorted
  useEffect(() => {
    if (type === 'bst') {
      setValues(prev => sortBSTValues(prev));
    }
  }, [type]);

  const handleReset = () => {
    setValues(parseValues(type, defaultValues));
    setSelected(null);
    setError('');
  };

  const handleAdd = () => {
    switch (type) {
      case 'bst': {
        const num = parseInt(newValue);
        if (isNaN(num)) {
          setError('Please enter a valid number');
          return;
        }
        setValues(prev => sortBSTValues([...prev, num])); // Sort on add for BST
        break;
      }
      case 'array': {
        const num = parseInt(newValue);
        if (isNaN(num)) {
          setError('Please enter a valid number');
          return;
        }
        setValues(prev => [...prev, num]);
        break;
      }
      case 'linkedList':
        if (!newValue.trim()) {
          setError('Please enter a value');
          return;
        }
        setValues(prev => [...prev, newValue.trim()]);
        break;
      case 'hashMap':
        if (!newKey.trim() || !newValue.trim()) {
          setError('Please enter both key and value');
          return;
        }
        setValues(new Map(values.set(newKey.trim(), newValue.trim())));
        break;
    }
    setNewValue('');
    setNewKey('');
    setError('');
  };

  const handleRemove = () => {
    if (selected === null) return;

    switch (type) {
      case 'bst':
        setValues(prev => sortBSTValues(prev.filter((_, i) => i !== selected)));
        break;
      case 'array':
      case 'linkedList':
        setValues(prev => prev.filter((_, i) => i !== selected));
        break;
      case 'hashMap':
        const newMap = new Map(values);
        newMap.delete(selected);
        setValues(newMap);
        break;
    }
    setSelected(null);
  };

  // Render functions for different data structures
  const renderBST = () => {
    const root = sortedArrayToBST([...values]);
    
    const calculateLayout = (node, level = 0, minX = -200, maxX = 200) => {
      if (!node) return null;
      const x = (minX + maxX) / 2;
      const y = level * 60;
      return {
        ...node,
        x,
        y,
        left: calculateLayout(node.left, level + 1, minX, x),
        right: calculateLayout(node.right, level + 1, x, maxX)
      };
    };

    const layoutRoot = calculateLayout(root);

    const renderNode = (node) => {
      if (!node) return null;
      return (
        <g key={`node-${node.value}`}>
          {node.left && (
            <line
              x1={node.x}
              y1={node.y}
              x2={node.left.x}
              y2={node.left.y}
              stroke="#1e40af"
              strokeWidth="2"
            />
          )}
          {node.right && (
            <line
              x1={node.x}
              y1={node.y}
              x2={node.right.x}
              y2={node.right.y}
              stroke="#1e40af"
              strokeWidth="2"
            />
          )}
          <circle
            cx={node.x}
            cy={node.y}
            r="20"
            fill={selected === node.value ? '#93c5fd' : 'white'}
            stroke="#1e40af"
            strokeWidth="2"
            className="cursor-pointer hover:fill-blue-100"
            onClick={() => setSelected(node.value)}
          />
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="select-none pointer-events-none"
          >
            {node.value}
          </text>
          {node.left && renderNode(node.left)}
          {node.right && renderNode(node.right)}
        </g>
      );
    };

    return (
      <svg viewBox="-220 -20 440 240" className="w-full h-64">
        {layoutRoot && renderNode(layoutRoot)}
      </svg>
    );
  };

  const renderArray = () => (
    <div className="flex flex-wrap gap-2">
      {values.map((value, index) => (
        <div
          key={index}
          className={`w-12 h-12 flex items-center justify-center border-2 
            ${selected === index ? 'border-blue-500 bg-blue-100' : 'border-gray-400'}
            cursor-pointer hover:bg-gray-100`}
          onClick={() => setSelected(index)}
        >
          {value}
        </div>
      ))}
    </div>
  );

  const renderLinkedList = () => (
    <div className="flex items-center gap-2 overflow-x-auto p-4">
      {values.map((value, index) => (
        <React.Fragment key={index}>
          <div
            className={`min-w-[100px] h-16 flex items-center justify-center border-2 
              ${selected === index ? 'border-blue-500 bg-blue-100' : 'border-gray-400'}
              cursor-pointer hover:bg-gray-100 relative`}
            onClick={() => setSelected(index)}
          >
            <div className="absolute top-0 left-2 text-xs text-gray-500">
              Node {index}
            </div>
            {value}
          </div>
          {index < values.length - 1 && (
            <ArrowRight className="w-6 h-6 text-blue-500" />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderHashMap = () => {
    const buckets = Array.from({ length: 5 }, (_, i) => ({
      index: i,
      items: Array.from(values.entries())
        .filter(([key]) => Math.abs(key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5) === i)
    }));

    return (
      <div className="space-y-2">
        {buckets.map((bucket) => (
          <div
            key={bucket.index}
            className="flex items-center space-x-2 p-2 border-2 border-gray-200 rounded"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded">
              {bucket.index}
            </div>
            <div className="flex-1 flex items-center space-x-2 overflow-x-auto">
              {bucket.items.length > 0 ? (
                bucket.items.map(([key, value], i) => (
                  <React.Fragment key={key}>
                    <div
                      className={`px-3 py-1 border-2 rounded cursor-pointer
                        ${selected === key ? 'border-blue-500 bg-blue-100' : 'border-gray-400'}
                        hover:bg-gray-100`}
                      onClick={() => setSelected(key)}
                    >
                      {key}: {value}
                    </div>
                    {i < bucket.items.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <div className="text-gray-400">Empty bucket</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className={`w-full max-w-3xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Removed the buttons  */}


        {/* <div className="flex items-center space-x-2">
          {type === 'hashMap' && (
            <Input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Key"
              className="w-32"
            />
          )}
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={type === 'hashMap' ? 'Value' : 'Enter value'}
            className="w-32"
          />
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={selected === null}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Remove
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-1" /> Reset
          </Button>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>} */}

        <div className="border-t pt-4">
          {type === 'bst' && renderBST()}
          {type === 'array' && renderArray()}
          {type === 'linkedList' && renderLinkedList()}
          {type === 'hashMap' && renderHashMap()}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataStructureVisualizer;