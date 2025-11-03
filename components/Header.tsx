
import React from 'react';

export const Header = () => {
  return (
    <header className="bg-base-200/50 backdrop-blur-sm p-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
          Gemini Image Analyzer
        </h1>
        <p className="text-content-200 mt-1">Upload an image and let AI describe it for you.</p>
      </div>
    </header>
  );
};
