import React from 'react';

const TranscriptionDisplay = ({
  inputLanguage,
  outputLanguage,
  isProcessing,
  originalTranscriptions,
  transcriptions,
}) => {
  return (
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
                <p key={transcript.timestamp}>{transcript.text}</p>
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
              <p key={transcript.timestamp}>{transcript.text}</p>
            ))
          ) : (
            'Transcription will appear here...'
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptionDisplay;
