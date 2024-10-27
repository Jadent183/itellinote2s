import { useState, useCallback } from 'react';

const GPT_CALL_DELAY = 10000;

export const useGPTProcessing = () => {
  const [isProcessingGPT, setIsProcessingGPT] = useState(false);
  const [isProcessingNotes, setIsProcessingNotes] = useState(false);
  const [gptResponse, setGptResponse] = useState('');
  const [notesData, setNotesData] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [lastGPTCallTime, setLastGPTCallTime] = useState(null);

  const processNotesFromGPT = useCallback(async (firstGptResponse, currentThreadId = null) => {
    if (!firstGptResponse) return;

    setIsProcessingNotes(true);
    try {
      console.log('Processing notes with input:', firstGptResponse); // Debug log

      const response = await fetch('/api/gpt-second', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: firstGptResponse,
          threadId: currentThreadId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process notes');
      }

      const data = await response.json();
      
      if (data.response) {
        console.log('Received notes data:', data.response); // Debug log
        setNotesData(data.response);
      }
    } catch (error) {
      console.error('Notes processing error:', error);
      setNotesData({
        subject: "Error Processing Notes",
        "data-structures": [],
        content: [
          "Error:",
          "• Failed to process lecture notes",
          "• Please try again or contact support if the issue persists"
        ]
      });
    } finally {
      setIsProcessingNotes(false);
    }
  }, []);

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
        
        // Chain the notes processing with the response from the first GPT
        await processNotesFromGPT(data.response);
      }

      setLastGPTCallTime(currentTime);
    } catch (error) {
      console.error('GPT processing error:', error);
      setGptResponse('Error processing request. Please try again.');
    } finally {
      setIsProcessingGPT(false);
    }
  }, [threadId, lastGPTCallTime, processNotesFromGPT]);

  return {
    isProcessingGPT,
    isProcessingNotes,
    gptResponse,
    notesData,
    processWithGPT,
    threadId
  };
};