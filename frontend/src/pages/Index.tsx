import React from 'react';
import { PDFUploadArea } from '@/components/PDFUploadArea';
import { FileList } from '@/components/FileList';
import { KnowledgeGraphStatus } from '@/components/KnowledgeGraphStatus';
import { ChatInterface } from '@/components/ChatInterface';
import { GraphVisualization } from '@/components/GraphVisualization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/common/Header';

/**
 * Main Index Page Component
 * Layout and structure for the Knowledge Graph RAG application
 */
const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-4 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left Column - Main Tabbed Interface (takes 2/3 of the space) */}
          <div className="lg:col-span-2 space-y-4 h-full">
            <section className="space-y-3 h-full flex flex-col">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-4 bg-primary rounded-full"></div>
                <h2 className="text-lg font-semibold">Document Management & Knowledge Graph</h2>
              </div>
              
              <div className="bg-card rounded-lg border flex-1 flex flex-col">
                <Tabs defaultValue="upload" className="w-full h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-3 mt-4 mb-0">
                    <TabsTrigger value="upload">Document Upload</TabsTrigger>
                    <TabsTrigger value="management">Knowledge Graph</TabsTrigger>
                    <TabsTrigger value="visualization">Visualization</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="p-4 pt-3 space-y-4 flex-1 overflow-auto">
                    {/* Document Upload Section */}
                    <div className="space-y-3">
                      <div className="bg-card rounded-lg border p-4">
                        <PDFUploadArea />
                      </div>
                    </div>

                    {/* File List Section */}
                    <div className="space-y-3">
                      <div className="bg-card rounded-lg border p-4">
                        <FileList />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="management" className="p-4 pt-3 flex-1 overflow-auto">
                    <KnowledgeGraphStatus />
                  </TabsContent>
                  
                  <TabsContent value="visualization" className="p-0 flex-1">
                    <GraphVisualization />
                  </TabsContent>
                </Tabs>
              </div>
            </section>
          </div>

          {/* Right Column - AI Assistant (takes 1/3 of the space) */}
          <div className="space-y-4 h-full">
            <section className="space-y-3 h-full flex flex-col">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-4 bg-primary rounded-full"></div>
                <h2 className="text-lg font-semibold">AI Assistant</h2>
              </div>
              
              <div className="bg-card rounded-lg border flex-1 min-h-0">
                <ChatInterface />
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Simple copyright text */}
      <div className="container mx-auto px-6 py-2">
        <p className="text-xs text-muted-foreground text-center">
          © 2025 Knowledge Graph RAG.
        </p>
      </div>
    </div>
  );
};

export default Index;
