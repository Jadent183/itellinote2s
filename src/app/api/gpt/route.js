import OpenAI from 'openai';

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
}