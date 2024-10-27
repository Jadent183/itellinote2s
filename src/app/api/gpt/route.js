import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { transcription, threadId } = await req.json();
    
    // Validate input
    if (!transcription) {
      return new Response(
        JSON.stringify({ error: 'No transcription provided' }),
        { status: 400 }
      );
    }

    // Create a new thread if none exists
    let currentThreadId = threadId;
    if (!currentThreadId) {
      const thread = await openai.beta.threads.create();
      currentThreadId = thread.id;
    }

    // Add the transcribed message to the thread
    await openai.beta.threads.messages.create(currentThreadId, {
      role: "user",
      content: transcription
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(currentThreadId, {
      assistant_id: process.env.INITIAL_GPT_ASSISTANT_ID
    });

    // Poll for completion
    let runStatus;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
    } while (runStatus.status === 'in_progress' || runStatus.status === 'queued');

    // Check for failure
    if (runStatus.status === 'failed') {
      throw new Error('Assistant run failed: ' + runStatus.last_error?.message);
    }

    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(currentThreadId);
    const assistantResponse = messages.data[0].content[0].text.value;

    return new Response(
      JSON.stringify({ 
        response: assistantResponse,
        threadId: currentThreadId,
        status: 'success'
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error('GPT API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }

// export async function POST(request) {
//   // Simulate processing time
//   await new Promise(resolve => setTimeout(resolve, 150));

//   // First Assistant's response - Analysis of the lecture content
//   const simulatedResponse = `
// American Revolution Overview

// Occurred from 1775 to 1783; led to the U.S. independence from Britain.
// Background: Mid-18th century, colonies thrived under British but faced increasing frustration due to policies.
// Causes of Tension

// Post-French and Indian War, Britain imposed taxes (Stamp Act, Townshend Acts, Tea Act).
// "No taxation without representation" became a rallying cry.
// Key events: Boston Massacre (1770), Boston Tea Party (1773).
// Initial Response

// First Continental Congress (1774) demanded rights and sought resolutions.
// Diplomacy failed; violence erupted at Lexington and Concord (1775).
// Key Figures

// George Washington led Continental Army.
// Thomas Jefferson authored the Declaration of Independence.
// Benjamin Franklin secured French support.
// Critical Moments

// Declaration of Independence (1776) declared self-rule.
// Important battles: Saratoga (1777) and Yorktown (1781).
// Conclusion of War

// Treaty of Paris (1783) ended the war; Britain recognized U.S. independence.
// Ideological victory inspiring global democracy movements.
// Revolution's Impact

// Laid foundation for U.S. values: liberty, democracy, and independence.
// Next Topic

// Formation of U.S. Constitution and challenges of uniting states.
// End of Lecture

// Invitation for questions and preview of next class topic.
// `;

//   return NextResponse.json({
//     response: simulatedResponse,
//     threadId: "mock-thread-1"
//   });
// }

}