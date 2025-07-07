import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePDFUpload } from '@/hooks/usePDFUpload';
import { cn } from '@/lib/utils';

/**
 * PDF Upload Area Component
 * Provides drag-and-drop and file selection functionality for PDF uploads
 */
export const PDFUploadArea: React.FC = () => {
  const { addFiles, uploadFiles, files, isUploading } = usePDFUpload();
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [addFiles]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Handle file input change
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [addFiles]);

  const pendingFiles = files.filter(f => f.status === 'pending');
  const hasUploadedFiles = files.some(f => f.status === 'uploaded');

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragOver && "border-primary bg-primary/10"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Drag & drop PDF files here</h3>
            <p className="text-muted-foreground">or click to browse your files</p>
            <p className="text-sm text-muted-foreground">Supports multiple PDF files</p>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            id="pdf-upload"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            variant="outline"
            onClick={() => document.getElementById('pdf-upload')?.click()}
            disabled={isUploading}
          >
            Browse Files
          </Button>
        </div>
      </div>

      {/* Upload Actions */}
      {pendingFiles.length > 0 && (
        <div className="flex justify-between items-center p-4 bg-card rounded-lg border">
          <span className="text-sm text-muted-foreground">
            {pendingFiles.length} file(s) ready to upload
          </span>
          <Button 
            onClick={uploadFiles}
            disabled={isUploading}
            className="bg-primary hover:bg-primary/90"
          >
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </div>
      )}

      {/* Upload Complete Message */}
      {hasUploadedFiles && pendingFiles.length === 0 && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm text-green-400">
            ✓ Files uploaded successfully. You can now build the knowledge graph.
          </p>
        </div>
      )}
    </div>
  );
};
