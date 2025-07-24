import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Signature, Shield, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function ContractModule() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [contractData, setContractData] = useState({
    title: "",
    description: "",
    organizationId: ""
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", contractData.title);
      formData.append("description", contractData.description);
      formData.append("uploadedBy", user?.id.toString() || "1");
      if (contractData.organizationId) {
        formData.append("organizationId", contractData.organizationId);
      }

      const response = await fetch("/api/modules/contract/upload", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Contract uploaded:", result);
        // Reset form
        setSelectedFile(null);
        setContractData({ title: "", description: "", organizationId: "" });
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">계약 모듈</h1>
              <p className="text-gray-600">블록체인 기반 계약서 관리 및 전자서명</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Upload className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">계약서 업로드</p>
                    <p className="text-2xl font-bold">블록체인 등록</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Signature className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">전자서명</p>
                    <p className="text-2xl font-bold">서명 요청</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Shield className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">블록체인 검증</p>
                    <p className="text-2xl font-bold">무결성 보장</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">완료 관리</p>
                    <p className="text-2xl font-bold">감사 추적</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>계약서 업로드</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">계약서 제목</Label>
                <Input
                  id="title"
                  value={contractData.title}
                  onChange={(e) => setContractData({...contractData, title: e.target.value})}
                  placeholder="계약서 제목을 입력하세요"
                />
              </div>
              
              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={contractData.description}
                  onChange={(e) => setContractData({...contractData, description: e.target.value})}
                  placeholder="계약서에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="organization">조직 ID (선택사항)</Label>
                <Input
                  id="organization"
                  value={contractData.organizationId}
                  onChange={(e) => setContractData({...contractData, organizationId: e.target.value})}
                  placeholder="조직 ID"
                />
              </div>
              
              <div>
                <Label htmlFor="file">계약서 파일</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    선택된 파일: {selectedFile.name}
                  </p>
                )}
              </div>
              
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !contractData.title || uploading}
                className="w-full"
              >
                {uploading ? "업로드 중..." : "블록체인에 계약서 등록"}
              </Button>
            </CardContent>
          </Card>

          {/* Features Section */}
          <Card>
            <CardHeader>
              <CardTitle>계약 모듈 주요 기능</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">1</Badge>
                  <div>
                    <h4 className="font-semibold">계약서 업로드 및 해시 생성</h4>
                    <p className="text-sm text-gray-600">SHA-256 해시로 문서 무결성 보장</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">2</Badge>
                  <div>
                    <h4 className="font-semibold">블록체인 등록</h4>
                    <p className="text-sm text-gray-600">Ethereum/Polygon 네트워크에 트랜잭션 기록</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">3</Badge>
                  <div>
                    <h4 className="font-semibold">서명 요청 및 처리</h4>
                    <p className="text-sm text-gray-600">이메일 통지 및 전자서명 수집</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">4</Badge>
                  <div>
                    <h4 className="font-semibold">검증 및 감사</h4>
                    <p className="text-sm text-gray-600">블록체인 기반 문서 및 서명 검증</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">기술 스택</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge>Ethereum</Badge>
                  <Badge>Polygon</Badge>
                  <Badge>IPFS</Badge>
                  <Badge>SHA-256</Badge>
                  <Badge>디지털 서명</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Contracts */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>최근 계약서</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>아직 업로드된 계약서가 없습니다.</p>
              <p className="text-sm">첫 번째 계약서를 업로드해보세요.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}