import { useState } from 'react';
import { useGetAllFiles, useSaveFileReference } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Calendar, Info } from 'lucide-react';
import { ExternalBlob } from '../../backend';

export default function UploadTab() {
  const { data: files, isLoading } = useGetAllFiles();
  const saveFile = useSaveFileReference();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await saveFile.mutateAsync({
        name: selectedFile.name,
        fileType: selectedFile.type || 'application/octet-stream',
        blob,
      });

      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h3 className="text-2xl font-bold">Upload Study Materials</h3>
        <p className="text-sm text-muted-foreground">Upload PDFs, text files, or documents for AI processing</p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> AI content generation is currently in development. You can upload files for storage,
          but automatic flashcard and quiz generation will be available in a future update. For now, please create
          flashcards and notes manually.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>Select a file to upload to your study library</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Choose File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileSelect}
              disabled={saveFile.isPending}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || saveFile.isPending}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {saveFile.isPending ? 'Uploading...' : 'Upload File'}
          </Button>
        </CardContent>
      </Card>

      <div>
        <h4 className="mb-4 font-semibold">Uploaded Files ({files?.length || 0})</h4>
        {!files || files.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No files uploaded</h3>
              <p className="text-center text-sm text-muted-foreground">
                Upload your first study material to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <Card key={file.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(file.uploadTime)}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={file.blob.getDirectURL()} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
