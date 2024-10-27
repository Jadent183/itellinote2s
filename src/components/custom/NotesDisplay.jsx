"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronDown } from 'lucide-react';

// Tree Node component for BST visualization
const TreeNode = ({ x, y, value, onClick, isHighlighted }) => (
  <g onClick={onClick}>
    <circle
      cx={x}
      cy={y}
      r="20"
      fill={isHighlighted ? '#93c5fd' : 'white'}
      stroke="#1e40af"
      strokeWidth="2"
      className="transition-all duration-300"
    />
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fill="#1e40af"
      className="text-sm font-semibold"
    >
      {value}
    </text>
  </g>
);

// Tree Edge component
const TreeEdge = ({ startX, startY, endX, endY }) => (
  <line
    x1={startX}
    y1={startY}
    x2={endX}
    y2={endY}
    stroke="#1e40af"
    strokeWidth="2"
  />
);

// BST Visualization component
const BSTVisualization = () => {
  const [highlightedNode, setHighlightedNode] = useState(null);
  const treeData = {
    value: 8,
    left: {
      value: 4,
      left: { value: 2 },
      right: { value: 6 }
    },
    right: {
      value: 12,
      left: { value: 10 },
      right: { value: 14 }
    }
  };

  const renderTree = (node, x, y, level = 0, parentX = null, parentY = null) => {
    if (!node) return null;

    const spacing = 80 / (level + 1);
    const elements = [];

    // Add edge from parent if it exists
    if (parentX !== null) {
      elements.push(
        <TreeEdge
          key={`edge-${parentX}-${parentY}-${x}-${y}`}
          startX={parentX}
          startY={parentY + 15}
          endX={x}
          endY={y}
        />
      );
    }

    // Add node
    elements.push(
      <TreeNode
        key={`node-${x}-${y}`}
        x={x}
        y={y}
        value={node.value}
        onClick={() => setHighlightedNode(node.value)}
        isHighlighted={highlightedNode === node.value}
      />
    );

    // Recursively render children
    if (node.left) {
      elements.push(
        ...renderTree(
          node.left,
          x - spacing,
          y + 60,
          level + 1,
          x,
          y
        )
      );
    }
    if (node.right) {
      elements.push(
        ...renderTree(
          node.right,
          x + spacing,
          y + 60,
          level + 1,
          x,
          y
        )
      );
    }

    return elements;
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 bg-white rounded-lg p-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-center text-blue-900">
        Interactive BST Visualization
      </h3>
      <svg
        viewBox="0 0 400 300"
        className="w-full h-64"
      >
        <g transform="translate(200, 40)">
          {renderTree(treeData, 0, 0)}
        </g>
      </svg>
      <p className="text-sm text-center text-gray-600 mt-2">
        Click on any node to highlight it
      </p>
    </div>
  );
};

// Linked List Visualization Component
const LinkedListVisualization = () => {
  const [highlightedNode, setHighlightedNode] = useState(null);
  const listData = [
    { value: 'A', next: 'B' },
    { value: 'B', next: 'C' },
    { value: 'C', next: 'D' },
    { value: 'D', next: null }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 bg-white rounded-lg p-4 shadow-lg overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4 text-center text-blue-900">
        Linked List Visualization
      </h3>
      <svg viewBox="0 0 600 100" className="w-full h-24">
        <g transform="translate(40, 50)">
          {listData.map((node, index) => (
            <g key={index}>
              {/* Node */}
              <rect
                x={index * 140}
                y={-20}
                width="40"
                height="40"
                fill={highlightedNode === index ? '#93c5fd' : 'white'}
                stroke="#1e40af"
                strokeWidth="2"
                onClick={() => setHighlightedNode(index)}
                className="transition-all duration-300 cursor-pointer"
              />
              {/* Value */}
              <text
                x={index * 140 + 20}
                y={0}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#1e40af"
                className="text-sm font-semibold"
              >
                {node.value}
              </text>
              {/* Arrow */}
              {node.next && (
                <g>
                  <line
                    x1={index * 140 + 40}
                    y1={0}
                    x2={index * 140 + 120}
                    y2={0}
                    stroke="#1e40af"
                    strokeWidth="2"
                  />
                  <polygon
                    points={`${index * 140 + 120},0 ${index * 140 + 110},-5 ${
                      index * 140 + 110
                    },5`}
                    fill="#1e40af"
                  />
                </g>
              )}
            </g>
          ))}
        </g>
      </svg>
      <p className="text-sm text-center text-gray-600 mt-2">
        Click on any node to highlight it
      </p>
    </div>
  );
};

// Hash Map Visualization Component
const HashMapVisualization = () => {
  const [highlightedBucket, setHighlightedBucket] = useState(null);
  const hashMapData = [
    { index: 0, items: ['apple', 'application'] },
    { index: 1, items: ['banana'] },
    { index: 2, items: [] },
    { index: 3, items: ['cat', 'car'] },
    { index: 4, items: [] },
    { index: 5, items: ['dog'] }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 bg-white rounded-lg p-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-center text-blue-900">
        Hash Map Visualization (with Chaining)
      </h3>
      <div className="space-y-2">
        {hashMapData.map((bucket) => (
          <div
            key={bucket.index}
            className={`flex items-center space-x-2 p-2 rounded transition-all duration-300 cursor-pointer
              ${
                highlightedBucket === bucket.index
                  ? 'bg-blue-100'
                  : 'hover:bg-blue-50'
              }`}
            onClick={() => setHighlightedBucket(bucket.index)}
          >
            <div className="w-8 h-8 flex items-center justify-center border-2 border-blue-900 rounded">
              {bucket.index}
            </div>
            <div className="flex-1 flex items-center space-x-2">
              {bucket.items.length > 0 ? (
                bucket.items.map((item, i) => (
                  <React.Fragment key={i}>
                    <div className="px-3 py-1 bg-white border-2 border-blue-900 rounded">
                      {item}
                    </div>
                    {i < bucket.items.length - 1 && (
                      <div className="text-blue-900">→</div>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <div className="text-gray-400">Empty</div>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-center text-gray-600 mt-2">
        Click on any bucket to highlight it
      </p>
    </div>
  );
};

const NotesDisplay = ({ content, dataStructureType }) => {
  const parseContent = (text) => {
    const lines = text.split('\n');
    return parseLines(lines, 0);
  };

  const parseLines = (lines, startIndex) => {
    const items = [];
    let currentItem = null;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const indent = lines[i].search(/\S/);
      const depth = Math.floor(indent / 2);
      const isBullet = line.startsWith('*');
      const content = isBullet ? line.slice(1).trim() : line;

      // Enhanced parsing for different formatting
      const isBold = content.startsWith('**') && content.endsWith('**');
      const isItalic = !isBold && content.startsWith('*') && content.endsWith('*');
      const isCode = content.startsWith('`') && content.endsWith('`');
      
      let cleanContent = content;
      if (isBold) cleanContent = content.slice(2, -2);
      if (isItalic) cleanContent = content.slice(1, -1);
      if (isCode) cleanContent = content.slice(1, -1);

      if (depth === 0) {
        currentItem = {
          content: cleanContent,
          isBold,
          isItalic,
          isCode,
          children: [],
        };
        items.push(currentItem);
      } else {
        if (!items.length) continue;
        const parentItem = items[items.length - 1];
        if (!parentItem.children) parentItem.children = [];
        parentItem.children.push({
          content: cleanContent,
          isBold,
          isItalic,
          isCode,
          children: [],
        });
      }
    }

    return items;
  };

  // Enhanced recursive component with animations and collapsible sections
  const RenderNote = ({ item, depth = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = item.children && item.children.length > 0;

    const getContentClass = () => {
      let className = 'transition-all duration-200 ';
      if (item.isBold) className += 'font-bold text-lg ';
      if (item.isItalic) className += 'italic ';
      if (item.isCode) className += 'font-mono bg-gray-100 px-2 py-1 rounded ';
      return className;
    };

    return (
      <div className={`ml-${depth * 4} ${depth > 0 ? 'border-l-2 border-gray-200 pl-4' : ''}`}>
        <div 
          className={`py-1 flex items-start gap-2 hover:bg-gray-50 rounded transition-colors duration-200 
            ${hasChildren ? 'cursor-pointer' : 'ml-6'}`}
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        >
          {hasChildren && (
            <div className="mt-1 text-gray-500">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          )}
          <div className={getContentClass()}>
            {item.content}
          </div>
        </div>
        {hasChildren && (
          <div 
            className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out
              ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
          >
            {item.children.map((child, index) => (
              <RenderNote key={index} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const parsedContent = parseContent(content);

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-3xl mx-auto bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          {parsedContent.map((item, index) => (
            <div key={index} className="mb-4">
              <RenderNote item={item} />
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Render appropriate visualization based on data structure type */}
      {dataStructureType === 'bst' && <BSTVisualization />}
      {dataStructureType === 'linkedList' && <LinkedListVisualization />}
      {dataStructureType === 'hashMap' && <HashMapVisualization />}
    </div>
  );
};
export default NotesDisplay;