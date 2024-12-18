"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import TypewriterText from './TypewriterText';

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
      {/* Original Text Display */}
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

      {/* Transcribed/Translated Text Display */}
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

export default TranscriptionDisplay;