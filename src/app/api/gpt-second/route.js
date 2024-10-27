import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { input } = await request.json();

    // Simply structure the lecture data without formatting the content
    const lectureData = {
      "content": [
        "Linear Search:",
        "Straightforward approach: Check each element sequentially until target is found or array ends.",
        "Example: For array [12, 4, 8, 19, 7, 5], searching for 19 takes four comparisons.",
        "Time complexity: O(n), as in the worst-case scenario, every element needs to be checked.",
        "Best suited for unsorted data since no order is required.",
        "Binary Search:",
        "Requires sorted data, using a divide-and-conquer method.",
        "Example: For sorted array [2, 5, 7, 10, 14, 18, 21, 25], finding 14 takes three comparisons.",
        "Involves halving the search space with each step.",
        "Time complexity: O(log n), making it efficient for large datasets.",
        "Ideal for contexts where quick access to sorted data is possible.",
        "Comparison and Use Cases:",
        "Linear Search: For unsorted data or structures without fast index-based access (e.g., linked lists).",
        "Binary Search: For sorted arrays/lists, providing fast search capabilities.",
        "Upcoming class topics: Implementation of these algorithms and deeper analysis of use-case scenarios.",
        "Questions and Clarifications:",
        "Open to questions about differences and applications of Linear and Binary Search before concluding the session."
      ],
      "data-structures": [
        {
          "type": "array",
          "initialValues": [
            12,
            4,
            8,
            19,
            7,
            5
          ]
        },
        {
          "type": "bst",
          "initialValues": [
            2,
            5,
            7,
            10,
            14,
            18,
            21,
            25
          ]
        }
      ],
      "subject": "Linear Search and Binary Search"
    };

    return NextResponse.json({
      response: lectureData,
      threadId: Math.random().toString(36).substring(7)
    });
  } catch (error) {
    console.error('Error in GPT-second route:', error);
    return NextResponse.json(
      { error: 'Failed to process notes' },
      { status: 500 }
    );
  }
}