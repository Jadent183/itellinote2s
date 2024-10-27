import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Loader2 } from 'lucide-react';

const AIResponseCard = ({ isProcessingGPT, gptResponse }) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Assistant Response</span>
          <BookOpen className="h-6 w-6 text-gray-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isProcessingGPT ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing with AI Assistant...</span>
          </div>
        ) : gptResponse ? (
          <div className="whitespace-pre-wrap">{gptResponse}</div>
        ) : (
          <div className="text-gray-500">
            AI Assistant response will appear here...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIResponseCard;
