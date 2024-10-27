"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Languages, ArrowRight, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DataStructureVisualizer from './DataStructureVisualizer';
import LanguageSelector from './LanguageSelector';
import NotesDisplay from './NotesDisplay';
import LectureNotesVisualizer from './LectureNotesVisualizer';
import DynamicLectureNotes from './DynamicLectureNotes';

const CHUNK_INTERVAL = 5000;

const SpeechTranscription = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);
  const [originalTranscriptions, setOriginalTranscriptions] = useState([]);
  const [notes, setNotes] = useState('');
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputLanguage, setInputLanguage] = useState('en-US');
  const [outputLanguage, setOutputLanguage] = useState('en-US');
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const chunkIntervalRef = useRef(null);
  const isProcessingRef = useRef(false);



  const processAudioChunk = async (audioBlob) => {
    if (isProcessingRef.current) return;
    
    try {
      isProcessingRef.current = true;
      setIsProcessing(true);
      
      if (audioBlob.size < 1000) {
        console.log('Skipping small audio chunk');
        return;
      }

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
      console.log('Response received:', data);
      
      if (data.transcription && data.transcription.trim()) {
        setTranscriptions(prev => [...prev, {
          text: data.transcription.trim(),
          timestamp: new Date().toISOString(),
        }]);
        
        if (data.originalText) {
          setOriginalTranscriptions(prev => [...prev, {
            text: data.originalText.trim(),
            timestamp: new Date().toISOString(),
          }]);
        }
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message);
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  };



  const collectAndProcessChunk = () => {
    if (chunksRef.current.length === 0) return;
    
    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
    chunksRef.current = []; // Clear the chunks array
    processAudioChunk(audioBlob);
  };



  const startRecording = async () => {
    try {
      setError('');
      chunksRef.current = [];
      setTranscriptions([]);
      
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

      const startNewRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
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

      chunkIntervalRef.current = setInterval(() => {
        startNewRecording();
      }, CHUNK_INTERVAL);

      startNewRecording();
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Microphone error:', err);
      setError('Error accessing microphone: ' + err.message);
    }
  };



  const stopRecording = useCallback(() => {
    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current);
      chunkIntervalRef.current = null;
    }

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
    setTranscriptions([]);
  };



  useEffect(() => {
    return () => {
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);



const handleInputLanguageChange = (langCode) => {
    setInputLanguage(langCode);
    if (isRecording) {
      stopRecording();
    }
    setTranscriptions([]);
    setOriginalTranscriptions([]);
  };



  const handleOutputLanguageChange = (langCode) => {
    setOutputLanguage(langCode);
    if (isRecording) {
      stopRecording();
    }
    setTranscriptions([]);
    setOriginalTranscriptions([]);
  };


//   const generateNotes = async () => {
//     try {
//       setIsGeneratingNotes(true);
      
//       // Get the complete transcription text
//       const transcriptionText = transcriptions
//         .map(t => t.text)
//         .join(' ');

//       const response = await fetch('/api/generate-notes', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           transcription: transcriptionText,
//           language: outputLanguage,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to generate notes');
//       }

//       const data = await response.json();
//       setNotes(data.notes);
//     } catch (err) {
//       console.error('Notes generation error:', err);
//       setError('Failed to generate notes: ' + err.message);
//     } finally {
//       setIsGeneratingNotes(false);
//     }
//   };


const lectureData = {
    // "content": [
    //   "Introduction:",
    //   "The lecture covers two essential search algorithms: Linear Search and Binary Search.",
    //   "Linear Search:",
    //   "Description:",
    //   "Checks each element in sequence until target is found or end is reached.",
    //   "Advantages:",
    //   "Best suited for unsorted data as no ordering is required.",
    //   "Example:",
    //   "Searching for 19 in [12, 4, 8, 19, 7, 5].",
    //   "Steps: Comparisons made with 12, 4, 8, then 19 (found at index 3, after 4 comparisons).",
    //   "Performance:",
    //   "Time complexity: O(n) in the worst case.",
    //   "Binary Search:",
    //   "Description:",
    //   "Requires a sorted array and utilizes a divide-and-conquer approach.",
    //   "Example:",
    //   "Searching for 14 in [2, 5, 7, 10, 14, 18, 21, 25].",
    //   "Steps: Identify the middle element (10, index 3), compare and halve the search space. Narrow to [14, 18, 21, 25], then [14] (found at index 4, after 3 comparisons).",
    //   "Performance:",
    //   "Time complexity: O(log n), more efficient for large, sorted datasets.",
    //   "Comparison and Use Cases:",
    //   "Recommendations:",
    //   "Use Linear Search for unsorted data or data structures like linked lists.",
    //   "Use Binary Search for fast searching in sorted arrays or lists.",
    //   "Next Steps:",
    //   "Practice implementing these algorithms in code.",
    //   "Discuss scenarios favoring each approach."
    // ],
    // "data-structures": [
    //   {
    //     "type": "array",
    //     "initialValues": [
    //       12,
    //       4,
    //       8,
    //       19,
    //       7,
    //       5
    //     ]
    //   },
    //   {
    //     "type": "bst",
    //     "initialValues": [
    //       2,
    //       5,
    //       7,
    //       10,
    //       14,
    //       18,
    //       21,
    //       25
    //     ]
    //   }
    // ],
    // "subject": "Linear Search vs. Binary Search"
  };


  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Real-time Speech Transcription & Translation</span>
            <div className="flex items-center gap-4">
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
            <div className="flex items-center justify-center gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Input Language</p>
                <LanguageSelector onLanguageChange={handleInputLanguageChange} defaultValue={inputLanguage} />
              </div>
              <ArrowRight className="h-4 w-4 mt-6 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Output Language</p>
                <LanguageSelector onLanguageChange={handleOutputLanguageChange} defaultValue={outputLanguage} />
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <Button 
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                className="flex items-center gap-2"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inputLanguage !== outputLanguage && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">
                    Original ({inputLanguage}):
                  </h3>
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-gray-500 italic mb-2">
                      <span className="animate-pulse">Processing audio...</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap space-y-2">
                    {originalTranscriptions.length > 0 ? (
                      originalTranscriptions.map((transcript) => (
                        <p key={transcript.timestamp}>
                          {transcript.text}
                        </p>
                      ))
                    ) : (
                      'Original transcription will appear here...'
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">
                  {inputLanguage === outputLanguage ? 
                    'Transcription:' : 
                    `Translation (${outputLanguage}):`
                  }
                </h3>
                {isProcessing && (
                  <div className="flex items-center gap-2 text-gray-500 italic mb-2">
                    <span className="animate-pulse">Processing audio...</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap space-y-2">
                  {transcriptions.length > 0 ? (
                    transcriptions.map((transcript) => (
                      <p key={transcript.timestamp}>
                        {transcript.text}
                      </p>
                    ))
                  ) : (
                    'Transcription will appear here...'
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
                  {/* Spacer */}
      <div className="max-w-4xl mx-auto p-4" />

                  {/* Notes Data */}
      <Card>
        <CardContent>
            <DynamicLectureNotes lectureData={lectureData}/>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeechTranscription;