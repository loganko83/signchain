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
import WorkflowBuilder from "./workflow-builder";
import { CalendarIcon, Send, X, Users, Clock, Workflow, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Document, insertSignatureRequestSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SignatureRequestModalProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SignatureRequestModal({ document, open, onOpenChange }: SignatureRequestModalProps) {
  const [signerEmail, setSignerEmail] = useState("");
  const [signerName, setSignerName] = useState("");
  const [message, setMessage] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [isSequential, setIsSequential] = useState(false);
  const [signatureOrder, setSignatureOrder] = useState(1);
  const [deadlineType, setDeadlineType] = useState<string>("none");
  const [useWorkflow, setUseWorkflow] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [workflowBuilderOpen, setWorkflowBuilderOpen] = useState(false);
  const { toast } = useToast();

  const { data: workflowTemplates = [] } = useQuery({
    queryKey: ["/api/workflow-templates"],
    queryFn: async () => {
      const response = await fetch("/api/workflow-templates?userId=1"); // Should use current user
      if (!response.ok) throw new Error("템플릿을 가져올 수 없습니다");
      return response.json();
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: {
      documentId: number;
      requesterId: number;
      signerEmail: string;
      signerName?: string;
      message?: string;
      deadline?: Date;
    }) => {
      return apiRequest("/api/signature-requests", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/signature-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "서명 요청 전송 완료",
        description: "서명 요청이 성공적으로 전송되었습니다.",
      });
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

  const resetForm = () => {
    setSignerEmail("");
    setSignerName("");
    setMessage("");
    setDeadline(undefined);
    setIsSequential(false);
    setSignatureOrder(1);
    setDeadlineType("none");
    setUseWorkflow(false);
    setSelectedTemplate("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        requesterId: 1, // This should come from current user context
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            서명 요청 보내기
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Document Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-muted-foreground">문서</div>
            <div className="font-semibold">{document.title}</div>
          </div>

          {/* Signer Email */}
          <div>
            <Label htmlFor="signerEmail">서명자 이메일 *</Label>
            <Input
              id="signerEmail"
              type="email"
              value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
              placeholder="signer@example.com"
              required
            />
          </div>

          {/* Signer Name */}
          <div>
            <Label htmlFor="signerName">서명자 이름 (선택사항)</Label>
            <Input
              id="signerName"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="홍길동"
            />
          </div>

          {/* Workflow Options */}
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">순차 서명</Label>
                <p className="text-xs text-muted-foreground">서명자들이 순서대로 서명하도록 설정</p>
              </div>
              <Switch checked={isSequential} onCheckedChange={setIsSequential} />
            </div>
            
            {isSequential && (
              <div>
                <Label htmlFor="signatureOrder">서명 순서</Label>
                <Select value={signatureOrder.toString()} onValueChange={(value) => setSignatureOrder(parseInt(value))}>
                  <SelectTrigger>
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1번째 서명자</SelectItem>
                    <SelectItem value="2">2번째 서명자</SelectItem>
                    <SelectItem value="3">3번째 서명자</SelectItem>
                    <SelectItem value="4">4번째 서명자</SelectItem>
                    <SelectItem value="5">5번째 서명자</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Deadline */}
          <div>
            <Label>서명 마감일</Label>
            <Select value={deadlineType} onValueChange={setDeadlineType}>
              <SelectTrigger>
                <Clock className="h-4 w-4 mr-2" />
                <SelectValue placeholder="마감일 설정" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">마감일 없음</SelectItem>
                <SelectItem value="3days">3일 후</SelectItem>
                <SelectItem value="1week">1주일 후</SelectItem>
                <SelectItem value="2weeks">2주일 후</SelectItem>
                <SelectItem value="1month">1개월 후</SelectItem>
                <SelectItem value="custom">직접 설정</SelectItem>
              </SelectContent>
            </Select>
            
            {deadlineType === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-2",
                      !deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : "마감일 선택"}
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
            
            {deadlineType !== "none" && deadlineType !== "custom" && (
              <p className="text-sm text-muted-foreground mt-1">
                마감일: {(() => {
                  const days = deadlineType === "3days" ? 3 : deadlineType === "1week" ? 7 : deadlineType === "2weeks" ? 14 : 30;
                  const date = new Date();
                  date.setDate(date.getDate() + days);
                  return date.toLocaleDateString('ko-KR');
                })()}
              </p>
            )}
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

          {/* Security Notice */}
          <Alert>
            <AlertDescription className="text-sm">
              서명 링크가 이메일로 전송되며, 블록체인에 영구 기록됩니다.
            </AlertDescription>
          </Alert>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={createRequestMutation.isPending}
            >
              {createRequestMutation.isPending ? (
                "전송 중..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  서명 요청 전송
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}