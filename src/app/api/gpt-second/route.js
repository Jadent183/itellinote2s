import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.FINAL_GPT_ASSISTANT_ID;

export async function POST(request) {
  try {
    if (!ASSISTANT_ID) {
      throw new Error('Assistant ID not configured');
    }

    const { input } = await request.json();

    const thread = await openai.beta.threads.create();
    
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: input
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
    });

    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== 'completed') {
      if (runStatus.status === 'failed' || runStatus.status === 'expired') {
        throw new Error(`Assistant run ${runStatus.status}`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data[0];

    // Get the raw response content
    const responseText = lastMessage.content[0].text.value;
    
    // Pass through the response directly
    return NextResponse.json({
      response: JSON.parse(responseText),
      threadId: thread.id
    });

  } catch (error) {
    console.error('Error in GPT-second route:', error);
    return NextResponse.json({
      error: {
        message: 'Failed to process with second assistant',
        details: error.message,
        type: error.type || 'unknown'
      }
    }, { 
      status: error.status || 500 
    });
  }
}