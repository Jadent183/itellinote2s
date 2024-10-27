import { useState, useCallback } from 'react';

const GPT_CALL_DELAY = 10000; // 10 seconds delay

export const useGPTProcessing = () => {
  const [isProcessingGPT, setIsProcessingGPT] = useState(false);
  const [gptResponse, setGptResponse] = useState('');
  const [threadId, setThreadId] = useState(null);
  const [lastGPTCallTime, setLastGPTCallTime] = useState(null);

  const processWithGPT = useCallback(async (transcriptionText, currentThreadId = null) => {
    const currentTime = Date.now();
    const timeSinceLastCall = lastGPTCallTime ? currentTime - lastGPTCallTime : GPT_CALL_DELAY + 1;

    if (timeSinceLastCall < GPT_CALL_DELAY || !transcriptionText) {
      return;
    }

    setIsProcessingGPT(true);
    try {
      const response = await fetch('/api/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcription: transcriptionText,
          threadId: currentThreadId || threadId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process with GPT');
      }

      const data = await response.json();
      
      if (data.response) {
        setGptResponse(data.response);
        setThreadId(data.threadId);
      }

      setLastGPTCallTime(currentTime);
    } catch (error) {
      console.error('GPT processing error:', error);
    } finally {
      setIsProcessingGPT(false);
    }
  }, [threadId, lastGPTCallTime]);

  return {
    isProcessingGPT,
    gptResponse,
    processWithGPT,
    threadId
  };
};