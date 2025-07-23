import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Shield, Calendar, User, Clock, CheckCircle, PenTool } from "lucide-react";
import { Document, SignatureRequest } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SignaturePad from "@/components/signature-pad";
import { generateFileHash } from "@/lib/crypto";

export default function SignDocument() {
  const [, params] = useRoute("/sign/:token");
  const token = params?.token;
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Get signature request by token
  const { data: signatureRequest, isLoading: requestLoading } = useQuery<SignatureRequest>({
    queryKey: ["/api/signature-requests/token", token],
    queryFn: async () => {
      const response = await fetch(`/api/signature-requests/token/${token}`);
      if (!response.ok) throw new Error("서명 요청을 찾을 수 없습니다");
      return response.json();
    },
    enabled: !!token,
  });

  // Get document details
  const { data: document, isLoading: documentLoading } = useQuery<Document>({
    queryKey: ["/api/documents", signatureRequest?.documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${signatureRequest?.documentId}`);
      if (!response.ok) throw new Error("문서를 가져올 수 없습니다");
      return response.json();
    },
    enabled: !!signatureRequest?.documentId,
  });

  // Create signature mutation
  const createSignatureMutation = useMutation({
    mutationFn: async (data: {
      documentId: number;
      signerId: number;
      signerEmail: string;
      signatureData: string;
      signatureType: "canvas" | "text";
    }) => {
      return apiRequest("/api/signatures", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/signature-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "서명 완료",
        description: "문서에 성공적으로 서명했습니다.",
      });
      setShowSignaturePad(false);
    },
    onError: (error: any) => {
      toast({
        title: "서명 실패",
        description: error.message || "서명 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSignature = async (signatureData: string, signatureType: "canvas" | "text") => {
    if (!signatureRequest || !document) return;

    setIsSubmitting(true);
    try {
      // Generate blockchain transaction hash (mock)
      const blockchainTxHash = `0x${Math.random().toString(16).substr(2, 16)}`;

      await createSignatureMutation.mutateAsync({
        documentId: document.id,
        signerId: 1, // This should come from current user context
        signerEmail: signatureRequest.signerEmail,
        signatureData,
        signatureType,
      });
    } catch (error) {
      console.error("Signature error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (requestLoading || documentLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (!signatureRequest || !document) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            유효하지 않은 서명 링크입니다. 서명 요청을 다시 확인해주세요.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isExpired = signatureRequest.deadline && new Date(signatureRequest.deadline) < new Date();
  const isCompleted = signatureRequest.status === "완료";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <FileText className="h-8 w-8" />
            문서 서명 요청
          </h1>
          <p className="text-muted-foreground">
            다음 문서에 대한 디지털 서명이 요청되었습니다
          </p>
        </div>

        {/* Status Alert */}
        {isCompleted && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              이 문서는 이미 서명이 완료되었습니다.
            </AlertDescription>
          </Alert>
        )}

        {isExpired && !isCompleted && (
          <Alert className="border-red-200 bg-red-50">
            <Clock className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              서명 요청이 만료되었습니다.
            </AlertDescription>
          </Alert>
        )}

        {/* Document Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              문서 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">문서 제목</div>
                <div className="text-lg font-semibold">{document.title}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">파일 크기</div>
                <div>{(document.fileSize / 1024).toFixed(1)} KB</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">파일 형식</div>
                <Badge variant="outline">{document.fileType}</Badge>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">상태</div>
                <Badge variant={document.status === "서명 완료" ? "default" : "secondary"}>
                  {document.status}
                </Badge>
              </div>
            </div>
            {document.description && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">설명</div>
                <div className="text-sm">{document.description}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signature Request Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              서명 요청 상세
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">서명자</div>
                <div>{signatureRequest.signerName || signatureRequest.signerEmail}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">요청 상태</div>
                <Badge variant={isCompleted ? "default" : "secondary"}>
                  {signatureRequest.status}
                </Badge>
              </div>
              {signatureRequest.deadline && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">마감일</div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(signatureRequest.deadline).toLocaleDateString()}
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-muted-foreground">요청일</div>
                <div>{signatureRequest.createdAt ? new Date(signatureRequest.createdAt).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
            {signatureRequest.message && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">메시지</div>
                <div className="text-sm bg-gray-50 p-3 rounded-lg">
                  {signatureRequest.message}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blockchain Security Info */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-blue-800">
              <Shield className="h-5 w-5" />
              <span className="font-medium">블록체인 보안</span>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              이 문서는 블록체인 기술로 보호되어 변조가 불가능하며, 
              서명 후 모든 활동이 분산 원장에 기록됩니다.
            </p>
          </CardContent>
        </Card>

        {/* Sign Button */}
        {!isCompleted && !isExpired && (
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => setShowSignaturePad(true)}
              className="px-8 py-3"
            >
              <PenTool className="h-5 w-5 mr-2" />
              지금 서명하기
            </Button>
          </div>
        )}

        {/* Signature Pad Dialog */}
        <Dialog open={showSignaturePad} onOpenChange={setShowSignaturePad}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>문서 서명</DialogTitle>
            </DialogHeader>
            <SignaturePad
              onSignatureComplete={handleSignature}
              onCancel={() => setShowSignaturePad(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}