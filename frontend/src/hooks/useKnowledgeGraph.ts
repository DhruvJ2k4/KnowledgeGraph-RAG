import { useState, useCallback, useEffect } from 'react';
import { KnowledgeGraphStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { kgStatusApi } from '@/lib/api';
import { usePDFUpload } from './usePDFUpload';

/**
 * Custom hook for managing knowledge graph operations
 * Handles building, deleting, and monitoring the knowledge graph status
 */
export const useKnowledgeGraph = () => {
  const [status, setStatus] = useState<KnowledgeGraphStatus>({ status: 'offline' });
  const [isBuilding, setIsBuilding] = useState(false);
  const { toast } = useToast();
  const { refreshFiles } = usePDFUpload();

  // New state for entity extraction
  const [isExtractingEntities, setIsExtractingEntities] = useState(false);

  // Fetch knowledge graph status from backend
  const fetchKnowledgeGraphStatus = useCallback(async () => {
    try {
      const currentStatus = await kgStatusApi.getStatus();
      setStatus(currentStatus);
      refreshFiles();
    } catch (error) {
      console.error("Error fetching knowledge graph status:", error);
      // Optionally, set status to error or offline if fetching fails
      setStatus({ status: 'error', message: 'Failed to fetch graph status.' });
    }
  }, [refreshFiles]);

  useEffect(() => {
    fetchKnowledgeGraphStatus(); // Initial fetch of KG status
  }, [fetchKnowledgeGraphStatus]);

  // Extract entities from processed PDFs
  const extractEntities = useCallback(async () => {
    try {
      setIsExtractingEntities(true);
      setStatus({ status: 'building', stage: 'Extracting entities...', progress: 0 });

      const entityStatus = await kgStatusApi.extractEntities();
      setStatus({ 
        status: 'ready', 
        stage: 'Entities extracted', 
        progress: 100,
        entitiesExtracted: entityStatus.entitiesExtracted,
        message: "Entities have been successfully extracted."
      });

      toast({
        title: "Entities Extracted",
        description: "Entities have been successfully extracted from your PDFs!",
      });
      fetchKnowledgeGraphStatus(); // Re-fetch status after successful entity extraction

    } catch (error) {
      console.error('Error extracting entities:', error);
      setStatus({
        status: 'error',
        message: 'Failed to extract entities. Please try again.',
      });
      toast({
        title: "Extraction Failed",
        description: "Failed to extract entities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExtractingEntities(false);
    }
  }, [toast, fetchKnowledgeGraphStatus]);

  // Build knowledge graph from uploaded PDFs
  const buildKnowledgeGraph = useCallback(async () => {
    try {
      setIsBuilding(true);
      setStatus({ status: 'building', stage: 'Processing PDFs...', progress: 0 });

      // Step 1: Process PDFs (This step is now triggered by data_loader.py on upload)
      // The status will be 'processed' after upload, not 'building' initially here.
      // We will assume processing is done if we are triggering buildKnowledgeGraph.

      // Step 2: Extract entities (This step is now manual via extractEntities button)
      // This logic should be moved to the new extractEntities function
      // const entityStatus = await kgStatusApi.extractEntities();
      // setStatus({ 
      //   status: 'building', 
      //   stage: 'Extracting entities...', 
      //   progress: 50,
      //   chunksCreated: pdfStatus.chunksCreated,
      //   pdfsProcessed: pdfStatus.pdfsProcessed,
      //   entitiesExtracted: entityStatus.entitiesExtracted
      // });

      // Step 3: Build knowledge graph
      const kgStatus = await kgStatusApi.buildKG();
      setStatus({ 
        status: 'building', 
        stage: 'Building relationships...', 
        progress: 75,
        chunksCreated: kgStatus.chunksCreated, // Assuming these come from kgStatus now or are re-fetched
        pdfsProcessed: kgStatus.pdfsProcessed,
        entitiesExtracted: kgStatus.entitiesExtracted,
        relationshipsCreated: kgStatus.relationshipsCreated
      });

      // Step 4: Update knowledge graph
      const finalStatus = await kgStatusApi.updateKG();
      setStatus({
        status: 'ready',
        message: 'Knowledge Graph is ready for queries',
        entityCount: finalStatus.entityCount,
        relationshipCount: finalStatus.relationshipCount,
        chunksCreated: finalStatus.chunksCreated,
        pdfsProcessed: finalStatus.pdfsProcessed,
        entitiesExtracted: finalStatus.entitiesExtracted,
        relationshipsCreated: finalStatus.relationshipsCreated
      });

      toast({
        title: "Knowledge Graph Built",
        description: "Your knowledge graph is ready for queries!",
      });
      fetchKnowledgeGraphStatus(); // Re-fetch status after successful build

    } catch (error) {
      console.error('Error building knowledge graph:', error);
      setStatus({
        status: 'error',
        message: 'Failed to build knowledge graph. Please try again.',
      });

      toast({
        title: "Build Failed",
        description: "Failed to build knowledge graph. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBuilding(false);
    }
  }, [toast, fetchKnowledgeGraphStatus]);

  // Delete knowledge graph
  const deleteKnowledgeGraph = useCallback(async () => {
    try {
      await kgStatusApi.deletePDFStatus(); // This deletes PDFs, chunks, and entities based on KG_status.py
      setStatus({ status: 'offline' });

      toast({
        title: "Knowledge Graph Deleted",
        description: "The knowledge graph has been cleared successfully.",
      });
      fetchKnowledgeGraphStatus(); // Re-fetch status after successful delete

    } catch (error) {
      console.error('Error deleting knowledge graph:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete knowledge graph. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast, fetchKnowledgeGraphStatus]);

  return {
    status,
    isBuilding,
    isExtractingEntities, // Expose new state
    buildKnowledgeGraph,
    extractEntities, // Expose new function
    deleteKnowledgeGraph,
  };
};
