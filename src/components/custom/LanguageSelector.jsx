"use client";

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGES = {
  'English': 'en-US',
  'Spanish': 'es-ES',
  'French': 'fr-FR',
  'German': 'de-DE',
  'Italian': 'it-IT',
  'Portuguese': 'pt-PT',
  'Russian': 'ru-RU',
  'Japanese': 'ja-JP',
  'Korean': 'ko-KR',
  'Chinese': 'zh',
};

const LanguageSelector = ({ onLanguageChange }) => {
  return (
    <Select onValueChange={onLanguageChange} defaultValue="en-US">
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Language" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(LANGUAGES).map(([name, code]) => (
          <SelectItem key={code} value={code}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;