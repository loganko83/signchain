import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  CheckCircle, 
  Eye, 
  Upload, 
  X, 
  Download,
  AlertCircle,
  Clock,
  User
} from "lucide-react";
import { AuditLog, Document } from "@shared/schema";

interface AuditTrailProps {
  documentId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuditTrail({ documentId, open, onOpenChange }: AuditTrailProps) {
  const { data: document } = useQuery<Document>({
    queryKey: ["/api/documents", documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) throw new Error("문서를 가져올 수 없습니다");
      return response.json();
    },
    enabled: open && !!documentId,
  });

  const { data: auditLogs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit", documentId],
    queryFn: async () => {
      const response = await fetch(`/api/audit/${documentId}`);
      if (!response.ok) throw new Error("감사 로그를 가져올 수 없습니다");
      return response.json();
    },
    enabled: open && !!documentId,
  });

  const handleVerifyBlockchain = async () => {
    try {
      const response = await fetch(`/api/verify/${documentId}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("블록체인 검증에 실패했습니다");
      const verification = await response.json();
      
      // Show verification result
      alert(`블록체인 검증 완료\n유효성: ${verification.isValid ? '검증됨' : '실패'}\n블록 번호: ${verification.blockNumber}`);
    } catch (error) {
      alert("블록체인 검증 중 오류가 발생했습니다");
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "문서 업로드":
        return <Upload className="w-4 h-4 text-purple-500" />;
      case "서명 완료":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "문서 열람":
        return <Eye className="w-4 h-4 text-blue-500" />;
      case "서명 요청 생성":
        return <User className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "문서 업로드":
        return "bg-purple-100";
      case "서명 완료":
        return "bg-green-100";
      case "문서 열람":
        return "bg-blue-100";
      case "서명 요청 생성":
        return "bg-orange-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            블록체인 감사 추적
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 pr-4">
            {/* Document Info */}
            {document && (
              <Card>
                <CardContent className="p-4 bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-3">문서 정보</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">문서명:</span>
                      <span className="ml-2 font-medium">{document.title}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">생성일:</span>
                      <span className="ml-2">
                        {document.createdAt ? new Date(document.createdAt).toLocaleString('ko-KR') : '-'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">문서 해시:</span>
                      <span className="ml-2 font-mono text-xs break-all">{document.fileHash}</span>
                    </div>
                    {document.blockchainTxHash && (
                      <div className="col-span-2">
                        <span className="text-gray-600">블록체인 주소:</span>
                        <span className="ml-2 font-mono text-xs break-all">{document.blockchainTxHash}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Audit Timeline */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">감사 로그</h3>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <p className="mt-2 text-sm text-gray-600">감사 로그를 불러오는 중...</p>
                </div>
              ) : auditLogs.length > 0 ? (
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-4">
                      <div className={`w-8 h-8 ${getActionColor(log.action)} rounded-full flex items-center justify-center flex-shrink-0`}>
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{log.action}</h4>
                              <span className="text-xs text-gray-500">
                                {log.timestamp ? new Date(log.timestamp).toLocaleString('ko-KR') : '-'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{log.description}</p>
                            
                            {/* Metadata */}
                            {log.metadata && (
                              <div className="text-xs text-gray-500 space-y-1">
                                {Object.entries(log.metadata as Record<string, any>).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="font-medium capitalize">{key}:</span>
                                    <span className="font-mono">{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* System Info */}
                            <div className="text-xs text-gray-500 space-y-1 mt-2 pt-2 border-t border-gray-100">
                              {log.ipAddress && (
                                <div className="flex justify-between">
                                  <span className="font-medium">IP 주소:</span>
                                  <span>{log.ipAddress}</span>
                                </div>
                              )}
                              {log.userAgent && (
                                <div className="flex justify-between">
                                  <span className="font-medium">사용자 에이전트:</span>
                                  <span className="truncate max-w-48">{log.userAgent}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">감사 로그가 없습니다.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            감사로그 다운로드
          </Button>
          <Button onClick={handleVerifyBlockchain} className="bg-purple-500 hover:bg-purple-600">
            <Shield className="w-4 h-4 mr-2" />
            블록체인 검증
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
