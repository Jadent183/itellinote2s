// src/components/ai/AIResponseCard.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Loader2 } from 'lucide-react';

const AIResponseCard = ({ 
  isProcessingGPT, 
  isProcessingSecondGPT, 
  gptResponse, 
  secondGptResponse 
}) => {
  return (
    <div className="space-y-4">
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>First AI Assistant Response</span>
            <BookOpen className="h-6 w-6 text-gray-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isProcessingGPT ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing with First AI Assistant...</span>
            </div>
          ) : gptResponse ? (
            <div className="whitespace-pre-wrap">{gptResponse}</div>
          ) : (
            <div className="text-gray-500">
              First AI Assistant response will appear here...
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Second AI Assistant Response</span>
            <BookOpen className="h-6 w-6 text-gray-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isProcessingSecondGPT ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing with Second AI Assistant...</span>
            </div>
          ) : secondGptResponse ? (
            <div className="whitespace-pre-wrap">{secondGptResponse}</div>
          ) : (
            <div className="text-gray-500">
              Second AI Assistant response will appear here...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIResponseCard;