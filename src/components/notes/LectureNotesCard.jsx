import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Loader2 } from 'lucide-react';
import DynamicLectureNotes from './DynamicLectureNotes';

const LectureNotesCard = ({ isProcessingNotes, notesData, isRecording }) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Lecture Notes</span>
          <BookOpen className="h-6 w-6 text-gray-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isProcessingNotes ? (
          <div className="flex items-center justify-center gap-2 text-gray-500 p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Generating structured notes...</span>
          </div>
        ) : notesData ? (
          <DynamicLectureNotes lectureData={notesData} />
        ) : isRecording ? (
          <div className="text-gray-500 text-center p-4">
            Notes will be generated when recording stops...
          </div>
        ) : (
          <div className="text-gray-500 text-center p-4">
            Start recording to generate notes
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LectureNotesCard;
