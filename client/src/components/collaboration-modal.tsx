import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import WorkflowBuilder from "./workflow-builder";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { 
  CalendarIcon, 
  Send, 
  X, 
  Users, 
  Clock, 
  Workflow, 
  Plus,
  FileSignature,
  CheckCircle2,
  AlertCircle,
  Settings
} from "lucide-react";

interface Document {
  id: number;
  title: string;
  fileName: string;
  fileType: string;
}

interface CollaborationModalProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CollaborationModal({ document, open, onOpenChange }: CollaborationModalProps) {
  const { user } = useAuth();
  // Single signature form state
  const [signerEmail, setSignerEmail] = useState("");
  const [signerName, setSignerName] = useState("");
  const [message, setMessage] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [isSequential, setIsSequential] = useState(false);
  const [signatureOrder, setSignatureOrder] = useState(1);
  const [deadlineType, setDeadlineType] = useState<string>("none");

  // Workflow state
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [workflowBuilderOpen, setWorkflowBuilderOpen] = useState(false);
  
  const { toast } = useToast();

  // Fetch workflow templates
  const { data: workflowTemplates = [] } = useQuery({
    queryKey: ["/api/workflow-templates"],
    queryFn: async () => {
      // TODO: SECURITY - Get current user ID from auth context instead of hardcoded value
      // This should be replaced with proper authentication context
      const currentUserId = 1; // TEMPORARY HARDCODED - REPLACE WITH AUTH CONTEXT
      const response = await fetch(`/api/workflow-templates?userId=${currentUserId}`);
      if (!response.ok) throw new Error("템플릿을 가져올 수 없습니다");
      return response.json();
    },
  });

  // Single signature request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/signature-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("서명 요청 전송에 실패했습니다");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "서명 요청 전송 완료",
        description: "서명자에게 이메일로 요청이 전송되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/signature-requests", document.id] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "서명 요청 실패",
        description: error.message || "서명 요청 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Workflow creation mutation
  const createWorkflowMutation = useMutation({
    mutationFn: async (data: { templateId: number; documentId: number; requesterId: number }) => {
      const response = await fetch("/api/workflows/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("워크플로우 생성에 실패했습니다");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "워크플로우 시작",
        description: "협업 워크플로우가 성공적으로 시작되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/signature-requests", document.id] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "워크플로우 생성 실패",
        description: error.message || "워크플로우 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSignerEmail("");
    setSignerName("");
    setMessage("");
    setDeadline(undefined);
    setIsSequential(false);
    setSignatureOrder(1);
    setDeadlineType("none");
    setSelectedTemplate("");
  };

  const handleSingleSignatureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signerEmail.trim()) {
      toast({
        title: "필수 입력",
        description: "서명자 이메일을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // Calculate deadline based on type
    let finalDeadline = deadline;
    if (deadlineType !== "none" && deadlineType !== "custom") {
      const days = deadlineType === "3days" ? 3 : deadlineType === "1week" ? 7 : deadlineType === "2weeks" ? 14 : 30;
      finalDeadline = new Date();
      finalDeadline.setDate(finalDeadline.getDate() + days);
    }

    try {
      await createRequestMutation.mutateAsync({
        documentId: document.id,
        requesterId: user?.id || 0, // This should come from current user context
        signerEmail: signerEmail.trim(),
        signerName: signerName.trim() || undefined,
        message: message.trim() || undefined,
        deadline: finalDeadline,
        isSequential,
        signatureOrder,
      });
    } catch (error) {
      console.error("Signature request error:", error);
    }
  };

  const handleWorkflowSubmit = async () => {
    if (!selectedTemplate) {
      toast({
        title: "템플릿 선택 필요",
        description: "워크플로우 템플릿을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createWorkflowMutation.mutateAsync({
        templateId: parseInt(selectedTemplate),
        documentId: document.id,
        requesterId: user?.id || 0, // This should come from current user context
      });
    } catch (error) {
      console.error("Workflow creation error:", error);
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'signer': return <FileSignature className="h-4 w-4" />;
      case 'approver': return <CheckCircle2 className="h-4 w-4" />;
      case 'reviewer': return <Users className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'signer': return 'bg-blue-100 text-blue-800';
      case 'approver': return 'bg-green-100 text-green-800';
      case 'reviewer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              서명 요청 및 협업 워크플로우
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">단일 서명 요청</TabsTrigger>
              <TabsTrigger value="workflow">협업 워크플로우</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    단일 서명 요청
                  </CardTitle>
                  <CardDescription>
                    한 명의 서명자에게 서명 요청을 보냅니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSingleSignatureSubmit} className="space-y-6">
                    {/* Document Info */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground">문서</div>
                      <div className="font-semibold">{document.title}</div>
                    </div>

                    {/* Signer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="signerEmail">서명자 이메일</Label>
                        <Input
                          id="signerEmail"
                          type="email"
                          value={signerEmail}
                          onChange={(e) => setSignerEmail(e.target.value)}
                          placeholder="signer@example.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="signerName">서명자 이름 (선택사항)</Label>
                        <Input
                          id="signerName"
                          value={signerName}
                          onChange={(e) => setSignerName(e.target.value)}
                          placeholder="홍길동"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <Label htmlFor="message">메시지 (선택사항)</Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="서명 요청에 대한 추가 메시지를 입력하세요..."
                        rows={3}
                      />
                    </div>

                    {/* Deadline */}
                    <div className="space-y-3">
                      <Label>서명 마감일</Label>
                      <Select value={deadlineType} onValueChange={setDeadlineType}>
                        <SelectTrigger>
                          <SelectValue placeholder="마감일 설정" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">마감일 없음</SelectItem>
                          <SelectItem value="3days">3일 후</SelectItem>
                          <SelectItem value="1week">1주일 후</SelectItem>
                          <SelectItem value="2weeks">2주일 후</SelectItem>
                          <SelectItem value="1month">1개월 후</SelectItem>
                          <SelectItem value="custom">직접 선택</SelectItem>
                        </SelectContent>
                      </Select>

                      {deadlineType === "custom" && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {deadline ? format(deadline, "PPP", { locale: ko }) : "날짜 선택"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={deadline}
                              onSelect={setDeadline}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>

                    {/* Advanced Options */}
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">순차 서명</Label>
                          <p className="text-xs text-muted-foreground">
                            여러 서명자가 있을 때 순서대로 서명하도록 설정
                          </p>
                        </div>
                        <Switch
                          checked={isSequential}
                          onCheckedChange={setIsSequential}
                        />
                      </div>

                      {isSequential && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="signatureOrder">서명 순서</Label>
                            <Input
                              id="signatureOrder"
                              type="number"
                              min="1"
                              value={signatureOrder}
                              onChange={(e) => setSignatureOrder(parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={createRequestMutation.isPending}
                      >
                        취소
                      </Button>
                      <Button
                        type="submit"
                        disabled={createRequestMutation.isPending}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {createRequestMutation.isPending ? "전송 중..." : "서명 요청 보내기"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="workflow" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    협업 워크플로우
                  </CardTitle>
                  <CardDescription>
                    미리 정의된 템플릿을 사용하여 복잡한 서명 및 승인 프로세스를 관리합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Document Info */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">문서</div>
                    <div className="font-semibold">{document.title}</div>
                  </div>

                  {/* Template Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>워크플로우 템플릿 선택</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setWorkflowBuilderOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        새 템플릿 만들기
                      </Button>
                    </div>

                    {workflowTemplates.length === 0 ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          사용 가능한 워크플로우 템플릿이 없습니다. 새 템플릿을 만들어 보세요.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {workflowTemplates.map((template: any) => (
                          <Card 
                            key={template.id} 
                            className={`cursor-pointer transition-all ${
                              selectedTemplate === template.id.toString() 
                                ? 'ring-2 ring-primary border-primary' 
                                : 'hover:shadow-md'
                            }`}
                            onClick={() => setSelectedTemplate(template.id.toString())}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{template.name}</h4>
                                  {template.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {template.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-muted-foreground">
                                      {template.steps?.steps?.length || 0}개 단계
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {template.steps?.isSequential ? '순차 실행' : '병렬 실행'}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  {template.steps?.steps?.slice(0, 3).map((step: any, index: number) => (
                                    <Badge 
                                      key={index} 
                                      className={`text-xs ${getStepColor(step.type)}`}
                                    >
                                      {getStepIcon(step.type)}
                                    </Badge>
                                  ))}
                                  {template.steps?.steps?.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{template.steps.steps.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Template Preview */}
                  {selectedTemplate && (
                    <div className="space-y-3">
                      <Label>선택된 워크플로우 미리보기</Label>
                      {(() => {
                        const template = workflowTemplates.find((t: any) => t.id.toString() === selectedTemplate);
                        if (!template) return null;
                        
                        return (
                          <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-3">{template.name}</h4>
                              <div className="space-y-2">
                                {template.steps?.steps?.map((step: any, index: number) => (
                                  <div key={index} className="flex items-center gap-3 p-2 bg-white rounded">
                                    <Badge className={getStepColor(step.type)}>
                                      {getStepIcon(step.type)}
                                      <span className="ml-1">단계 {step.order}</span>
                                    </Badge>
                                    <div className="flex-1">
                                      <span className="text-sm font-medium">{step.email}</span>
                                      {step.name && (
                                        <span className="text-sm text-muted-foreground ml-2">({step.name})</span>
                                      )}
                                    </div>
                                    {step.deadline && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {step.deadline}일
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })()}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-3 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={createWorkflowMutation.isPending}
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleWorkflowSubmit}
                      disabled={createWorkflowMutation.isPending || !selectedTemplate}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {createWorkflowMutation.isPending ? "시작 중..." : "워크플로우 시작"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <WorkflowBuilder
        documentId={document.id}
        open={workflowBuilderOpen}
        onOpenChange={setWorkflowBuilderOpen}
        onWorkflowCreated={(workflowId) => {
          // Refresh templates after creating a new one
          queryClient.invalidateQueries({ queryKey: ["/api/workflow-templates"] });
        }}
      />
    </>
  );
}