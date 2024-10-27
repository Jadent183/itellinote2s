import { SpeechClient } from '@google-cloud/speech';

let speechClient;

try {
  speechClient = new SpeechClient({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    projectId: process.env.GOOGLE_PROJECT_ID,
  });
} catch (error) {
  console.error('Error initializing Speech Client:', error);
}

export async function POST(req) {
  if (!speechClient) {
    return new Response(
      JSON.stringify({ error: 'Speech client not properly initialized' }),
      { status: 500 }
    );
  }

  try {
    const data = await req.formData();
    const audio = data.get('audio');
    const languageCode = data.get('language') || 'en-US';

    if (!audio) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await audio.arrayBuffer());

    // Check buffer size - limit to 15 seconds of audio
    const maxSize = 1024 * 1024; // 1MB max size
    if (buffer.length > maxSize) {
      return new Response(
        JSON.stringify({ error: 'Audio chunk too large' }),
        { status: 400 }
      );
    }

    const request = {
      audio: {
        content: buffer.toString('base64'),
      },
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: languageCode,
        model: 'default',
        enableAutomaticPunctuation: true,
        useEnhanced: true,
        maxAlternatives: 1,
        profanityFilter: false,
        enableWordTimeOffsets: false,
        enableAutomaticPunctuation: true,
        useEnhanced: true,
        metadata: {
          interactionType: 'DICTATION',
          microphoneDistance: 'NEARFIELD',
          originalMediaType: 'AUDIO',
        },
      },
    };

    const [response] = await speechClient.recognize(request);

    let finalTranscription = '';
    if (response.results && response.results.length > 0) {
      finalTranscription = response.results
        .map(result => result.alternatives[0].transcript)
        .join(' ');
    }

    return new Response(
      JSON.stringify({ transcription: finalTranscription }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Detailed transcription error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.details || 'Unknown error occurred'
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