import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  Shield, 
  CheckCircle, 
  Clock, 
  FileText, 
  Hash, 
  ExternalLink,
  Verified,
  Users
} from "lucide-react";
import { Document, Signature, AuditLog } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DocumentViewerProps {
  document: Document;
}

export default function DocumentViewer({ document }: DocumentViewerProps) {
  const [verifying, setVerifying] = useState(false);
  const { toast } = useToast();

  // Fetch signatures for this document
  const { data: signatures = [] } = useQuery<Signature[]>({
    queryKey: ["/api/signatures", document.id],
    queryFn: async () => {
      const response = await fetch(`/api/signatures?documentId=${document.id}`);
      if (!response.ok) throw new Error("서명 정보를 가져올 수 없습니다");
      return response.json();
    },
  });

  // Fetch audit logs
  const { data: auditLogs = [] } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit", document.id],
    queryFn: async () => {
      const response = await fetch(`/api/audit/${document.id}`);
      if (!response.ok) throw new Error("감사 로그를 가져올 수 없습니다");
      return response.json();
    },
  });

  const verifyDocumentMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/verify/${document.id}`, "POST");
    },
    onSuccess: (verification: any) => {
      toast({
        title: "블록체인 검증 완료",
        description: verification.isValid ? "문서가 블록체인에서 성공적으로 검증되었습니다." : "문서 검증에 실패했습니다.",
      });
    },
    onError: () => {
      toast({
        title: "검증 실패",
        description: "블록체인 검증 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleDownload = () => {
    // Mock download functionality
    const link = globalThis.document.createElement('a');
    link.href = `data:application/pdf;base64,${btoa('Mock PDF content for ' + document.title)}`;
    link.download = document.title + '.pdf';
    link.click();
    
    toast({
      title: "다운로드 시작",
      description: `${document.title} 파일 다운로드를 시작합니다.`,
    });
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await verifyDocumentMutation.mutateAsync();
    } finally {
      setVerifying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "서명 완료": return "bg-green-100 text-green-800";
      case "서명 대기": return "bg-yellow-100 text-yellow-800";
      case "업로드됨": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Document Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {document.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                업로드: {document.createdAt ? new Date(document.createdAt).toLocaleString('ko-KR') : ''}
              </p>
            </div>
            <Badge className={getStatusColor(document.status)}>
              {document.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">파일 타입</p>
              <p className="text-sm">{document.fileType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">파일 크기</p>
              <p className="text-sm">{document.fileSize ? `${Math.round(document.fileSize / 1024)} KB` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">IPFS 해시</p>
              <p className="text-xs font-mono bg-gray-100 p-1 rounded">{document.ipfsHash}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">파일 해시</p>
              <p className="text-xs font-mono bg-gray-100 p-1 rounded">{document.fileHash}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              다운로드
            </Button>
            <Button 
              onClick={handleVerify} 
              variant="outline"
              disabled={verifying}
            >
              <Shield className="h-4 w-4 mr-2" />
              {verifying ? "검증 중..." : "블록체인 검증"}
            </Button>
            {document.blockchainTxHash && (
              <Button variant="outline" asChild>
                <a href={`https://explorer.xphere.io/tx/${document.blockchainTxHash}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  블록체인 탐색기
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Signatures Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            디지털 서명 ({signatures.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {signatures.length > 0 ? (
            <div className="space-y-4">
              {signatures.map((signature) => (
                <div key={signature.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{signature.signerEmail}</p>
                      <p className="text-sm text-muted-foreground">
                        {signature.signedAt ? new Date(signature.signedAt).toLocaleString('ko-KR') : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <Verified className="h-3 w-3 mr-1" />
                      검증됨
                    </Badge>
                    {signature.blockchainTxHash && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {signature.blockchainTxHash.slice(0, 12)}...
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                아직 서명이 완료되지 않았습니다.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Blockchain Verification */}
      {document.blockchainTxHash && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              블록체인 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">트랜잭션 해시</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded">{document.blockchainTxHash}</p>
              </div>
              <Alert className="bg-green-50 border-green-200">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  이 문서는 Xphere 블록체인에 영구적으로 기록되어 변조가 불가능합니다.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            감사 추적 ({auditLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditLogs.length > 0 ? (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 border-l-2 border-blue-200 bg-blue-50">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('ko-KR') : ''}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                    {log.ipAddress && (
                      <p className="text-xs text-muted-foreground mt-1">IP: {log.ipAddress}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">감사 로그가 없습니다.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}