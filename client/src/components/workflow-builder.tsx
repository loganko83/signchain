import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth, authenticatedFetch } from "../contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  Plus, 
  X, 
  ArrowDown, 
  ArrowUp, 
  Users, 
  FileSignature, 
  CheckCircle2, 
  Clock,
  Settings,
  Trash2
} from "lucide-react";

interface WorkflowStep {
  id: string;
  type: 'signer' | 'approver' | 'reviewer';
  email: string;
  name?: string;
  order: number;
  isRequired: boolean;
  allowParallel: boolean;
  deadline?: string; // in days
}

interface WorkflowBuilderProps {
  documentId?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkflowCreated?: (workflowId: string) => void;
}

export default function WorkflowBuilder({ documentId, open, onOpenChange, onWorkflowCreated }: WorkflowBuilderProps) {
  const { getCurrentUserId } = useAuth();
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [isSequential, setIsSequential] = useState(true);
  const { toast } = useToast();

  const { data: templates = [] } = useQuery({
    queryKey: ["/api/workflow-templates"],
    queryFn: async () => {
      const response = await fetch("/api/workflow-templates");
      if (!response.ok) throw new Error("템플릿을 가져올 수 없습니다");
      return response.json();
    },
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (workflowData: any) => {
      const response = await authenticatedFetch("/api/workflow-templates", {
        method: "POST",
        body: JSON.stringify(workflowData),
      });
      if (!response.ok) throw new Error("워크플로우 생성에 실패했습니다");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "워크플로우 생성 완료",
        description: "새로운 협업 워크플로우가 생성되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-templates"] });
      onWorkflowCreated?.(data.id);
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: "워크플로우 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      type: 'signer',
      email: '',
      name: '',
      order: steps.length + 1,
      isRequired: true,
      allowParallel: !isSequential,
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;
    
    const newSteps = [...steps];
    if (direction === 'up' && stepIndex > 0) {
      [newSteps[stepIndex], newSteps[stepIndex - 1]] = [newSteps[stepIndex - 1], newSteps[stepIndex]];
    } else if (direction === 'down' && stepIndex < steps.length - 1) {
      [newSteps[stepIndex], newSteps[stepIndex + 1]] = [newSteps[stepIndex + 1], newSteps[stepIndex]];
    }
    
    // Update order numbers
    newSteps.forEach((step, index) => {
      step.order = index + 1;
    });
    
    setSteps(newSteps);
  };

  const resetForm = () => {
    setWorkflowName("");
    setWorkflowDescription("");
    setSteps([]);
    setIsSequential(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workflowName.trim()) {
      toast({
        title: "필수 입력",
        description: "워크플로우 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (steps.length === 0) {
      toast({
        title: "단계 필요",
        description: "최소 하나의 워크플로우 단계를 추가해주세요.",
        variant: "destructive",
      });
      return;
    }

    const invalidSteps = steps.filter(step => !step.email.trim());
    if (invalidSteps.length > 0) {
      toast({
        title: "이메일 필수",
        description: "모든 단계에 이메일을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      toast({
        title: "인증 오류",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    await createWorkflowMutation.mutateAsync({
      name: workflowName.trim(),
      description: workflowDescription.trim() || undefined,
      createdBy: currentUserId,
      steps: {
        isSequential,
        steps: steps.map(step => ({
          type: step.type,
          email: step.email.trim(),
          name: step.name?.trim() || undefined,
          order: step.order,
          isRequired: step.isRequired,
          allowParallel: step.allowParallel,
          deadline: step.deadline || undefined,
        }))
      },
    });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            협업 워크플로우 생성
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workflowName">워크플로우 이름</Label>
              <Input
                id="workflowName"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="예: 계약서 승인 워크플로우"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="sequential"
                checked={isSequential}
                onCheckedChange={setIsSequential}
              />
              <Label htmlFor="sequential">순차 실행</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="workflowDescription">설명 (선택사항)</Label>
            <Textarea
              id="workflowDescription"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="워크플로우에 대한 설명을 입력하세요..."
              rows={3}
            />
          </div>

          <Separator />

          {/* Workflow Steps */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">워크플로우 단계</h3>
              <Button type="button" onClick={addStep} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                단계 추가
              </Button>
            </div>

            {steps.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">
                    아직 워크플로우 단계가 없습니다.<br />
                    "단계 추가" 버튼을 클릭하여 시작하세요.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <Card key={step.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={getStepColor(step.type)}>
                            {getStepIcon(step.type)}
                            <span className="ml-1">단계 {step.order}</span>
                          </Badge>
                          <Select 
                            value={step.type} 
                            onValueChange={(value: any) => updateStep(step.id, { type: value })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="signer">서명자</SelectItem>
                              <SelectItem value="approver">승인자</SelectItem>
                              <SelectItem value="reviewer">검토자</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(step.id, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(step.id, 'down')}
                            disabled={index === steps.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(step.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>이메일</Label>
                          <Input
                            value={step.email}
                            onChange={(e) => updateStep(step.id, { email: e.target.value })}
                            placeholder="user@example.com"
                            type="email"
                            required
                          />
                        </div>
                        <div>
                          <Label>이름 (선택사항)</Label>
                          <Input
                            value={step.name || ''}
                            onChange={(e) => updateStep(step.id, { name: e.target.value })}
                            placeholder="홍길동"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={step.isRequired}
                            onCheckedChange={(checked) => updateStep(step.id, { isRequired: checked })}
                          />
                          <Label className="text-sm">필수 단계</Label>
                        </div>
                        
                        {!isSequential && (
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={step.allowParallel}
                              onCheckedChange={(checked) => updateStep(step.id, { allowParallel: checked })}
                            />
                            <Label className="text-sm">병렬 실행 허용</Label>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <Select 
                            value={step.deadline || ''} 
                            onValueChange={(value) => updateStep(step.id, { deadline: value || undefined })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="마감일" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">마감일 없음</SelectItem>
                              <SelectItem value="1">1일</SelectItem>
                              <SelectItem value="3">3일</SelectItem>
                              <SelectItem value="7">1주</SelectItem>
                              <SelectItem value="14">2주</SelectItem>
                              <SelectItem value="30">1개월</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
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
              type="submit"
              disabled={createWorkflowMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {createWorkflowMutation.isPending ? "생성 중..." : "워크플로우 생성"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}