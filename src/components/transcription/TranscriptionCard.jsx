import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Languages, ArrowRight, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LanguageSelector from './LanguageSelector';
import TranscriptionDisplay from './TranscriptionDisplay';
import AudioVisualizer from './AudioVisualizer';

const TranscriptionCard = ({
  error,
  inputLanguage,
  outputLanguage,
  handleInputLanguageChange,
  handleOutputLanguageChange,
  isRecording,
  startRecording,
  stopRecording,
  isProcessing,
  originalTranscriptions,
  transcriptions,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Real-time Speech Transcription & Translation</span>
          <div className="flex items-center gap-4">
            <Languages className="h-6 w-6 text-gray-500" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Input Language</p>
              <LanguageSelector
                onLanguageChange={handleInputLanguageChange}
                defaultValue="en-US"
                currentValue={inputLanguage}
              />
            </div>
            <ArrowRight className="h-4 w-4 mt-6 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 mb-1">Output Language</p>
              <LanguageSelector
                onLanguageChange={handleOutputLanguageChange}
                defaultValue="en-US"
                currentValue={outputLanguage}
              />
            </div>
          </div>


          <div className="flex justify-center mt-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              className="flex items-center gap-2"
              disabled={isProcessing}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Start Recording
                </>
              )}
            </Button>
          </div>

          <TranscriptionDisplay
            inputLanguage={inputLanguage}
            outputLanguage={outputLanguage}
            isProcessing={isProcessing}
            originalTranscriptions={originalTranscriptions}
            transcriptions={transcriptions}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TranscriptionCard;