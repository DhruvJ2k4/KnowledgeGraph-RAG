import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Knowledge Graph - RAG</h1>
            <p className="text-xs text-muted-foreground">
              AI-Powered Document Analysis & Question Answering
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}; 