// src/hooks/useAudioProcessing.js

import { useRef, useState, useCallback } from 'react';

const CHUNK_INTERVAL = 5000;

export const useAudioProcessing = ({ 
  onTranscriptionUpdate, 
  inputLanguage, 
  outputLanguage 
}) => {
  // State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Refs
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const chunkIntervalRef = useRef(null);
  const isProcessingRef = useRef(false);

  const processAudioChunk = async (audioBlob) => {
    if (isProcessingRef.current || audioBlob.size < 1000) {
      return;
    }
    
    try {
      isProcessingRef.current = true;
      setIsProcessing(true);

      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('inputLanguage', inputLanguage);
      formData.append('outputLanguage', outputLanguage);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const data = await response.json();
      if (data.transcription?.trim()) {
        onTranscriptionUpdate(data);
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message);
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  };

  const collectAndProcessChunk = useCallback(() => {
    if (chunksRef.current.length === 0) return;
    
    const audioBlob = new Blob(chunksRef.current, { 
      type: 'audio/webm;codecs=opus' 
    });
    chunksRef.current = [];
    processAudioChunk(audioBlob);
  }, []);

  const stopRecording = useCallback(() => {
    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current);
      chunkIntervalRef.current = null;
    }

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRateHertz: 48000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      streamRef.current = stream;

      const options = {
        mimeType: 'audio/webm;codecs=opus',
        bitsPerSecond: 128000,
      };

      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        throw new Error(`${options.mimeType} is not supported in this browser`);
      }

      const startNewRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }

        const newRecorder = new MediaRecorder(stream, options);
        newRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        newRecorder.onstop = collectAndProcessChunk;
        
        mediaRecorderRef.current = newRecorder;
        newRecorder.start();
      };

      chunkIntervalRef.current = setInterval(startNewRecording, CHUNK_INTERVAL);
      startNewRecording();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      setError('Error accessing microphone: ' + err.message);
    }
  };

  // Cleanup function
  const cleanup = useCallback(() => {
    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current);
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  }, []);

  // Return the hook interface
  return {
    isRecording,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    cleanup
  };
};