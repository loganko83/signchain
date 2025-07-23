import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import DocumentViewer from "@/components/document-viewer";
import UploadModal from "@/components/upload-modal";
import SignatureRequestModal from "@/components/signature-request-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle, 
  Clock, 
  Send,
  Eye,
  Download
} from "lucide-react";
import { Document } from "@shared/schema";
import { useAuth } from "@/lib/auth.tsx";

export default function Documents() {
  const { user } = useAuth();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [signatureRequestModalOpen, setSignatureRequestModalOpen] = useState(false);
  const [signatureRequestDocument, setSignatureRequestDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
    queryFn: async () => {
      const response = await fetch(`/api/documents?userId=${user?.id}`);
      if (!response.ok) throw new Error("문서를 가져올 수 없습니다");
      return response.json();
    },
    enabled: !!user,
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const handleRequestSignature = (document: Document) => {
    setSignatureRequestDocument(document);
    setSignatureRequestModalOpen(true);
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleDownload = (document: Document) => {
    // Mock download functionality
    const link = globalThis.document.createElement('a');
    link.href = `data:application/pdf;base64,${btoa('Mock PDF content for ' + document.title)}`;
    link.download = document.title + '.pdf';
    link.click();
  };

  if (selectedDocument) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedDocument(null)}
              className="mb-4"
            >
              ← 문서 목록으로 돌아가기
            </Button>
          </div>
          <DocumentViewer document={selectedDocument} />
        </div>
      </div>
    );
  }

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
                블록체인으로 보호되는 안전한 전자문서 관리
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button onClick={() => setUploadModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                문서 업로드
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="문서명으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
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
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{document.title}</h3>
                        <p className="text-sm text-gray-500">{document.fileType}</p>
                      </div>
                    </div>
                    {getStatusBadge(document.status)}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">업로드일:</span>
                      <span>{document.createdAt ? new Date(document.createdAt).toLocaleDateString('ko-KR') : ''}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">크기:</span>
                      <span>{document.fileSize ? `${Math.round(document.fileSize / 1024)} KB` : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleViewDocument(document)}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      보기
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    {document.status !== "서명 완료" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRequestSignature(document)}
                      >
                        <Send className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">문서가 없습니다</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== "all" 
                  ? "검색 조건에 맞는 문서가 없습니다." 
                  : "첫 번째 문서를 업로드해보세요."
                }
              </p>
              <Button onClick={() => setUploadModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                문서 업로드
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <UploadModal 
        open={uploadModalOpen} 
        onOpenChange={setUploadModalOpen}
      />
      
      {signatureRequestDocument && (
        <SignatureRequestModal
          document={signatureRequestDocument}
          open={signatureRequestModalOpen}
          onOpenChange={setSignatureRequestModalOpen}
        />
      )}
    </div>
  );
}