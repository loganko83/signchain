import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import UploadModal from "@/components/upload-modal";
import AuditTrail from "@/components/audit-trail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth.tsx";
import { Plus, Search, FileText, CheckCircle, Clock, Shield, Download, Eye, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Document } from "@shared/schema";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Documents() {
  const { user } = useAuth();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
    queryFn: async () => {
      const response = await fetch(`/api/documents?userId=${user?.id}`);
      if (!response.ok) throw new Error("문서를 가져올 수 없습니다");
      return response.json();
    },
    enabled: !!user,
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return 'text-red-500';
    if (fileType.includes('word')) return 'text-blue-500';
    if (fileType.includes('excel')) return 'text-green-500';
    if (fileType.includes('image')) return 'text-purple-500';
    return 'text-gray-500';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "서명 완료":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />완료</Badge>;
      case "서명 대기":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />대기</Badge>;
      case "업로드됨":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">업로드됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewAudit = (documentId: number) => {
    setSelectedDocumentId(documentId);
    setAuditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">문서 관리</h1>
              <p className="mt-2 text-sm text-gray-600">
                업로드된 문서를 관리하고 서명 상태를 확인하세요
              </p>
            </div>
            <Button onClick={() => setUploadModalOpen(true)} className="mt-4 sm:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              문서 업로드
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="문서 제목으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="업로드됨">업로드됨</SelectItem>
                  <SelectItem value="서명 대기">서명 대기</SelectItem>
                  <SelectItem value="서명 완료">서명 완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">문서를 불러오는 중...</p>
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className={`w-6 h-6 ${getFileIcon(document.fileType)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {document.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>카테고리: {document.category}</span>
                          <span>우선순위: {document.priority}</span>
                          <span>크기: {(document.fileSize / 1024).toFixed(1)} KB</span>
                        </div>
                        {document.description && (
                          <p className="text-sm text-gray-600 mt-2">{document.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(document.status)}
                      <span className="text-sm text-gray-400">
                        {document.createdAt ? new Date(document.createdAt).toLocaleDateString('ko-KR') : ''}
                      </span>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            문서 보기
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            다운로드
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewAudit(document.id)}>
                            <Shield className="w-4 h-4 mr-2" />
                            감사 추적
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {/* Blockchain Info */}
                  {document.blockchainTxHash && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm">
                        <Shield className="w-4 h-4 text-purple-500" />
                        <span className="font-medium text-purple-900">블록체인 검증됨</span>
                      </div>
                      <div className="mt-1 text-xs text-purple-700 font-mono">
                        트랜잭션: {document.blockchainTxHash.slice(0, 20)}...
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || statusFilter !== "all" ? "검색 결과가 없습니다" : "아직 업로드된 문서가 없습니다"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== "all" 
                  ? "다른 검색어나 필터를 시도해보세요" 
                  : "첫 번째 문서를 업로드하여 시작해보세요"
                }
              </p>
              {(!searchQuery && statusFilter === "all") && (
                <Button onClick={() => setUploadModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  문서 업로드
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <UploadModal 
        open={uploadModalOpen} 
        onOpenChange={setUploadModalOpen}
      />

      {selectedDocumentId && (
        <AuditTrail
          documentId={selectedDocumentId}
          open={auditModalOpen}
          onOpenChange={setAuditModalOpen}
        />
      )}
    </div>
  );
}
