"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import TranscriptionCard from './transcription/TranscriptionCard';
import AIResponseCard from './ai/AIResponseCard';
import LectureNotesCard from './notes/LectureNotesCard';
import { useAudioProcessing } from '@/hooks/useAudioProcessing';
import { useGPTProcessing } from '@/hooks/useGPTProcessing';


const SpeechTranscriptionClient = () => {
  // Basic state
  const [transcriptions, setTranscriptions] = useState([]);
  const [originalTranscriptions, setOriginalTranscriptions] = useState([]);
  const [inputLanguage, setInputLanguage] = useState('en-US');
  const [outputLanguage, setOutputLanguage] = useState('en-US');

  // Use refs for pending updates
  const pendingGPTUpdate = useRef(null);
  
  // Use the GPT processing hook
  const { 
    isProcessingGPT, 
    isProcessingNotes,
    gptResponse, 
    notesData,
    processWithGPT,
    threadId 
  } = useGPTProcessing();


  // Schedule GPT processing
  const scheduleGPTProcessing = useCallback((text) => {
    if (pendingGPTUpdate.current) {
      clearTimeout(pendingGPTUpdate.current);
    }
    pendingGPTUpdate.current = setTimeout(() => {
      processWithGPT(text);
      pendingGPTUpdate.current = null;
    }, 1000);
  }, [processWithGPT]);

  // Handle new transcriptions
  const handleTranscriptionUpdate = useCallback((data) => {
    if (data.transcription?.trim()) {
      setTranscriptions(prev => {
        const newTranscriptions = [...prev, {
          text: data.transcription.trim(),
          timestamp: new Date().toISOString(),
        }];
        
        // Schedule GPT processing with the full text
        const fullText = newTranscriptions.map(t => t.text).join(' ');
        scheduleGPTProcessing(fullText);
        
        return newTranscriptions;
      });
      
      if (data.originalText?.trim()) {
        setOriginalTranscriptions(prev => [...prev, {
          text: data.originalText.trim(),
          timestamp: new Date().toISOString(),
        }]);
      }
    }
  }, [scheduleGPTProcessing]);

  // Handle recording stop
  const handleRecordingStop = useCallback(() => {
    const fullText = transcriptions.map(t => t.text).join(' ');
    if (fullText) {
      processWithGPT(fullText);
    }
  }, [transcriptions, processWithGPT]);

  // Language change handlers
  const handleInputLanguageChange = useCallback((langCode) => {
    setInputLanguage(langCode);
    resetState();
  }, []);

  const handleOutputLanguageChange = useCallback((langCode) => {
    setOutputLanguage(langCode);
    resetState();
  }, []);

  // Reset all state
  const resetState = useCallback(() => {
    setTranscriptions([]);
    setOriginalTranscriptions([]);
    setNotesData(null);
    setIsProcessingNotes(false);
    if (pendingGPTUpdate.current) {
      clearTimeout(pendingGPTUpdate.current);
      pendingGPTUpdate.current = null;
    }
  }, []);

  // Use the audio processing hook
  const {
    isRecording,
    isProcessing,
    error,
    startRecording,
    stopRecording: baseStopRecording,
    cleanup
  } = useAudioProcessing({
    onTranscriptionUpdate: handleTranscriptionUpdate,
    inputLanguage,
    outputLanguage
  });

  // Enhanced stop recording function
  const stopRecording = useCallback(() => {
    baseStopRecording();
    handleRecordingStop();
  }, [baseStopRecording, handleRecordingStop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (pendingGPTUpdate.current) {
        clearTimeout(pendingGPTUpdate.current);
      }
    };
  }, [cleanup]);

  return (
    <div className="max-w-4xl mx-auto">
      <TranscriptionCard
        error={error}
        inputLanguage={inputLanguage}
        outputLanguage={outputLanguage}
        handleInputLanguageChange={handleInputLanguageChange}
        handleOutputLanguageChange={handleOutputLanguageChange}
        isRecording={isRecording}
        startRecording={startRecording}
        stopRecording={stopRecording}
        isProcessing={isProcessing}
        originalTranscriptions={originalTranscriptions}
        transcriptions={transcriptions}
      />

      <AIResponseCard
        isProcessingGPT={isProcessingGPT}
        gptResponse={gptResponse}
      />

      <LectureNotesCard
        isProcessingNotes={isProcessingNotes}
        notesData={notesData}
        isRecording={isRecording}
      />
    </div>
  );
};

export default SpeechTranscriptionClient;