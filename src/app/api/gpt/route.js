import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// export async function POST(req) {
//   try {
//     const { transcription, threadId } = await req.json();
    
//     // Validate input
//     if (!transcription) {
//       return new Response(
//         JSON.stringify({ error: 'No transcription provided' }),
//         { status: 400 }
//       );
//     }

//     // Create a new thread if none exists
//     let currentThreadId = threadId;
//     if (!currentThreadId) {
//       const thread = await openai.beta.threads.create();
//       currentThreadId = thread.id;
//     }

//     // Add the transcribed message to the thread
//     await openai.beta.threads.messages.create(currentThreadId, {
//       role: "user",
//       content: transcription
//     });

//     // Run the assistant
//     const run = await openai.beta.threads.runs.create(currentThreadId, {
//       assistant_id: process.env.INITIAL_GPT_ASSISTANT_ID
//     });

//     // Poll for completion
//     let runStatus;
//     do {
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
//     } while (runStatus.status === 'in_progress' || runStatus.status === 'queued');

//     // Check for failure
//     if (runStatus.status === 'failed') {
//       throw new Error('Assistant run failed: ' + runStatus.last_error?.message);
//     }

//     // Get the assistant's response
//     const messages = await openai.beta.threads.messages.list(currentThreadId);
//     const assistantResponse = messages.data[0].content[0].text.value;

//     return new Response(
//       JSON.stringify({ 
//         response: assistantResponse,
//         threadId: currentThreadId,
//         status: 'success'
//       }),
//       { 
//         status: 200,
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       }
//     );

//   } catch (error) {
//     console.error('GPT API Error:', error);
//     return new Response(
//       JSON.stringify({ 
//         error: error.message,
//         status: 'error'
//       }),
//       { 
//         status: 500,
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       }
//     );
//   }

export async function POST(request) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 150));

  // First Assistant's response - Analysis of the lecture content
  const simulatedResponse = `
Lecture Analysis:

Topic: Binary Search Algorithm
Type: Algorithmic Concept Introduction

Key Concepts Covered:
1. Definition: Binary Search is a searching algorithm for sorted arrays
2. Core Principle: Divide and conquer approach
3. Prerequisites: List/array must be sorted
4. Time Complexity: O(log n)

Teaching Structure:
1. Conceptual Introduction
   - Basic principle explained
   - Emphasis on sorted list requirement
2. Process Breakdown
   - Middle element comparison
   - Decision making (smaller/larger)
   - Halving the search space
3. Practical Example
   - Using array: [2, 4, 7, 10, 15, 20, 25, 30]
   - Target value: 10
   - Step-by-step walkthrough

Teaching Methods Used:
- Progressive explanation
- Concrete example
- Visual representation through example
- Real-world performance context (time complexity)

Suggested Follow-up Topics:
1. Implementation in different programming languages
2. Comparison with linear search
3. Applications in real-world scenarios
4. Variations of binary search

Areas for Student Practice:
- Tracing exercises with different arrays
- Edge cases (target not found, single element)
- Time complexity analysis exercises
`;

  return NextResponse.json({
    response: simulatedResponse,
    threadId: "mock-thread-1"
  });
}



