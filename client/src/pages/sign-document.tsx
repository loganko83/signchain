import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import Navigation from "@/components/navigation";
import SignaturePad from "@/components/signature-pad";
import DocumentViewer from "@/components/document-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Signature, Eye, Download, Clock } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generateMockTxHash, generateMockBlockNumber } from "@/lib/blockchain";

interface SignatureRequestData {
  request: any;
  document: any;
}

export default function SignDocument() {
  const { token } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [signatureType, setSignatureType] = useState("draw");
  const [signatureData, setSignatureData] = useState<string>("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const { data, isLoading, error } = useQuery<SignatureRequestData>({
    queryKey: ["/api/signature-requests/token", token],
    queryFn: async () => {
      const response = await fetch(`/api/signature-requests/token/${token}`);
      if (!response.ok) {
        throw new Error("서명 요청을 찾을 수 없습니다");
      }
      return response.json();
    },
    enabled: !!token,
  });

  const signatureMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/signatures", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "서명 완료",
        description: "문서 서명이 완료되고 블록체인에 기록되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/signature-requests/token", token] });
    },
    onError: (error: any) => {
      toast({
        title: "서명 실패",
        description: error.message || "서명 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleCompleteSignature = () => {
    if (!signatureData || !data) {
      toast({
        title: "서명 필요",
        description: "먼저 서명을 작성해주세요.",
        variant: "destructive",
      });
      return;
    }

    signatureMutation.mutate({
      documentId: data.document.id,
      signerId: 1, // Mock user ID
      signerEmail: data.request.signerEmail,
      signatureData,
      signatureType,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">문서를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-24">
          <Alert variant="destructive">
            <AlertDescription>
              서명 요청을 찾을 수 없거나 만료되었습니다.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const { request, document } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">문서 서명</h1>
          <p className="mt-2 text-sm text-gray-600">
            {document.title} 문서의 서명을 요청받았습니다
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document Viewer */}
          <div className="lg:col-span-2">
            <DocumentViewer 
              document={document}
              signatureData={isPreviewMode ? signatureData : undefined}
            />
          </div>

          {/* Signing Tools */}
          <div className="space-y-6">
            {/* Request Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">서명 요청 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">요청자</Label>
                  <p className="text-sm text-gray-900">{request.signerName || request.signerEmail}</p>
                </div>
                {request.message && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">메시지</Label>
                    <p className="text-sm text-gray-900">{request.message}</p>
                  </div>
                )}
                {request.deadline && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">마감일</Label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(request.deadline).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Signature Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">서명 방식</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={signatureType} onValueChange={setSignatureType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="draw" id="draw" />
                    <Label htmlFor="draw">손으로 그리기</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="type" id="type" />
                    <Label htmlFor="type">텍스트 서명</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upload" id="upload" />
                    <Label htmlFor="upload">이미지 업로드</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Signature Pad */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">디지털 서명</CardTitle>
              </CardHeader>
              <CardContent>
                <SignaturePad
                  signatureType={signatureType}
                  onSignatureChange={setSignatureData}
                />
              </CardContent>
            </Card>

            {/* Blockchain Info */}
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-purple-900 mb-2">
                      블록체인 보안
                    </h4>
                    <p className="text-xs text-purple-700 mb-3">
                      서명 시 Xphere 블록체인에 해시값이 기록됩니다
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-purple-600">문서 해시:</span>
                        <span className="text-purple-800 font-mono">
                          {document.fileHash.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-600">타임스탬프:</span>
                        <span className="text-purple-800">
                          {new Date().toLocaleString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                disabled={!signatureData}
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPreviewMode ? "미리보기 끄기" : "서명 미리보기"}
              </Button>
              
              <Button 
                className="w-full"
                onClick={handleCompleteSignature}
                disabled={!signatureData || signatureMutation.isPending}
              >
                <Signature className="w-4 h-4 mr-2" />
                {signatureMutation.isPending ? "서명 처리 중..." : "서명 완료"}
              </Button>
              
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                PDF 다운로드
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
