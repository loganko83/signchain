import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  FileText,
  Image,
  File as FileIcon,
  Calendar,
  User,
  Hash,
  Upload,
  Plus,
  RefreshCw,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import FileUpload from '@/components/FileUpload';
import IPFSUploader from '@/components/IPFSUploader';

interface FileItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  ipfsHash: string;
  uploadedBy: string;
  category: 'contract' | 'approval' | 'identity' | 'general';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

const FilesPage: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFiles = async (page = 1, search = '', category = 'all') => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(category !== 'all' && { category })
      });

      const response = await fetch(`/api/v1/files?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const result = await response.json();
      
      if (page === 1) {
        setFiles(result.data.files);
      } else {
        setFiles(prev => [...prev, ...result.data.files]);
      }
      
      setHasMore(result.data.pagination.hasMore);
      setCurrentPage(page);
    } catch (error) {
      toast.error('Failed to load files');
      console.error('Fetch files error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(1, searchTerm, categoryFilter);
  }, [searchTerm, categoryFilter]);

  const handleDownload = async (file: FileItem) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/files/${file.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success(`Downloaded ${file.originalName}`);
    } catch (error) {
      toast.error('Failed to download file');
      console.error('Download error:', error);
    }
  };

  const handleDelete = async (file: FileItem) => {
    if (!confirm(`Are you sure you want to delete ${file.originalName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/files/${file.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setFiles(prev => prev.filter(f => f.id !== file.id));
      toast.success(`Deleted ${file.originalName}`);
    } catch (error) {
      toast.error('Failed to delete file');
      console.error('Delete error:', error);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'contract': return 'bg-blue-100 text-blue-800';
      case 'approval': return 'bg-green-100 text-green-800';
      case 'identity': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setLoading(true);
      fetchFiles(currentPage + 1, searchTerm, categoryFilter);
    }
  };

  const handleFileUploaded = () => {
    // Refresh file list after upload
    fetchFiles(1, searchTerm, categoryFilter);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">파일 관리</h1>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            IPFS 분산 저장소
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchFiles(1, searchTerm, categoryFilter)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileIcon className="w-4 h-4" />
            파일 목록
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            파일 업로드
          </TabsTrigger>
          <TabsTrigger value="ipfs" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            IPFS 업로드
          </TabsTrigger>
        </TabsList>

        {/* 파일 목록 탭 */}
        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="파일 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 카테고리</SelectItem>
                    <SelectItem value="general">일반</SelectItem>
                    <SelectItem value="contract">계약서</SelectItem>
                    <SelectItem value="approval">결재</SelectItem>
                    <SelectItem value="identity">신원증명</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Files Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>파일 목록 ({files.length})</span>
                <Badge variant="secondary" className="text-xs">
                  총 {files.length}개 파일
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && files.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">파일을 불러오는 중...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-8">
                  <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">파일이 없습니다</p>
                  <p className="text-sm text-gray-400 mt-2">파일 업로드 탭에서 파일을 업로드해보세요</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>파일</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead>크기</TableHead>
                        <TableHead>IPFS 해시</TableHead>
                        <TableHead>업로드 일시</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {files.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {getFileIcon(file.mimeType)}
                              <div>
                                <p className="font-medium">{file.originalName}</p>
                                <p className="text-sm text-gray-500">{file.mimeType}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(file.category)}>
                              {file.category}
                            </Badge>
                            {file.isPublic && (
                              <Badge variant="outline" className="ml-2">
                                공개
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatFileSize(file.size)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Hash className="h-4 w-4 text-gray-400" />
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {file.ipfsHash.substring(0, 8)}...
                              </code>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{formatDate(file.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(file)}
                                title="파일 다운로드"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(file)}
                                className="text-red-600 hover:text-red-800"
                                title="파일 삭제"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center pt-4">
                      <Button 
                        variant="outline" 
                        onClick={loadMore}
                        disabled={loading}
                      >
                        {loading ? '로딩 중...' : '더 보기'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 파일 업로드 탭 */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                일반 파일 업로드
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload onFileUploaded={handleFileUploaded} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* IPFS 업로드 탭 */}
        <TabsContent value="ipfs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                IPFS 분산 저장소 업로드
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Globe className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">IPFS란?</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        IPFS(InterPlanetary File System)는 분산형 파일 시스템으로, 
                        파일을 전 세계에 분산 저장하여 안전하고 영구적인 파일 보관을 제공합니다.
                      </p>
                      <ul className="text-sm text-blue-600 mt-2 space-y-1">
                        <li>• 탈중앙화된 파일 저장</li>
                        <li>• 콘텐츠 기반 주소 지정</li>
                        <li>• 버전 관리 및 중복 제거</li>
                        <li>• 검열 저항성</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <IPFSUploader onFileUploaded={handleFileUploaded} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FilesPage;