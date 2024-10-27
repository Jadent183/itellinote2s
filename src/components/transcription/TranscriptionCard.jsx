"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Languages, ArrowRight, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Language Selector Component defined inline to ensure it works
const LanguageSelector = ({ onLanguageChange, defaultValue, currentValue }) => {
  const LANGUAGES = {
    'English': 'en-US',
    'Spanish': 'es-ES',
    'French': 'fr-FR',
    'German': 'de-DE',
    'Italian': 'it-IT',
    'Portuguese': 'pt-PT',
    'Russian': 'ru-RU',
    'Japanese': 'ja-JP',
    'Korean': 'ko-KR',
    'Chinese': 'zh',
  };

  return (
    <Select
      onValueChange={onLanguageChange}
      value={currentValue || defaultValue}
      defaultValue={defaultValue}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Language" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(LANGUAGES).map(([name, code]) => (
          <SelectItem key={code} value={code}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Simple Audio Visualizer Component
const AudioVisualizer = ({ isRecording, stream }) => {
  return (
    <div className="w-full flex justify-center my-4">
      <div className="h-2 w-48 bg-gray-200 rounded-full overflow-hidden">
        {isRecording && (
          <div className="h-full bg-blue-500 animate-pulse"></div>
        )}
      </div>
    </div>
  );
};

// TranscriptionDisplay Component
const TranscriptionDisplay = ({
  inputLanguage,
  outputLanguage,
  isProcessing,
  originalTranscriptions,
  transcriptions,
}) => {
  const showOriginal = inputLanguage !== outputLanguage;

  return (
    <div className="grid gap-4">
      {showOriginal && (
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Original Text</h3>
          <div className="space-y-2">
            {originalTranscriptions.map((item, index) => (
              <div key={item.timestamp} className="text-gray-600">
                <p>{item.text}</p>
              </div>
            ))}
          </div>
          {isProcessing && (
            <p className="text-sm text-gray-400 mt-2">Processing...</p>
          )}
        </Card>
      )}

      <Card className="p-4">
        <h3 className="text-sm font-medium mb-2">
          {showOriginal ? 'Translated Text' : 'Transcribed Text'}
        </h3>
        <div className="space-y-2">
          {transcriptions.map((item, index) => (
            <div key={item.timestamp} className="text-gray-600">
              <p>{item.text}</p>
            </div>
          ))}
        </div>
        {isProcessing && (
          <p className="text-sm text-gray-400 mt-2">Processing...</p>
        )}
      </Card>
    </div>
  );
};

// Main TranscriptionCard Component
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
  audioStream,
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

          {/* <AudioVisualizer isRecording={isRecording} stream={audioStream} /> */}

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
            originalTranscriptions={originalTranscriptions || []}
            transcriptions={transcriptions || []}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TranscriptionCard;