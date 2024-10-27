"use client";

import React, { useState, useCallback, useEffect } from 'react';
import TranscriptionCard from './transcription/TranscriptionCard';
import LectureNotesCard from './notes/LectureNotesCard';
import { useAudioProcessing } from '@/hooks/useAudioProcessing';
import { useGPTProcessing } from '@/hooks/useGPTProcessing';

const SpeechTranscriptionClient = () => {
  const [transcriptions, setTranscriptions] = useState([]);
  const [originalTranscriptions, setOriginalTranscriptions] = useState([]);
  const [inputLanguage, setInputLanguage] = useState('en-US');
  const [outputLanguage, setOutputLanguage] = useState('en-US');
  const [completeTranscription, setCompleteTranscription] = useState('');

  const { 
    isProcessingGPT, 
    isProcessingNotes,
    gptResponse, 
    notesData,
    processWithGPT,
    threadId 
  } = useGPTProcessing();

  // Debug effect for language changes
  useEffect(() => {
    console.log('Languages updated:', { inputLanguage, outputLanguage });
  }, [inputLanguage, outputLanguage]);

  const handleTranscriptionUpdate = useCallback((data) => {
    console.log('Received transcription data:', data);

    if (data.originalText?.trim() || data.transcription?.trim()) {
      if (inputLanguage !== outputLanguage) {
        // When languages are different, handle both original and translated text
        if (data.originalText?.trim()) {
          setOriginalTranscriptions(prev => [...prev, {
            text: data.originalText.trim(),
            timestamp: new Date().toISOString(),
          }]);
          
          // Update complete transcription with original text
          setCompleteTranscription(prev => {
            const newText = data.originalText.trim();
            return prev ? `${prev} ${newText}` : newText;
          });
        }
        
        if (data.transcription?.trim()) {
          setTranscriptions(prev => [...prev, {
            text: data.transcription.trim(),
            timestamp: new Date().toISOString(),
          }]);
        }
      } else {
        // When languages are the same, use transcription for both
        const transcriptionText = data.transcription?.trim();
        if (transcriptionText) {
          setTranscriptions(prev => [...prev, {
            text: transcriptionText,
            timestamp: new Date().toISOString(),
          }]);
          
          // Update complete transcription
          setCompleteTranscription(prev => {
            return prev ? `${prev} ${transcriptionText}` : transcriptionText;
          });
        }
      }
    }
  }, [inputLanguage, outputLanguage]);

const handleInputLanguageChange = useCallback((langCode) => {
  console.log('Input language changing to:', langCode);
  setInputLanguage(langCode);
  setTranscriptions([]);
  setOriginalTranscriptions([]);
  setCompleteTranscription('');
}, []);

const handleOutputLanguageChange = useCallback((langCode) => {
  console.log('Output language changing to:', langCode);
  setOutputLanguage(langCode);
  setTranscriptions([]);
  setOriginalTranscriptions([]);
  setCompleteTranscription('');
}, []);

const handleRecordingStop = useCallback(() => {
  if (completeTranscription) {
    // If languages are different and we have translations, use the translated text
    const translatedText = inputLanguage !== outputLanguage ? 
      transcriptions.map(t => t.text).join(' ') :
      completeTranscription;
    
    processWithGPT(translatedText);
  }
}, [completeTranscription, processWithGPT, inputLanguage, outputLanguage, transcriptions]);

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

  const stopRecording = useCallback(() => {
    baseStopRecording();
    handleRecordingStop();
  }, [baseStopRecording, handleRecordingStop]);

  useEffect(() => {
    return cleanup;
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

      <LectureNotesCard
        isProcessingNotes={isProcessingNotes}
        notesData={notesData}
        isRecording={isRecording}
      />
    </div>
  );
};

export default SpeechTranscriptionClient;