import { useState, useCallback, useEffect } from 'react';
import { PDFFile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { fileApi } from '@/lib/api';

type FileWithData = PDFFile & { file?: File };

/**
 * Custom hook for managing PDF file uploads
 * Handles drag-and-drop, file selection, upload progress, and file management
 */
export const usePDFUpload = () => {
  const [files, setFiles] = useState<FileWithData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Fetch files from backend on component mount
  const fetchFiles = useCallback(async () => {
    try {
      const fetchedFiles = await fileApi.list();
      setFiles(fetchedFiles.map(file => {
        // Ensure file.id is not null or undefined before converting to string
        if (file.id === undefined || file.id === null) {
          console.warn("Received file with missing ID, skipping:", file);
          return null; // Return null for invalid entries
        }

        return {
          id: file.id.toString(),
          name: file.filename,
          size: file.size, // Use the actual size from the backend
          status: file.status,
          progress: file.status === 'pending' ? 0 : 100, // Set progress based on backend processing status
        };
      }).filter(Boolean)); // Filter out any null entries
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        title: "Error",
        description: "Failed to load uploaded files.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchFiles(); // Initial fetch

    // Removed: Set up polling (e.g., every 5 seconds)
    // Removed: const intervalId = setInterval(fetchFiles, 5000);
    // Removed: setPollingIntervalId(intervalId);

    // Removed: Clear interval on component unmount
    return () => {
    // Removed:   if (pollingIntervalId) {
    // Removed:     clearInterval(pollingIntervalId);
    // Removed:   }
    };
  }, [fetchFiles]);

  // Add files to the upload queue
  const addFiles = useCallback((newFiles: File[]) => {
    const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== newFiles.length) {
      toast({
        title: "Invalid Files",
        description: "Only PDF files are allowed.",
        variant: "destructive",
      });
    }

    const uniquePdfFiles: FileWithData[] = [];
    pdfFiles.forEach(file => {
      // Check for duplicates by name and size (a simple approach)
      const isDuplicate = files.some(
        existingFile => existingFile.name === file.name && existingFile.size === file.size
      );
      if (!isDuplicate) {
        uniquePdfFiles.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          status: 'pending' as const,
          file: file // Store the actual File object
        });
      } else {
        toast({
          title: "Duplicate File",
          description: `File '${file.name}' has already been added.`, 
          variant: "default",
        });
      }
    });

    setFiles(prev => [...prev, ...uniquePdfFiles]);
  }, [files, toast]);

  // Upload all pending files
  const uploadFiles = useCallback(async () => {
    const pendingFiles = files.filter(file => file.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Update all files to uploading status
      setFiles(prev => prev.map(f => 
        f.status === 'pending' ? { ...f, status: 'uploading' as const, progress: 0 } : f
      ));

      // Get all File objects
      const filesToUpload = pendingFiles
        .filter(file => file.file)
        .map(file => file.file as File);

      if (filesToUpload.length === 0) {
        throw new Error('No valid files to upload');
      }

      // Upload all files at once
      const response = await fileApi.upload(filesToUpload);

      // Update all files to uploaded status (rely on fetchFiles for actual IDs)
      setFiles(prev => prev.map(f => {
        if (f.status === 'uploading') {
          const uploadedFile = response.files.find(
            (file: { filename: string }) => file.filename === f.name
          );
          return {
            ...f,
            status: uploadedFile?.status === 'success' ? 'uploaded' as const : 'error' as const,
            progress: uploadedFile?.status === 'success' ? 100 : 0,
            error: uploadedFile?.status !== 'success' ? 'Upload failed' : undefined,
            name: f.name
          };
        }
        return f;
      }));

      // Check if all files were uploaded successfully
      const allUploaded = files.every(f => f.status === 'uploaded');
      if (allUploaded) {
        toast({
          title: "Upload Complete",
          description: `${filesToUpload.length} file(s) uploaded successfully.`,
        });
      }
      fetchFiles(); // Always refresh file list after attempted upload

    } catch (error) {
      console.error('Error uploading files:', error);
      
      // Update all uploading files to error status
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' ? { 
          ...f, 
          status: 'error' as const, 
          error: 'Upload failed. Please try again.'
        } : f
      ));

      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [files, toast, fetchFiles]);

  // Remove a file from the list and delete it from the backend
  const deleteFile = useCallback(async (fileId: string) => {
    try {
      // Optimistically remove from UI
      setFiles(prev => prev.filter(f => f.id !== fileId));

      await fileApi.delete(parseInt(fileId));

      toast({
        title: "File Deleted",
        description: "The file has been successfully deleted.",
      });
      fetchFiles(); // Refresh file list to ensure consistency
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete the file. Please try again.",
        variant: "destructive",
      });
      fetchFiles(); // Re-fetch to show the file if deletion failed
    }
  }, [toast, fetchFiles]);

  // Remove a file from the list
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  return {
    files,
    isUploading,
    addFiles,
    uploadFiles,
    removeFile, // This is for local removal, we will use deleteFile for actual deletion
    deleteFile,
    clearFiles,
    refreshFiles: fetchFiles, // Expose fetchFiles as refreshFiles
  };
};
