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
  try {
    if (!speechClient || !translationClient) {
      throw new Error('API clients not properly initialized');
    }

    const formData = await req.formData();
    const audio = formData.get('audio');
    const inputLanguage = formData.get('inputLanguage') || 'en-US';
    const outputLanguage = formData.get('outputLanguage') || 'en-US';

    if (!audio) {
      throw new Error('No audio file provided');
    }

    const buffer = Buffer.from(await audio.arrayBuffer());

    // Transcribe the audio
    const [transcribeResponse] = await speechClient.recognize({
      audio: { content: buffer.toString('base64') },
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: inputLanguage,
        model: 'default',
        enableAutomaticPunctuation: true,
        useEnhanced: true,
      },
    });

    if (!transcribeResponse.results?.length) {
      return new Response(
        JSON.stringify({ 
          transcription: '',
          originalText: '',
          inputLanguage,
          outputLanguage,
          message: 'No transcription results'
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const originalText = transcribeResponse.results
      .map(result => result.alternatives[0].transcript)
      .join(' ');

    // If languages are the same, return without translation
    if (inputLanguage === outputLanguage) {
      return new Response(
        JSON.stringify({ 
          transcription: originalText,
          originalText: originalText,
          inputLanguage,
          outputLanguage
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Translate if languages are different
    const [translateResponse] = await translationClient.translateText({
      parent: `projects/${process.env.GOOGLE_PROJECT_ID}/locations/global`,
      contents: [originalText],
      mimeType: 'text/plain',
      sourceLanguageCode: LANGUAGE_MAPPING[inputLanguage],
      targetLanguageCode: LANGUAGE_MAPPING[outputLanguage],
    });

    const translatedText = translateResponse.translations[0].translatedText;

    return new Response(
      JSON.stringify({ 
        transcription: translatedText,
        originalText: originalText,
        inputLanguage,
        outputLanguage
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}