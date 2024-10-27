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
  const [completeTranslation, setCompleteTranslation] = useState('');

  const { 
    isProcessingGPT, 
    isProcessingNotes,
    gptResponse, 
    notesData,
    processWithGPT,
    threadId 
  } = useGPTProcessing();

  const handleTranscriptionUpdate = useCallback((data) => {
    console.log('Received transcription data:', data);

    if (data.originalText?.trim() || data.transcription?.trim()) {
      // Handle original text
      if (data.originalText?.trim()) {
        setOriginalTranscriptions(prev => [...prev, {
          text: data.originalText.trim(),
          timestamp: new Date().toISOString(),
        }]);
        
        // Update complete original transcription
        setCompleteTranscription(prev => {
          const newText = data.originalText.trim();
          return prev ? `${prev} ${newText}` : newText;
        });
      }

      // Handle translated/transcribed text
      if (data.transcription?.trim()) {
        setTranscriptions(prev => [...prev, {
          text: data.transcription.trim(),
          timestamp: new Date().toISOString(),
        }]);

        // Update complete translation for different languages
        if (inputLanguage !== outputLanguage) {
          setCompleteTranslation(prev => {
            const newText = data.transcription.trim();
            return prev ? `${prev} ${newText}` : newText;
          });
        }
      }
    }
  }, [inputLanguage, outputLanguage]);

  const handleInputLanguageChange = useCallback((langCode) => {
    console.log('Changing input language to:', langCode);
    setInputLanguage(langCode);
    // Clear transcriptions when input language changes
    setOriginalTranscriptions([]);
    setTranscriptions([]);
    setCompleteTranscription('');
    setCompleteTranslation('');
  }, []);

  const handleOutputLanguageChange = useCallback(async (langCode) => {
    console.log('Changing output language to:', langCode);
    setOutputLanguage(langCode);
    
    // If there's existing content, translate it
    if (completeTranscription && langCode !== inputLanguage) {
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: completeTranscription,
            inputLanguage,
            outputLanguage: langCode,
          }),
        });

        if (response.ok) {
          const { translatedText } = await response.json();
          setCompleteTranslation(translatedText);
          setTranscriptions([{
            text: translatedText,
            timestamp: new Date().toISOString(),
          }]);
        }
      } catch (error) {
        console.error('Translation error:', error);
      }
    } else if (langCode === inputLanguage) {
      // Reset translation when languages match
      setCompleteTranslation('');
      setTranscriptions(originalTranscriptions);
    }
  }, [completeTranscription, inputLanguage]);

  const handleRecordingStop = useCallback(() => {
    // Use translated text for GPT when languages are different
    const textForGPT = inputLanguage !== outputLanguage ? 
      completeTranslation : 
      completeTranscription;

    if (textForGPT) {
      console.log('Processing with GPT:', {
        usingTranslation: inputLanguage !== outputLanguage,
        text: textForGPT
      });
      processWithGPT(textForGPT);
    }
  }, [completeTranscription, completeTranslation, inputLanguage, outputLanguage, processWithGPT]);

  const {
    isRecording,
    isProcessing,
    error,
    startRecording,
    stopRecording: baseStopRecording,
    cleanup,
    audioStream
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
        audioStream={audioStream}
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