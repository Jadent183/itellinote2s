"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataStructureVisualizer from './DataStructureVisualizer';

const LectureNotesVisualizer = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Title Section */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-blue-900">
          Lecture Notes on Linear Search
        </h1>
      </div>

      {/* Content Sections */}
      <div className="space-y-6 text-gray-700">
        {/* Introduction */}
        <section>
          <h2 className="text-xl font-bold text-blue-800 mb-3">Introduction to Linear Search</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Simplest search algorithm in data structures.</li>
            <li>Does not require special data structure or sorting.</li>
            <li>Versatile due to simplicity.</li>
          </ul>
        </section>

        {/* Definition */}
        <section>
          <h2 className="text-xl font-bold text-blue-800 mb-3">Definition</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-semibold">Linear Search:</span> Iterates through each element in a list/array until the target is found or the list ends.
            </li>
            <li>Also known as sequential search.</li>
          </ul>
        </section>

        {/* Visualization Section */}
        <section className="my-8">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Interactive Visualization</h2>
          <p className="text-gray-600 mb-4">
            Try searching for different numbers in this array to see how linear search works.
            The visualization shows the basic array structure used in linear search.
          </p>
          <DataStructureVisualizer
            type="array"
            defaultValues="3,8,1,4,6"
            name="Linear Search Array"
          />
        </section>

        {/* Steps */}
        <section>
          <h2 className="text-xl font-bold text-blue-800 mb-3">Steps Involved in Linear Search</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-semibold">Start at the Beginning:</span>
              <ul className="list-disc pl-6 mt-1">
                <li>Begin at the first element of the array/list.</li>
              </ul>
            </li>
            <li>
              <span className="font-semibold">Check Each Element:</span>
              <ul className="list-disc pl-6 mt-1">
                <li>Compare each element with the target.</li>
              </ul>
            </li>
            <li>
              <span className="font-semibold">Continue or Stop:</span>
              <ul className="list-disc pl-6 mt-1">
                <li>Stop if a match is found and return the index.</li>
                <li>If the end is reached without finding the target, return an indication (e.g., -1) that it isn't present.</li>
              </ul>
            </li>
          </ul>
        </section>

        {/* Example */}
        <section>
          <h2 className="text-xl font-bold text-blue-800 mb-3">Example</h2>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="mb-2">Array: [3, 8, 1, 4, 6]; Searching for number 4.</p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Start with 3 (not a match)</li>
              <li>Move to 8 (not a match)</li>
              <li>Then 1 (not a match)</li>
              <li>Reach 4 (match found)</li>
              <li>Return index 3</li>
            </ol>
          </div>
        </section>

        {/* Performance */}
        <section>
          <h2 className="text-xl font-bold text-blue-800 mb-3">Performance</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-semibold">Time Complexity:</span> O(n), worst case requires looking through every element.
            </li>
            <li>Suitable for unsorted data or structures with challenging random access (e.g., linked lists).</li>
          </ul>
        </section>

        {/* Usage */}
        <section>
          <h2 className="text-xl font-bold text-blue-800 mb-3">Usage Considerations</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Ideal for small datasets or infrequent searches.</li>
            <li>For sorted data or frequent searches, Binary Search is often preferred for efficiency.</li>
          </ul>
        </section>

        {/* Summary */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-blue-800 mb-3">Summary</h2>
          <p className="text-gray-700">
            Linear Search is easy and reliable, but can be slow for large datasets due to O(n) complexity.
          </p>
        </section>
      </div>
    </div>
  );
};

export default LectureNotesVisualizer;