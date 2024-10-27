import { SpeechClient } from '@google-cloud/speech';
import { TranslationServiceClient } from '@google-cloud/translate';

let speechClient;
let translationClient;

try {
  speechClient = new SpeechClient({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    projectId: process.env.GOOGLE_PROJECT_ID,
  });

  translationClient = new TranslationServiceClient({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
  });
} catch (error) {
  console.error('Error initializing clients:', error);
}

const LANGUAGE_MAPPING = {
  'en-US': 'en',
  'es-ES': 'es',
  'fr-FR': 'fr',
  'de-DE': 'de',
  'it-IT': 'it',
  'pt-PT': 'pt',
  'ru-RU': 'ru',
  'ja-JP': 'ja',
  'ko-KR': 'ko',
  'zh': 'zh',
};

export async function POST(req) {
  if (!speechClient || !translationClient) {
    return new Response(
      JSON.stringify({ error: 'API clients not properly initialized' }),
      { status: 500 }
    );
  }

  try {
    const data = await req.formData();
    const audio = data.get('audio');
    const inputLanguage = data.get('inputLanguage') || 'en-US';
    const outputLanguage = data.get('outputLanguage') || 'en-US';

    if (!audio) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await audio.arrayBuffer());

    const maxSize = 1024 * 1024;
    if (buffer.length > maxSize) {
      return new Response(
        JSON.stringify({ error: 'Audio chunk too large' }),
        { status: 400 }
      );
    }

    // Transcribe the audio in the input language
    const transcribeRequest = {
      audio: {
        content: buffer.toString('base64'),
      },
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: inputLanguage,
        model: 'default',
        enableAutomaticPunctuation: true,
        useEnhanced: true,
        maxAlternatives: 1,
        profanityFilter: false,
        enableWordTimeOffsets: false,
        metadata: {
          interactionType: 'DICTATION',
          microphoneDistance: 'NEARFIELD',
          originalMediaType: 'AUDIO',
        },
      },
    };

    const [transcribeResponse] = await speechClient.recognize(transcribeRequest);
    let originalTranscription = '';
    
    if (transcribeResponse.results && transcribeResponse.results.length > 0) {
      originalTranscription = transcribeResponse.results
        .map(result => result.alternatives[0].transcript)
        .join(' ');
    }

    // If input and output languages are the same or transcription is empty, return the transcription
    if (inputLanguage === outputLanguage || !originalTranscription) {
      return new Response(
        JSON.stringify({ 
          transcription: originalTranscription,
          inputLanguage,
          outputLanguage
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      );
    }

    // Translate the transcription to the target language
    const translateRequest = {
      parent: `projects/${process.env.GOOGLE_PROJECT_ID}/locations/global`,
      contents: [originalTranscription],
      mimeType: 'text/plain',
      sourceLanguageCode: LANGUAGE_MAPPING[inputLanguage] || 'en',
      targetLanguageCode: LANGUAGE_MAPPING[outputLanguage] || 'en',
    };

    const [translateResponse] = await translationClient.translateText(translateRequest);
    const translatedText = translateResponse.translations[0].translatedText;

    return new Response(
      JSON.stringify({ 
        transcription: translatedText,
        originalText: originalTranscription,
        inputLanguage,
        outputLanguage
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );

  } catch (error) {
    console.error('Detailed error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.details || 'Unknown error occurred',
        errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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