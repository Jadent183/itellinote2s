import React, { useState, useEffect, useCallback } from 'react';

const TypewriterText = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  
  const words = text ? text.split(' ') : [];

  const typeNextWord = useCallback(() => {
    if (wordIndex < words.length) {
      setDisplayedText(prev => 
        prev + (prev ? ' ' : '') + words[wordIndex]
      );
      setWordIndex(prev => prev + 1);
    } else if (onComplete) {
      onComplete();
    }
  }, [words, wordIndex, onComplete]);

  useEffect(() => {
    if (words.length > 0) {
      const timer = setTimeout(typeNextWord, 200); // Adjust speed here
      return () => clearTimeout(timer);
    }
  }, [words, wordIndex, typeNextWord]);

  // Reset when new text comes in
  useEffect(() => {
    setDisplayedText('');
    setWordIndex(0);
  }, [text]);

  return (
    <div className="font-mono">
      {displayedText}
      <span className="animate-pulse">|</span>
    </div>
  );
};

export default TypewriterText;