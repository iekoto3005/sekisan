
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface AnalysisResultProps {
  result: string;
  isLoading: boolean;
  error: string;
}

const Placeholder = () => (
    <div className="text-center text-content-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <p className="mt-4">Your image analysis will appear here.</p>
    </div>
);

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, isLoading, error }) => {
  return (
    <div className="w-full min-h-[300px] h-full bg-base-200 border border-base-300 rounded-lg p-4 flex flex-col justify-center">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center text-content-200">
            <LoadingSpinner />
            <p className="mt-2">Analyzing with Gemini...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 font-semibold">An Error Occurred</p>
            <p className="text-sm">{error}</p>
        </div>
      ) : result ? (
        <div className="prose prose-invert prose-sm max-w-none text-content-100 whitespace-pre-wrap font-sans">
            {result}
        </div>
      ) : (
        <Placeholder />
      )}
    </div>
  );
};
