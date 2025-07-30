import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, FileImage, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useChatStore } from '@/store/chatStore';
import { chatAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  onUploadComplete?: (documentId: string) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadComplete }) => {
  const { addDocument, documents, setActiveDocument } = useChatStore();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await chatAPI.uploadDocument(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Add document to store
      addDocument({
        id: response.document_id, // Use backend's document_id
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        size: file.size,
        url: URL.createObjectURL(file),
      });

      toast({
        title: "Document uploaded successfully",
        description: `${file.name} is ready for analysis`,
      });

      onUploadComplete?.(response.document_id);
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Please try again or check your file format",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [addDocument, toast, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeDocument = (documentId: string) => {
    // Implementation for removing documents would go here
    setActiveDocument(null);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed cursor-pointer transition-all duration-200 rounded-lg p-8 text-center
          ${isDragActive 
            ? 'border-primary bg-primary/10' 
            : 'border-border hover:border-primary/50 hover:bg-muted'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            {isDragActive ? 'Drop your contract here' : 'Upload Your Document'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Drag & drop a PDF or image file, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports PDF, PNG, JPG (max 10MB)
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="p-4 bg-muted rounded-lg border border-border">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading document...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        </div>
      )}

      {/* Document List */}
      {documents.length > 0 && (
        <div className="p-4 bg-muted rounded-lg border border-border">
          <h4 className="font-medium mb-3">Uploaded Documents</h4>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
              >
                <div className="flex items-center space-x-3">
                  {doc.type === 'pdf' ? (
                    <File className="h-5 w-5 text-agent-legal" />
                  ) : (
                    <FileImage className="h-5 w-5 text-agent-summary" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(doc.size / (1024 * 1024)).toFixed(1)} MB • {doc.type.toUpperCase()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(doc.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};