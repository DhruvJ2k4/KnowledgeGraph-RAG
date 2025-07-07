import React from 'react';
import { File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePDFUpload } from '@/hooks/usePDFUpload';
import { cn } from '@/lib/utils';

/**
 * File List Component
 * Displays uploaded files with their status and progress
 */
export const FileList: React.FC = () => {
  const { files, deleteFile } = usePDFUpload();

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No files uploaded yet</p>
      </div>
    );
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Pending', className: 'bg-yellow-500/20 text-yellow-400' },
      uploading: { label: 'Uploading', className: 'bg-blue-500/20 text-blue-400' },
      uploaded: { label: 'Uploaded', className: 'bg-green-500/20 text-green-400' },
      processed: { label: 'Processed', className: 'bg-purple-500/20 text-purple-400' },
      entities_extracted: { label: 'Entities Extracted', className: 'bg-indigo-500/20 text-indigo-400' },
      graph_built: { label: 'Graph Built', className: 'bg-teal-500/20 text-teal-400' },
      graph_updated: { label: 'Graph Updated', className: 'bg-orange-500/20 text-orange-400' },
      error: { label: 'Error', className: 'bg-red-500/20 text-red-400' },
    };
    
    const badge = badges[status as keyof typeof badges] || badges.pending;
    
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', badge.className)}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-4">Uploaded Files</h3>
      
      {files.map((file) => (
        <div key={file.id} className="p-4 bg-card rounded-lg border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <File className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {getStatusBadge(file.status)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteFile(file.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress bar for uploading files */}
          {file.status === 'uploading' && file.progress !== undefined && (
            <div className="space-y-1">
              <Progress value={file.progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {file.progress}%
              </p>
            </div>
          )}
          
          {/* Error message */}
          {file.status === 'error' && file.error && (
            <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded">
              {file.error}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
