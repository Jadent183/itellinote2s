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
    console.error('Clients not initialized');
    return new Response(
      JSON.stringify({ error: 'API clients not properly initialized' }),
      { status: 500 }
    );
  }

  try {
    const data = await req.formData();
    const audio = data.get('audio');
    const inputLanguage = data.get('inputLanguage');
    const outputLanguage = data.get('outputLanguage');

    console.log('Received request with languages:', { 
      inputLanguage, 
      outputLanguage,
      hasAudio: !!audio 
    });

    if (!audio) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { status: 400 }
      );
    }

    if (!inputLanguage || !outputLanguage) {
      return new Response(
        JSON.stringify({ error: 'Language settings not provided' }),
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await audio.arrayBuffer());

    // Always transcribe in input language
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
      },
    };

    console.log('Sending transcription request in language:', inputLanguage);
    const [transcribeResponse] = await speechClient.recognize(transcribeRequest);
    
    if (!transcribeResponse.results || transcribeResponse.results.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No transcription results' }),
        { status: 404 }
      );
    }

    const originalText = transcribeResponse.results
      .map(result => result.alternatives[0].transcript)
      .join(' ');

    console.log('Original transcription:', originalText);

    // If languages are the same, return without translation
    if (inputLanguage === outputLanguage) {
      return new Response(
        JSON.stringify({ 
          transcription: originalText,
          originalText: originalText,
          inputLanguage,
          outputLanguage
        }),
        { status: 200 }
      );
    }

    // Translate if languages are different
    const translateRequest = {
      parent: `projects/${process.env.GOOGLE_PROJECT_ID}/locations/global`,
      contents: [originalText],
      mimeType: 'text/plain',
      sourceLanguageCode: LANGUAGE_MAPPING[inputLanguage],
      targetLanguageCode: LANGUAGE_MAPPING[outputLanguage],
    };

    console.log('Sending translation request:', {
      source: LANGUAGE_MAPPING[inputLanguage],
      target: LANGUAGE_MAPPING[outputLanguage],
      text: originalText
    });

    const [translateResponse] = await translationClient.translateText(translateRequest);
    
    if (!translateResponse.translations || translateResponse.translations.length === 0) {
      throw new Error('No translation result');
    }

    const translatedText = translateResponse.translations[0].translatedText;

    console.log('Translation result:', {
      original: originalText,
      translated: translatedText,
    });

    return new Response(
      JSON.stringify({ 
        transcription: translatedText,
        originalText: originalText,
        inputLanguage,
        outputLanguage
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in transcribe API:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { status: 500 }
    );
  }
}