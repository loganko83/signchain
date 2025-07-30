import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Video, 
  Music,
  Archive,
  CheckCircle,
  AlertCircle,
  X,
  Copy,
  ExternalLink,
  Hash,
  Clock,
  HardDrive
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

interface UploadedFile {
  ipfsHash: string;
  metadataHash: string;
  originalName: string;
  mimeType: string;
  size: number;
  checksum: string;
  uploadedAt: string;
  ipfsGatewayUrl: string;
  localGatewayUrl: string;
}

interface IPFSUploaderProps {
  onUploadComplete?: (file: UploadedFile) => void;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  category?: 'contract' | 'approval' | 'identity' | 'general';
}

const IPFSUploader: React.FC<IPFSUploaderProps> = ({
  onUploadComplete,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = [],
  category = 'general'
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    for (const file of acceptedFiles) {
      await uploadToIPFS(file);
    }
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: maxFileSize,
    accept: acceptedTypes.length > 0 ? acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as any) : undefined,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false)
  });

  const uploadToIPFS = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch('/api/v1/ipfs/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('IPFS 업로드 실패');
      }

      const result = await response.json();
      
      if (result.success) {
        const uploadedFile = result.data;
        setUploadedFiles(prev => [...prev, uploadedFile]);
        
        toast.success(`${file.name}이 IPFS에 성공적으로 업로드되었습니다!`);
        
        if (onUploadComplete) {
          onUploadComplete(uploadedFile);
        }
      } else {
        throw new Error(result.message || 'IPFS 업로드 실패');
      }

    } catch (error) {
      console.error('IPFS upload error:', error);
      toast.error(error instanceof Error ? error.message : 'IPFS 업로드 중 오류가 발생했습니다');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('클립보드에 복사되었습니다');
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="w-5 h-5" />;
    if (mimeType.includes('zip') || mimeType.includes('tar')) return <Archive className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            IPFS 파일 업로드
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive || dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {uploading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Upload className="w-12 h-12 text-primary animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium">IPFS에 업로드 중...</p>
                  <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                  <p className="text-sm text-muted-foreground">{uploadProgress}% 완료</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Upload className="w-12 h-12 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    파일을 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    최대 {formatFileSize(maxFileSize)} 크기의 파일을 IPFS에 업로드할 수 있습니다
                  </p>
                  {acceptedTypes.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      지원 형식: {acceptedTypes.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              업로드된 파일 ({uploadedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.mimeType)}
                      <div>
                        <h4 className="font-medium">{file.originalName}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3" />
                            {formatFileSize(file.size)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(file.uploadedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      IPFS 저장됨
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="flex items-center gap-2">
                        <Hash className="w-3 h-3" />
                        IPFS 해시:
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-white px-2 py-1 rounded">
                          {file.ipfsHash.slice(0, 20)}...
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(file.ipfsHash)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="flex items-center gap-2">
                        <Hash className="w-3 h-3" />
                        체크섬:
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-white px-2 py-1 rounded">
                          {file.checksum.slice(0, 16)}...
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(file.checksum)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(file.ipfsGatewayUrl, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      IPFS 게이트웨이에서 보기
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(file.ipfsGatewayUrl)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      URL 복사
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* IPFS Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Hash className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900">IPFS (InterPlanetary File System)</h4>
                <p className="text-sm text-blue-700">
                  파일이 분산 네트워크에 저장되어 영구적으로 보존됩니다. 
                  각 파일은 고유한 해시값으로 식별되며, 내용이 변경되지 않는 한 동일한 해시를 유지합니다.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className="text-xs">탈중앙화</Badge>
                  <Badge variant="secondary" className="text-xs">영구 저장</Badge>
                  <Badge variant="secondary" className="text-xs">콘텐츠 주소 지정</Badge>
                  <Badge variant="secondary" className="text-xs">무결성 보장</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IPFSUploader;
