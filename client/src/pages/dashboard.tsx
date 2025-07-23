import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import UploadModal from "@/components/upload-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth.tsx";
import { getBlockchainStatus } from "@/lib/blockchain";
import { Plus, LayoutTemplate, FileText, CheckCircle, Clock, Shield, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Document, SignatureRequest } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [blockchainStatus, setBlockchainStatus] = useState(getBlockchainStatus());

  // Update blockchain status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockchainStatus(getBlockchainStatus());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
    queryFn: async () => {
      const response = await fetch(`/api/documents?userId=${user?.id}`);
      if (!response.ok) throw new Error("문서를 가져올 수 없습니다");
      return response.json();
    },
    enabled: !!user,
  });

  const { data: signatureRequests = [] } = useQuery<SignatureRequest[]>({
    queryKey: ["/api/signature-requests"],
    queryFn: async () => {
      const response = await fetch(`/api/signature-requests?userId=${user?.id}`);
      if (!response.ok) throw new Error("서명 요청을 가져올 수 없습니다");
      return response.json();
    },
    enabled: !!user,
  });

  const stats = {
    totalDocuments: documents.length,
    completedSignatures: documents.filter(doc => doc.status === "서명 완료").length,
    pendingSignatures: signatureRequests.filter(req => req.status === "대기").length,
    blockchainVerified: "100%",
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return 'fas fa-file-pdf text-red-500';
    if (fileType.includes('word')) return 'fas fa-file-word text-blue-500';
    if (fileType.includes('excel')) return 'fas fa-file-excel text-green-500';
    if (fileType.includes('image')) return 'fas fa-file-image text-purple-500';
    return 'fas fa-file-alt text-gray-500';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
              <p className="mt-2 text-sm text-gray-600">
                블록체인 기반 전자서명으로 안전하게 문서를 관리하세요
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button onClick={() => setUploadModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                문서 업로드
              </Button>
              <Button variant="outline">
                <LayoutTemplate className="w-4 h-4 mr-2" />
                템플릿 사용
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">전체 문서</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm font-medium">+12%</span>
                <span className="text-gray-500 text-sm ml-2">지난 달 대비</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">서명 완료</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedSignatures}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm font-medium">+8%</span>
                <span className="text-gray-500 text-sm ml-2">지난 달 대비</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">서명 대기</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingSignatures}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-yellow-500 text-sm font-medium">2건 급함</span>
                <span className="text-gray-500 text-sm ml-2">오늘 마감</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">블록체인 검증</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.blockchainVerified}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-green-500 text-sm font-medium">Xphere 네트워크</span>
                <span className="text-gray-500 text-sm ml-2">보안 검증됨</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Documents */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">최근 문서</h2>
                <Button variant="ghost" className="text-primary text-sm">전체 보기</Button>
              </div>
              
              <div className="space-y-4">
                {documents.slice(0, 3).map((document) => (
                  <div key={document.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <i className={getFileIcon(document.fileType)}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{document.title}</p>
                      <p className="text-xs text-gray-500">{document.status}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(document.status)}
                      <span className="text-xs text-gray-400">
                        {document.createdAt ? new Date(document.createdAt).toLocaleDateString('ko-KR') : ''}
                      </span>
                    </div>
                  </div>
                ))}
                
                {documents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>아직 업로드된 문서가 없습니다.</p>
                    <Button 
                      variant="ghost" 
                      className="mt-2 text-primary"
                      onClick={() => setUploadModalOpen(true)}
                    >
                      첫 번째 문서 업로드하기
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Signature Requests */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">서명 요청</h2>
                <Button variant="ghost" className="text-primary text-sm">전체 보기</Button>
              </div>
              
              <div className="space-y-4">
                {signatureRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">서명 요청</p>
                        <p className="text-xs text-gray-600 mt-1">
                          수신자: {request.signerEmail}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {request.deadline ? new Date(request.deadline).toLocaleDateString('ko-KR') : '마감일 없음'}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        상세보기
                      </Button>
                    </div>
                  </div>
                ))}

                {signatureRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>진행 중인 서명 요청이 없습니다.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blockchain Status Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-500 to-primary p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Xphere 블록체인 상태</h3>
              <p className="text-purple-100 text-sm mt-2">모든 서명이 블록체인에 안전하게 기록되고 있습니다</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">네트워크 연결됨</span>
              </div>
              <p className="text-sm text-purple-100">블록 높이: <span>{blockchainStatus.blockHeight}</span></p>
              <p className="text-sm text-purple-100">가스비: <span>{blockchainStatus.gasFee}</span></p>
            </div>
          </div>
        </div>
      </div>

      <UploadModal 
        open={uploadModalOpen} 
        onOpenChange={setUploadModalOpen}
      />
    </div>
  );
}
