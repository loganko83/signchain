import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Users, 
  FileSignature,
  Workflow,
  Mail,
  User
} from "lucide-react";

interface WorkflowStatusProps {
  workflowId: string;
  documentId: number;
}

export default function WorkflowStatus({ workflowId, documentId }: WorkflowStatusProps) {
  const { data: workflowStatus, isLoading } = useQuery({
    queryKey: ["/api/workflows", workflowId, "status"],
    queryFn: async () => {
      const response = await fetch(`/api/workflows/${workflowId}/status`);
      if (!response.ok) throw new Error("워크플로우 상태를 가져올 수 없습니다");
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: signatureRequests = [] } = useQuery({
    queryKey: ["/api/signature-requests", documentId],
    queryFn: async () => {
      const response = await fetch(`/api/signature-requests/document/${documentId}`);
      if (!response.ok) throw new Error("서명 요청을 가져올 수 없습니다");
      return response.json();
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!workflowStatus) {
    return null;
  }

  const workflowRequests = signatureRequests.filter((req: any) => req.workflowId === workflowId);
  const progressPercentage = workflowStatus.total > 0 ? (workflowStatus.completed / workflowStatus.total) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "완료": return "bg-green-100 text-green-800";
      case "승인됨": return "bg-blue-100 text-blue-800";
      case "대기": return "bg-yellow-100 text-yellow-800";
      case "거부됨": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "완료": return <CheckCircle2 className="h-4 w-4" />;
      case "승인됨": return <CheckCircle2 className="h-4 w-4" />;
      case "대기": return <Clock className="h-4 w-4" />;
      case "거부됨": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStepTypeIcon = (approvalRequired: boolean) => {
    return approvalRequired ? <Users className="h-4 w-4" /> : <FileSignature className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          워크플로우 진행 상황
        </CardTitle>
        <CardDescription>
          {workflowStatus.completed}/{workflowStatus.total} 단계 완료
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>진행률</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>

        <Separator />

        {/* Workflow Steps */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            워크플로우 단계
          </h4>
          
          {workflowRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>워크플로우 단계가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workflowRequests
                .sort((a: any, b: any) => a.signatureOrder - b.signatureOrder)
                .map((request: any, index: number) => (
                  <Card key={request.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getStepTypeIcon(request.approvalRequired)}
                            <span className="text-sm font-medium">단계 {request.signatureOrder}</span>
                          </div>
                          <div>
                            <div className="font-medium">{request.signerEmail}</div>
                            {request.signerName && (
                              <div className="text-sm text-muted-foreground">{request.signerName}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {request.deadline && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(request.deadline).toLocaleDateString('ko-KR')}
                            </div>
                          )}
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      {request.approvalRequired && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>승인 필요</span>
                            {request.approvedBy && (
                              <span className="text-green-600">• 승인 완료</span>
                            )}
                            {request.rejectedBy && (
                              <span className="text-red-600">• 거부됨</span>
                            )}
                          </div>
                          {request.rejectionReason && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                              거부 사유: {request.rejectionReason}
                            </div>
                          )}
                        </div>
                      )}

                      {request.message && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm text-muted-foreground">메시지:</div>
                          <div className="text-sm mt-1">{request.message}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>

        {/* Current Step Info */}
        {workflowStatus.currentStep && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                현재 대기 중인 단계
              </h4>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{workflowStatus.currentStep.signerEmail}</div>
                      {workflowStatus.currentStep.signerName && (
                        <div className="text-sm text-muted-foreground">
                          {workflowStatus.currentStep.signerName}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-600">알림 전송됨</span>
                    </div>
                  </div>
                  {workflowStatus.currentStep.deadline && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      마감일: {new Date(workflowStatus.currentStep.deadline).toLocaleDateString('ko-KR')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Completed Status */}
        {workflowStatus.completed === workflowStatus.total && workflowStatus.total > 0 && (
          <>
            <Separator />
            <div className="text-center py-4">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-600" />
              <h4 className="font-medium text-green-600 mb-2">워크플로우 완료!</h4>
              <p className="text-sm text-muted-foreground">
                모든 단계가 성공적으로 완료되었습니다.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}