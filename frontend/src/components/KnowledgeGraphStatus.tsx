import React from 'react';
import { Database, Loader, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useKnowledgeGraph } from '@/hooks/useKnowledgeGraph';
import { usePDFUpload } from '@/hooks/usePDFUpload';
import { cn } from '@/lib/utils';

/**
 * Knowledge Graph Status Component
 * Shows the current status of the knowledge graph and provides build/delete controls
 */
export const KnowledgeGraphStatus: React.FC = () => {
  const { status, isBuilding, isExtractingEntities, buildKnowledgeGraph, extractEntities, deleteKnowledgeGraph } = useKnowledgeGraph();
  const { files, clearFiles } = usePDFUpload();

  // Check if there are any successfully processed files (not pending or error, and not yet entities_extracted)
  const hasProcessedFiles = files.some(f => f.status === 'processed');
  const hasEntitiesExtractedFiles = files.some(f => f.status === 'entities_extracted');
  
  const canBuildGraph = hasEntitiesExtractedFiles && status.status !== 'building';
  const canExtractEntities = hasProcessedFiles && !hasEntitiesExtractedFiles && !isExtractingEntities;

  // Get status indicator
  const getStatusIndicator = () => {
    switch (status.status) {
      case 'offline':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
            <span className="text-gray-400">Offline</span>
          </div>
        );
      case 'processed':
        return (
          <div className="flex items-center space-x-2">
            <Loader className="w-4 h-4 animate-spin text-yellow-400" />
            <span className="text-yellow-400">Processing PDFs...</span>
          </div>
        );
      case 'entities_extracted':
        return (
          <div className="flex items-center space-x-2">
            <Loader className="w-4 h-4 animate-spin text-purple-400" />
            <span className="text-purple-400">Extracting Entities...</span>
          </div>
        );
      case 'building':
        return (
          <div className="flex items-center space-x-2">
            <Loader className="w-4 h-4 animate-spin text-blue-400" />
            <span className="text-blue-400">{status.stage || 'Building...'}</span>
          </div>
        );
      case 'ready':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-green-400">Ready</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-red-400">Error</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Get process status card
  const getProcessStatusCard = () => {
    const stats = [
      { label: 'PDFs Processed', value: status.pdfsProcessed },
      { label: 'Chunks Created', value: status.chunksCreated },
      { label: 'Entities Extracted', value: status.entitiesExtracted },
      { label: 'Relationships Created', value: status.relationshipsCreated },
    ].filter(stat => stat.value !== undefined);

    if (stats.length === 0) return null;

    return (
      <div className="grid grid-cols-2 gap-4 text-center mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="p-3 bg-background rounded-lg">
            <p className="text-2xl font-bold text-primary">
              {stat.value?.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Knowledge Graph</h3>
        </div>
        {getStatusIndicator()}
      </div>

      {/* Status Card */}
      <div className="p-4 bg-card rounded-lg border space-y-4">
        {(status.status === 'offline' || status.status === 'processed' || status.status === 'entities_extracted') && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-muted-foreground mb-4">
              {status.status === 'offline' && (
                hasProcessedFiles || hasEntitiesExtractedFiles
                  ? 'Knowledge graph is not built yet. Click below to start processing.'
                  : 'Upload PDF files first to build the knowledge graph.'
              )}
              {status.status === 'processed' && (
                'PDFs processed. Ready to extract entities.'
              )}
              {status.status === 'entities_extracted' && (
                'Entities extracted. Ready to build knowledge graph.'
              )}
            </p>
            <div className="flex flex-col space-y-2">
              {/* Extract Entities Button */}
              {status.status === 'processed' && (
                <Button
                  onClick={extractEntities}
                  disabled={isExtractingEntities}
                  className={cn(
                    "bg-primary hover:bg-primary/90",
                    isExtractingEntities && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isExtractingEntities ? 'Extracting Entities...' : 'Extract Entities'}
                </Button>
              )}

              {/* Build Knowledge Graph Button */}
              {status.status === 'entities_extracted' && (
                <Button
                  onClick={buildKnowledgeGraph}
                  disabled={isBuilding}
                  className={cn(
                    "bg-primary hover:bg-primary/90",
                    isBuilding && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isBuilding ? 'Building...' : 'Build Knowledge Graph'}
                </Button>
              )}

              {(hasProcessedFiles || hasEntitiesExtractedFiles || status.status !== 'offline') && (
                <Button
                  variant="outline"
                  onClick={clearFiles}
                  className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Uploaded PDFs
                </Button>
              )}
            </div>
            {status.status === 'offline' && !(hasProcessedFiles || hasEntitiesExtractedFiles) && (
              <p className="text-sm text-muted-foreground mt-2">
                Upload PDF files to enable building
              </p>
            )}
          </div>
        )}

        {status.status === 'building' && (
          <div className="space-y-4">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-lg font-medium">{status.stage || 'Building...'}</p>
            </div>
            
            {status.progress !== undefined && (
              <div className="space-y-2">
                <Progress value={status.progress} className="h-3" />
                <p className="text-center text-sm text-muted-foreground">
                  {status.progress}% complete
                </p>
              </div>
            )}

            {getProcessStatusCard()}
          </div>
        )}

        {status.status === 'ready' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-lg font-medium text-green-400 mb-2">
                Knowledge Graph Ready!
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {status.message}
              </p>
              
              {/* Process Statistics */}
              {getProcessStatusCard()}
              
              {/* Graph Statistics */}
              {(status.entityCount || status.relationshipCount) && (
                <div className="grid grid-cols-2 gap-4 text-center mb-4">
                  {status.entityCount && (
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {status.entityCount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Entities</p>
                    </div>
                  )}
                  {status.relationshipCount && (
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {status.relationshipCount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Relationships</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={deleteKnowledgeGraph}
                className="flex-1 text-red-400 hover:text-red-500 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Graph
              </Button>
              <Button
                onClick={buildKnowledgeGraph}
                disabled={isBuilding}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Rebuild Graph
              </Button>
            </div>
          </div>
        )}

        {status.status === 'error' && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-red-400 mb-4">
              {status.message || 'An error occurred while building the knowledge graph.'}
            </p>
            <div className="flex flex-col space-y-2">
              <Button
                onClick={buildKnowledgeGraph}
                disabled={!canBuildGraph || isBuilding}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                Rebuild Graph
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
