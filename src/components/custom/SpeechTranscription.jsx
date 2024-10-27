"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Languages } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LanguageSelector from './LanguageSelector';

const SpeechTranscription = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const processAudioChunk = async (audioBlob) => {
    try {
      setIsProcessing(true);
      console.log('Processing audio chunk:', audioBlob.size, 'bytes');

      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', selectedLanguage);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const data = await response.json();
      console.log('Transcription received:', data.transcription);
      
      if (data.transcription && data.transcription.trim()) {
        setTranscription(data.transcription.trim());
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      setError('');
      setTranscription('');
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

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        await processAudioChunk(audioBlob);
        chunksRef.current = [];
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Microphone error:', err);
      setError('Error accessing microphone: ' + err.message);
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsRecording(false);
  }, []);

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    if (isRecording) {
      stopRecording();
    }
    setTranscription('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Speech Transcription</span>
            <div className="flex items-center gap-4">
              <LanguageSelector onLanguageChange={handleLanguageChange} />
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
            <div className="flex justify-center">
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

            <div className="min-h-48 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Transcription:</h3>
              {isProcessing && (
                <div className="flex items-center gap-2 text-gray-500 italic mb-2">
                  <span className="animate-pulse">Processing audio...</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">
                {transcription || 'Your transcription will appear here...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeechTranscription;