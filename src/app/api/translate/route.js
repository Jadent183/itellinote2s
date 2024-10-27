import { TranslationServiceClient } from '@google-cloud/translate';

let translationClient;

try {
  translationClient = new TranslationServiceClient({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    projectId: process.env.GOOGLE_PROJECT_ID,
  });
} catch (error) {
  console.error('Error initializing translation client:', error);
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
    if (!translationClient) {
      throw new Error('Translation service not available');
    }

    const body = await req.json();
    console.log('Received translation request:', body);

    const { text, inputLanguage, outputLanguage } = body;

    if (!text) {
      throw new Error('No text provided');
    }

    const [response] = await translationClient.translateText({
      parent: `projects/${process.env.GOOGLE_PROJECT_ID}/locations/global`,
      contents: [text],
      mimeType: 'text/plain',
      sourceLanguageCode: LANGUAGE_MAPPING[inputLanguage] || 'en',
      targetLanguageCode: LANGUAGE_MAPPING[outputLanguage] || 'en',
    });

    console.log('Translation response:', response);

    if (!response.translations?.length) {
      throw new Error('No translation returned');
    }

    return new Response(
      JSON.stringify({ 
        translatedText: response.translations[0].translatedText,
        sourceLanguage: LANGUAGE_MAPPING[inputLanguage],
        targetLanguage: LANGUAGE_MAPPING[outputLanguage],
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}